import { GeminiProvider } from '../providers/gemini';
import { MockProvider } from '../providers/mock';
import { AIProvider } from '../providers/base';
import { FallbackAIProvider } from '../providers/fallback_provider';
import { compileAIContext } from '../context/builder';
import { ConfidenceEngine } from '../models/confidence';
import { AIValidators } from './validators';
import { AIResponseFormatter } from './response_formatter';
import { StandardAIResponse } from '../models/response';
import { UserProfile } from '../../types';
import { Career } from '../../career/models';
import { AssessmentResult } from '../../assessment/models';

// Import prompt libraries
import { SUGGEST_CAREER_PROMPT, ANALYZE_CAREER_SKILLS_PROMPT, GENERATE_DISCOVERY_INSIGHTS_PROMPT, GENERATE_READINESS_INSIGHTS_PROMPT } from '../prompt_library/career';
import { ANALYZE_RESUME_PROMPT } from '../prompt_library/resume';
import { GENERATE_ROADMAP_PROMPT } from '../prompt_library/roadmap';
import { MENTOR_CHAT_PROMPT } from '../prompt_library/mentor';
import { EVALUATE_ASSESSMENT_RESPONSE_PROMPT } from '../prompt_library/assessment';
import { SYSTEM_PROMPT } from '../prompt_library/system';
import { GENERATE_DASHBOARD_INSIGHTS_PROMPT } from '../prompt_library/dashboard';
import { ONBOARDING_CHAT_PROMPT } from '../prompt_library/onboarding';
import { ResponseParseError } from '../exceptions';

export enum AIRequestType {
  RESUME_REVIEW = 'RESUME_REVIEW',
  CAREER_ADVICE = 'CAREER_ADVICE',
  ROADMAP_PLANNING = 'ROADMAP_PLANNING',
  INTERVIEW_GUIDANCE = 'INTERVIEW_GUIDANCE',
  DASHBOARD_INSIGHTS = 'DASHBOARD_INSIGHTS',
  LEARNING_RECOMMENDATION = 'LEARNING_RECOMMENDATION'
}

export interface AIOrchestrationRequest {
  requestType: AIRequestType | string;
  profile: UserProfile;
  career?: Career | null;
  assessments?: AssessmentResult[];
  roadmapItems?: any[];
  vaultItems?: any[];
  conversationSummary?: string;
  additionalInputs?: Record<string, any>;
}

export interface UnifiedAIResponse {
  success: boolean;
  requestType: string;
  confidence: number;
  reasoning: string;
  recommendations: any[];
  nextActions: string[];
  metadata: {
    provider: string;
    executionTimeMs: number;
    warnings: string[];
    [key: string]: any;
  };
}

export class AIService {
  private static cache = new Map<string, { response: UnifiedAIResponse; timestamp: number }>();
  private static CACHE_TTL_MS = 60000; // 1 minute TTL
  private static isProduction = process.env.NODE_ENV === 'production';
  private static allowMock = !AIService.isProduction || process.env.ALLOW_MOCK_FALLBACK === 'true';
  private static provider: AIProvider = new FallbackAIProvider();

  public static getProviderStatus() {
    if (this.provider && typeof (this.provider as any).getStatus === 'function') {
      return (this.provider as any).getStatus();
    }
    return [];
  }

  /**
   * Helper to parse JSON output cleanly, stripping markdown enclosures if present.
   */
  /**
   * Helper to parse JSON output cleanly, stripping markdown enclosures and healing malformed syntax.
   */
  /**
   * Helper to parse JSON output cleanly, stripping markdown enclosures and healing malformed syntax.
   */
  private static parseJson(text: string): any {
    let clean = text.trim();
    
    // Remove invalid control/unicode characters
    clean = clean.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    // 1. Strip markdown code block wrappers
    if (clean.startsWith('```json')) {
      clean = clean.substring(7);
    } else if (clean.startsWith('```')) {
      clean = clean.substring(3);
    }
    if (clean.endsWith('```')) {
      clean = clean.substring(0, clean.length - 3);
    }
    clean = clean.trim();

    // 2. Extract first matching brace or bracket if there is surrounding conversational text
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    let startIdx = -1;
    let endIdx = -1;
    
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = clean.lastIndexOf('}');
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = clean.lastIndexOf(']');
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      clean = clean.substring(startIdx, endIdx + 1);
    }

    try {
      return JSON.parse(clean);
    } catch (initialError: any) {
      console.warn(`[AI-PARSER] Initial JSON parse failed. Attempting cleanup/repair. Error: ${initialError.message}`);
      
      // Try to clean up the string using highly safe regexes first (for minor syntax issues in closed JSON)
      try {
        let cleaned = clean;

        // A. Convert single quotes to double quotes (outside of double quotes)
        cleaned = cleaned.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');

        // B. Fix missing/broken quotes around keys (e.g. key: -> "key":, key": -> "key":)
        cleaned = cleaned.replace(/([{,]\s*)(['"]?)([\w\.\-]+)\s*(['"]?\s*:)/g, (match, prefix, startQuote, key, suffix) => {
          return prefix + '"' + key + '":';
        });

        // C. Clean all trailing commas globally (before } or ])
        cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

        return JSON.parse(cleaned);
      } catch (cleanError: any) {
        console.warn(`[AI-PARSER] Basic regex cleanup failed. Attempting truncation repair. Error: ${cleanError.message}`);

        // If basic cleanup fails, it might be due to truncation (unclosed braces/brackets/quotes).
        // Let's run truncation repair and then do the cleanup on the repaired string!
        try {
          // 1. Repair truncation
          let repaired = AIService.repairTruncatedJson(clean);

          // 2. Apply the same cleanups on the repaired string
          repaired = repaired.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
          repaired = repaired.replace(/([{,]\s*)(['"]?)([\w\.\-]+)\s*(['"]?\s*:)/g, (match, prefix, startQuote, key, suffix) => {
            return prefix + '"' + key + '":';
          });
          repaired = repaired.replace(/,\s*([}\]])/g, '$1');

          return JSON.parse(repaired);
        } catch (repairError: any) {
          console.error('[AI-PARSER] All JSON parsing and repair attempts failed. Returning fallback empty object.');
          return {};
        }
      }
    }
  }

  /**
   * Helper to safely execute a JSON-returning AI request with retries and schema validations.
   */
  private static async executeJsonRequest<T>(
    prompt: string,
    validator: (obj: any) => boolean,
    fallback: T,
    actionName: string
  ): Promise<T> {
    const strictPrompt = prompt + "\n\nIMPORTANT: Your response must be strictly a valid JSON object or array. Do NOT wrap your response in markdown code blocks (such as ```json). Do NOT add comments, explanations, or any extra prose. Output ONLY the raw JSON.";
    
    let text = '';
    try {
      text = await this.provider.generateText(strictPrompt, SYSTEM_PROMPT, true);
    } catch (err: any) {
      console.warn(`[AI-RESPONSE-PIPELINE] Initial model call failed for ${actionName}: ${err.message}. Retrying once...`);
      try {
        text = await this.provider.generateText(strictPrompt, SYSTEM_PROMPT, true);
      } catch (retryErr: any) {
        console.error(`[AI-RESPONSE-PIPELINE] Retry model call failed for ${actionName}: ${retryErr.message}. Returning fallback.`);
        return fallback;
      }
    }

    let parsed: any;
    try {
      parsed = this.parseJson(text);
    } catch (parseErr: any) {
      console.warn(`[AI-RESPONSE-PIPELINE] Initial JSON parse failed for ${actionName}: ${parseErr.message}. Retrying once with strict repair prompt...`);
      try {
        const repairPrompt = `You are a JSON repair assistant. The following output failed to parse as JSON. Fix any trailing commas, malformed keys, invalid quotes, or unclosed braces/brackets, and return ONLY the corrected, valid JSON. No explanations, no markdown wrappers, no code blocks.\n\nInput Content:\n${text}`;
        const repairedText = await this.provider.generateText(repairPrompt, SYSTEM_PROMPT, true);
        parsed = this.parseJson(repairedText);
      } catch (repairErr: any) {
        console.error(`[AI-RESPONSE-PIPELINE] JSON repair failed for ${actionName}: ${repairErr.message}. Returning fallback.`);
        return fallback;
      }
    }

    // Validate Schema
    if (validator(parsed)) {
      return parsed as T;
    }

    console.warn(`[AI-RESPONSE-PIPELINE] Schema validation failed for ${actionName}. Retrying once with strict repair prompt...`);
    try {
      const schemaRepairPrompt = `The output you provided did not match the expected schema/keys. Correct the output so it is strictly valid JSON matching the schema requirements.\n\nInput Content:\n${JSON.stringify(parsed)}`;
      const schemaRepairedText = await this.provider.generateText(schemaRepairPrompt, SYSTEM_PROMPT, true);
      const repairedParsed = this.parseJson(schemaRepairedText);
      if (validator(repairedParsed)) {
        return repairedParsed as T;
      }
    } catch (schemaErr: any) {
      console.error(`[AI-RESPONSE-PIPELINE] Schema repair failed for ${actionName}: ${schemaErr.message}. Returning fallback.`);
    }
    
    console.error(`[AI-RESPONSE-PIPELINE] Schema validation failed again for ${actionName}. Returning fallback.`);
    return fallback;
  }

  /**
   * Helper to close open braces/brackets/quotes in truncated JSON strings.
   */
  private static repairTruncatedJson(jsonStr: string): string {
    let inString = false;
    let escape = false;
    const stack: string[] = [];

    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') {
          stack.push('}');
        } else if (char === '[') {
          stack.push(']');
        } else if (char === '}') {
          if (stack[stack.length - 1] === '}') {
            stack.pop();
          }
        } else if (char === ']') {
          if (stack[stack.length - 1] === ']') {
            stack.pop();
          }
        }
      }
    }

    let repaired = jsonStr;
    if (inString) {
      repaired += '"';
    }
    
    repaired = repaired.trim();
    while (repaired.endsWith(',') || repaired.endsWith(':')) {
      repaired = repaired.slice(0, -1).trim();
    }

    while (stack.length > 0) {
      const closing = stack.pop();
      repaired += closing;
    }

    return repaired;
  }

  /**
   * Logs execution metrics.
   */
  private static logExecution(
    promptType: string,
    executionTimeMs: number,
    success: boolean,
    errorMessage?: string
  ): void {
    console.log(`[AI-LOG] PromptType: ${promptType} | Provider: ${this.provider.name} | ExecutionTime: ${executionTimeMs}ms | Success: ${success}${errorMessage ? ` | Error: ${errorMessage}` : ''}`);
  }

  /**
   * Helper to construct dummy profile for isolated calls.
   */
  private static makeDummyProfile(aboutMe: string): UserProfile {
    return {
      name: 'Anonymous',
      aboutMe,
      interests: [],
      favoriteSubjects: '',
      country: '',
      expectedSalary: '',
      workPreference: 'Remote',
      selectedCareer: '',
      status: null,
      professionalDetails: { jobTitle: '', yearsOfExperience: '', currentSkills: '', industry: '' },
      education: { degree: '', collegeName: '', cgpa: '', graduationYear: '', internshipExperience: '', languagesKnown: '' },
      skills: [],
      certifications: [],
      projects: { githubUrl: '', projectLinks: '', portfolioUrl: '', description: '' },
      resume: { method: null, strengths: [], weaknesses: [], missingSkills: [] },
      timeAvailability: { hoursPerDay: '0', daysPerWeek: '0', targetMonths: '0', preferredStudyTime: 'Morning' }
    };
  }

  /**
   * Generates career suggestion options.
   */
  public static async suggestCareers(
    aboutMe: string
  ): Promise<StandardAIResponse<string[]>> {
    const startTime = Date.now();
    const profile = this.makeDummyProfile(aboutMe);
    const warnings = AIValidators.auditContext(profile, null, []);
    const confidence = ConfidenceEngine.calculate(profile, null, []);

    const prompt = SUGGEST_CAREER_PROMPT(aboutMe, 'practical learning');
    const data = await this.executeJsonRequest<string[]>(
      prompt,
      (obj) => Array.isArray(obj) && obj.length > 0 && obj.every(x => typeof x === 'string'),
      ["UI_UX_DESIGNER", "ML_ENGINEER", "BACKEND_ENGINEER", "FRONTEND_ENGINEER", "DATA_SCIENTIST"],
      'SuggestCareers'
    );

    const execTime = Date.now() - startTime;
    this.logExecution('SuggestCareers', execTime, true);
    const response = AIResponseFormatter.createSuccess(
      data,
      this.provider.name,
      execTime,
      confidence,
      warnings,
      'Review these suggestions and select your target track in the catalog.'
    );
    (response as any).recommendation = data;
    return response;
  }

  /**
   * Extracts essential skill topics configured for a career.
   */
  public static async getCareerSkills(
    careerTitle: string
  ): Promise<StandardAIResponse<string[]>> {
    const startTime = Date.now();
    const profile = this.makeDummyProfile('');
    profile.selectedCareer = careerTitle;
    const warnings = AIValidators.auditContext(profile, null, []);
    const confidence = ConfidenceEngine.calculate(profile, null, []);

    const prompt = ANALYZE_CAREER_SKILLS_PROMPT(careerTitle);
    const data = await this.executeJsonRequest<string[]>(
      prompt,
      (obj) => Array.isArray(obj) && obj.length > 0 && obj.every(x => typeof x === 'string'),
      ["Problem Solving", "Collaboration", "Engineering Standards", "System Design", "Agile Methodology"],
      'GetCareerSkills'
    );

    const execTime = Date.now() - startTime;
    this.logExecution('GetCareerSkills', execTime, true);
    const response = AIResponseFormatter.createSuccess(
      data,
      this.provider.name,
      execTime,
      confidence,
      warnings,
      'Add these recommended skills to your profile to track readiness.'
    );
    (response as any).recommendation = data;
    return response;
  }

  /**
   * Performs resume compatibility checking.
   */
  public static async analyzeResume(
    profile: UserProfile,
    _method: 'upload' | 'generate'
  ): Promise<StandardAIResponse<{ atsScore: number; strengths: string[]; weaknesses: string[]; missingSkills: string[] }>> {
    const startTime = Date.now();
    const warnings = AIValidators.auditContext(profile, null, []);
    const confidence = ConfidenceEngine.calculate(profile, null, []);

    // compile user context details as simulated resume text
    const simulatedText = `Candidate Biography: ${profile.aboutMe || 'N/A'}
Education Degree: ${profile.education?.degree || 'N/A'}
Self-rated Skills: ${(profile.skills || []).join(', ')}`;

    const prompt = ANALYZE_RESUME_PROMPT(simulatedText, profile.selectedCareer || 'Technology Roles');
    const data = await this.executeJsonRequest<{ atsScore: number; strengths: string[]; weaknesses: string[]; missingSkills: string[] }>(
      prompt,
      (obj) => obj && typeof obj === 'object' && typeof obj.atsScore === 'number',
      { atsScore: 65, strengths: ["Technical skills"], weaknesses: ["Lack of certifications"], missingSkills: [] },
      'AnalyzeResume'
    );

    const execTime = Date.now() - startTime;
    this.logExecution('AnalyzeResume', execTime, true);
    
    const response = AIResponseFormatter.createSuccess(
      data,
      this.provider.name,
      execTime,
      confidence,
      warnings,
      'Integrate missing keywords to boost your ATS compatibility score.',
      ['Add missing tools to your projects section', 'Format achievements with metric outcomes']
    );
    
    (response as any).recommendation = data;
    return response;
  }

  /**
   * Generates custom learning roadmaps.
   */
  public static async generateRoadmap(
    profile: UserProfile
  ): Promise<StandardAIResponse<any[]>> {
    const startTime = Date.now();
    const warnings = AIValidators.auditContext(profile, null, []);
    const confidence = ConfidenceEngine.calculate(profile, null, []);

    const contextBlock = compileAIContext(profile, null, []);
    const prompt = GENERATE_ROADMAP_PROMPT(contextBlock.preferencesContext, profile.selectedCareer || 'General Developer');
    const data = await this.executeJsonRequest<any[]>(
      prompt,
      (obj) => Array.isArray(obj) && obj.length > 0,
      [ { milestoneId: "1", title: "Foundations", description: "Learn fundamentals", durationWeeks: 4, tasks: ["Introduction"] } ],
      'GenerateRoadmap'
    );

    const execTime = Date.now() - startTime;
    this.logExecution('GenerateRoadmap', execTime, true);
    
    const response = AIResponseFormatter.createSuccess(
      data,
      this.provider.name,
      execTime,
      confidence,
      warnings,
      'Follow this milestone layout to reach your career goal.',
      ['Start with the Foundations milestone', 'Run skill challenges to lock progress status']
    );
    (response as any).recommendation = data;
    return response;
  }

  /**
   * Executes AI mentor conversation generations.
   */
  public static async generateMentorReply(
    profile: UserProfile,
    chatMessages: any[],
    userMessage: string
  ): Promise<StandardAIResponse<string>> {
    const startTime = Date.now();
    const warnings = AIValidators.auditContext(profile, null, []);
    const confidence = ConfidenceEngine.calculate(profile, null, []);

    try {
      const contextBlock = compileAIContext(profile, null, []);
      
      const historyLines = chatMessages.slice(-3).map(m => 
        `${m.sender === 'user' ? 'Candidate' : 'AI Mentor'}: ${m.text}`
      );
      const historyText = historyLines.join('\n');

      const prompt = MENTOR_CHAT_PROMPT(contextBlock.compiledText, historyText, userMessage);
      const reply = await this.provider.generateText(prompt, SYSTEM_PROMPT, false);

      const execTime = Date.now() - startTime;
      this.logExecution('ChatResponse', execTime, true);
      
      const response = AIResponseFormatter.createSuccess(
        reply,
        this.provider.name,
        execTime,
        confidence,
        warnings,
        'Continue chat with your mentor.'
      );
      (response as any).recommendation = reply;
      return response;
    } catch (error: any) {
      const execTime = Date.now() - startTime;
      this.logExecution('ChatResponse', execTime, false, error.message);
      throw error;
    }
  }

  /**
   * Evaluates candidate responses to technical assessments.
   */
  public static async evaluateInterview(
    question: string,
    candidateAnswer: string
  ): Promise<StandardAIResponse<{ score: string; comment: string }>> {
    const startTime = Date.now();

    const prompt = EVALUATE_ASSESSMENT_RESPONSE_PROMPT(question, candidateAnswer);
    const data = await this.executeJsonRequest<{ score: string; comment: string }>(
      prompt,
      (obj) => obj && typeof obj === 'object' && (typeof obj.score === 'string' || typeof obj.score === 'number'),
      { score: "7", comment: "Candidate demonstrated basic understanding." },
      'EvaluateChallenge'
    );

    const execTime = Date.now() - startTime;
    this.logExecution('EvaluateChallenge', execTime, true);
    
    const response = AIResponseFormatter.createSuccess(
      data,
      this.provider.name,
      execTime,
      'High',
      [],
      'Review constructive feedback to polish your skills.'
    );
    (response as any).recommendation = data;
    return response;
  }

  /**
   * Generates AI discovery insights based on profile and recommendations.
   */
  public static async generateDiscoveryInsights(
    profile: UserProfile,
    topCareers: any[]
  ): Promise<StandardAIResponse<any>> {
    const startTime = Date.now();
    const warnings = AIValidators.auditContext(profile, null, []);
    const confidence = ConfidenceEngine.calculate(profile, null, []);

    const profileSummary = `Name: ${profile.name}
Bio: ${profile.aboutMe}
Education: ${profile.education?.degree || 'N/A'}
Skills: ${(profile.skills || []).join(', ')}`;

    const careersSummary = topCareers.map(c =>
      `- Career: ${c.careerName} (Match: ${c.matchScore.overallMatch}%, Missing Skills: ${c.missingSkills.join(', ')})`
    ).join('\n');

    const prompt = GENERATE_DISCOVERY_INSIGHTS_PROMPT(profileSummary, careersSummary);
    const data = await this.executeJsonRequest<any>(
      prompt,
      (obj) => obj && typeof obj === 'object',
      { recommendedCareers: [], rationale: "Discovery completed successfully." },
      'GenerateDiscoveryInsights'
    );

    const execTime = Date.now() - startTime;
    this.logExecution('GenerateDiscoveryInsights', execTime, true);

    const response = AIResponseFormatter.createSuccess(
      data,
      this.provider.name,
      execTime,
      confidence,
      warnings,
      'Implement the suggested improvement plans to increase job readiness.'
    );
    (response as any).recommendation = data;
    return response;
  }

  /**
   * Generates AI career readiness insights.
   */
  public static async generateReadinessInsights(
    profile: UserProfile,
    careerTitle: string,
    categoryScores: any
  ): Promise<StandardAIResponse<any>> {
    const startTime = Date.now();
    const warnings = AIValidators.auditContext(profile, null, []);
    const confidence = ConfidenceEngine.calculate(profile, null, []);

    const profileSummary = `Name: ${profile.name}
Bio: ${profile.aboutMe}
Education: ${profile.education?.degree || 'N/A'}
Skills: ${(profile.skills || []).join(', ')}`;

    const scoresText = JSON.stringify(categoryScores, null, 2);

    const prompt = GENERATE_READINESS_INSIGHTS_PROMPT(profileSummary, careerTitle, scoresText);
    const data = await this.executeJsonRequest<any>(
      prompt,
      (obj) => obj && typeof obj === 'object',
      { priorityTasks: ["Complete career profile detail fields"] },
      'GenerateReadinessInsights'
    );

    const execTime = Date.now() - startTime;
    this.logExecution('GenerateReadinessInsights', execTime, true);

    const response = AIResponseFormatter.createSuccess(
      data,
      this.provider.name,
      execTime,
      confidence,
      warnings,
      'Follow priority tasks list to achieve target career status.'
    );
    (response as any).recommendation = data;
    return response;
  }

  /**
   * Generates AI dashboard insights.
   */
  public static async generateDashboardInsights(
    profile: UserProfile,
    careerTitle: string,
    aggregateSummary: string
  ): Promise<StandardAIResponse<any>> {
    const startTime = Date.now();
    const warnings = AIValidators.auditContext(profile, null, []);
    const confidence = ConfidenceEngine.calculate(profile, null, []);

    const profileSummary = `Name: ${profile.name}
Bio: ${profile.aboutMe}
Education: ${profile.education?.degree || 'N/A'}
Skills: ${(profile.skills || []).join(', ')}`;

    const prompt = GENERATE_DASHBOARD_INSIGHTS_PROMPT(profileSummary, careerTitle, aggregateSummary);
    const data = await this.executeJsonRequest<any>(
      prompt,
      (obj) => obj && typeof obj === 'object',
      { priorityTasks: ["Complete career profile detail fields"] },
      'GenerateDashboardInsights'
    );

    const execTime = Date.now() - startTime;
    this.logExecution('GenerateDashboardInsights', execTime, true);

    const response = AIResponseFormatter.createSuccess(
      data,
      this.provider.name,
      execTime,
      confidence,
      warnings,
      'Implement the top priority task to boost your readiness.'
    );
    (response as any).recommendation = data;
    return response;
  }

  /**
   * Generates AI responses and extracts profile attributes during user onboarding.
   */
  public static async generateOnboardingChat(
    profile: UserProfile,
    history: any[],
    latestMessage: string
  ): Promise<StandardAIResponse<any>> {
    const startTime = Date.now();
    const warnings = AIValidators.auditContext(profile, null, []);
    const confidence = ConfidenceEngine.calculate(profile, null, []);

    const profileJson = JSON.stringify(profile, null, 2);
    const historyJson = JSON.stringify(history, null, 2);

    const prompt = ONBOARDING_CHAT_PROMPT(profileJson, historyJson, latestMessage);
    const data = await this.executeJsonRequest<any>(
      prompt,
      (obj) => obj && typeof obj === 'object' && typeof obj.nextQuestion === 'string',
      { extractedProfile: {}, nextQuestion: "Could you tell me more about your previous experience or college degree?", confidence: 40 },
      'GenerateOnboardingChat'
    );

    const execTime = Date.now() - startTime;
    this.logExecution('GenerateOnboardingChat', execTime, true);

    return AIResponseFormatter.createSuccess(
      data,
      this.provider.name,
      execTime,
      data.confidence || confidence,
      warnings,
      data.nextQuestion || 'Tell me more about your skills.'
    );
  }

  private static getCacheKey(req: AIOrchestrationRequest): string {
    const profileKey = `${req.profile.userId || 'anon'}-${req.profile.updatedAt || '0'}`;
    const inputKey = req.additionalInputs ? JSON.stringify(req.additionalInputs) : '';
    return `${req.requestType}-${profileKey}-${inputKey}`;
  }

  private static getGracefulFallbackRecommendations(requestType: string): any[] {
    switch (requestType) {
      case 'RESUME_REVIEW':
        return [{ atsScore: 70, strengths: ['Clear formatting'], weaknesses: ['Add metrics'], missingSkills: [] }];
      case 'ROADMAP_PLANNING':
        return [{ title: 'Foundations milestone', duration: '4 weeks', status: 'in-progress' }];
      case 'DASHBOARD_INSIGHTS':
        return [{ topPriority: 'Complete profile onboarding to initialize dashboard' }];
      default:
        return ['Continue practicing your core tech stack.'];
    }
  }

  /**
   * Orchestrates the unified AI request lifecycle across all modules.
   */
  public static async orchestrate(req: AIOrchestrationRequest): Promise<UnifiedAIResponse> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(req);
    
    // Check Cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL_MS)) {
      console.log(`[AI-ORCHESTRATOR] Cache hit for requestType: ${req.requestType}`);
      return cached.response;
    }

    const context = compileAIContext(
      req.profile,
      req.career || null,
      req.assessments || [],
      req.roadmapItems,
      req.vaultItems,
      req.conversationSummary
    );

    let prompt = '';
    let systemPrompt = SYSTEM_PROMPT;

    // Prompt Routing
    switch (req.requestType) {
      case 'RESUME_REVIEW':
        prompt = ANALYZE_RESUME_PROMPT(req.additionalInputs?.resumeText || req.profile.aboutMe, context.careerContext);
        break;
      case 'CAREER_ADVICE':
        prompt = MENTOR_CHAT_PROMPT(context.compiledText, req.additionalInputs?.history || '[]', req.additionalInputs?.message || '');
        break;
      case 'ROADMAP_PLANNING':
        prompt = GENERATE_ROADMAP_PROMPT(context.userContext, context.careerContext);
        break;
      case 'INTERVIEW_GUIDANCE':
        prompt = EVALUATE_ASSESSMENT_RESPONSE_PROMPT(
          req.additionalInputs?.question || '',
          req.additionalInputs?.answer || ''
        );
        break;
      case 'DASHBOARD_INSIGHTS':
        prompt = GENERATE_DASHBOARD_INSIGHTS_PROMPT(
          context.compiledText,
          req.profile.selectedCareer || 'N/A',
          req.additionalInputs?.summary || ''
        );
        break;
      case 'LEARNING_RECOMMENDATION':
        prompt = `Generate specific learning recommendations for ${req.profile.name || 'user'} targeting ${req.profile.selectedCareer || 'N/A'} based on context:\n${context.compiledText}`;
        break;
      default:
        prompt = `Analyze target request type: ${req.requestType} for user profile:\n${context.compiledText}`;
    }

    try {
      const parsed = await this.executeJsonRequest<any>(
        prompt,
        (obj) => obj && typeof obj === 'object',
        { confidence: 0.85, reasoning: 'Orchestrator fallback', recommendations: [], nextActions: [] },
        `Orchestrate-${req.requestType}`
      );

      const execTime = Date.now() - startTime;
      
      const response: UnifiedAIResponse = {
        success: true,
        requestType: req.requestType,
        confidence: parsed.confidence || 0.85,
        reasoning: parsed.reasoning || parsed.whyItMatches || 'AI logic validation succeeded.',
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : (parsed.strengths || parsed.items || [parsed]),
        nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions : (parsed.learningSuggestions || parsed.improvementPlan || []),
        metadata: {
          provider: this.provider.name,
          executionTimeMs: execTime,
          warnings: AIValidators.auditContext(req.profile, req.career || null, req.assessments || [])
        }
      };

      // Save to Cache
      this.cache.set(cacheKey, { response, timestamp: Date.now() });
      this.logExecution(`Orchestrated-${req.requestType}`, execTime, true);
      return response;

    } catch (error: any) {
      console.error(`[AI-ORCHESTRATOR] Error processing requestType ${req.requestType}:`, error);
      const execTime = Date.now() - startTime;
      
      // Graceful Fallback Response
      const fallback: UnifiedAIResponse = {
        success: false,
        requestType: req.requestType,
        confidence: 0.5,
        reasoning: `Orchestrator recovered from error: ${error.message}`,
        recommendations: this.getGracefulFallbackRecommendations(req.requestType),
        nextActions: ['Try resubmitting your request', 'Ensure profile details are complete'],
        metadata: {
          provider: 'Fallback-Engine',
          executionTimeMs: execTime,
          warnings: ['AI Provider timed out or returned invalid format']
        }
      };
      this.logExecution(`Orchestrated-${req.requestType}`, execTime, false, error.message);
      return fallback;
    }
  }
}
