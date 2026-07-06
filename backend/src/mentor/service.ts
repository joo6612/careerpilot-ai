import { MentorPersonaId, MentorMessage, MentorResponse, Conversation } from './models';
import { MentorRepository } from './repository';
import { getPersona } from './personas';
import { buildContextHistory, buildConversationSummary } from './memory';
import { createConversation, appendMessage, getOrCreateActiveConversation } from './conversation';
import { buildRecommendation } from './recommendations';
import { ConversationNotFoundError, UnauthorizedConversationAccessError } from './exceptions';
import { AIService } from '../ai/services/ai_service';
import { compileAIContext } from '../ai/context/builder';
import { DbService } from '../services/db';
import { CareerRepository } from '../career/repository';
import { AssessmentService } from '../assessment/service';
import { RoadmapService } from '../roadmap/service';
import { VaultService } from '../storage/career_vault/service';
import { ReadinessService } from '../readiness/service';

export class MentorService {
  constructor(
    private repository: MentorRepository,
    private careerRepository: CareerRepository,
    private assessmentService: AssessmentService,
    private roadmapService: RoadmapService,
    private vaultService: VaultService,
    private readinessService: ReadinessService
  ) {}

  // ============================================================
  // Main Chat Handler
  // ============================================================

  /**
   * Core mentor interaction — builds full career context, invokes AIService,
   * and returns a structured MentorResponse with recommendation metadata.
   */
  async chat(
    uid: string,
    text: string,
    personaId: MentorPersonaId = 'career-mentor',
    conversationId?: string
  ): Promise<MentorResponse> {
    // 1. Load user profile
    const profile = await DbService.getUserProfile(uid);
    if (!profile) {
      throw new Error('User profile not found. Please complete onboarding before chatting with the AI Mentor.');
    }

    // 2. Load supporting data from all modules (non-throwing — graceful fallback)
    const assessments = await this.assessmentService.getAttemptsHistory(uid).catch(() => []);

    let career = null;
    if (profile.selectedCareer) {
      career = await this.careerRepository.getById(profile.selectedCareer).catch(() => null);
      if (!career) {
        const normalized = profile.selectedCareer.toLowerCase().trim().replace(/\s+/g, '-');
        career = await this.careerRepository.getById(normalized).catch(() => null);
      }
    }

    const roadmapItems = await this.roadmapService.getActiveRoadmap(uid)
      .then(r => {
        if (!r || !r.phases) return [];
        return r.phases.flatMap(p => (p.milestones || []).map(m => ({
          title: m.title,
          status: m.status,
          duration: `${m.tasks ? m.tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0) : 0} hours`,
          progressPercent: m.status === 'completed' ? 100 : m.status === 'in-progress' ? 50 : 0
        })));
      })
      .catch(() => []);

    const vaultDocs = await this.vaultService.getDocuments(uid).catch(() => []);

    const readinessReport = await this.readinessService.getLatestReport(uid).catch(() => null);

    // 3. Compile base AI context block
    const contextBlock = compileAIContext(profile, career, assessments, roadmapItems);

    // 4. Append persona system prompt prefix to context
    const persona = getPersona(personaId);
    const enrichedContext = this.enrichContext(contextBlock.compiledText, persona.systemPromptPrefix, readinessReport, vaultDocs);

    // 5. Get or create conversation
    let conversation: Conversation;
    if (conversationId) {
      const found = await this.repository.getById(conversationId);
      if (!found) throw new ConversationNotFoundError(conversationId);
      if (found.uid !== uid) throw new UnauthorizedConversationAccessError(conversationId);
      conversation = found;
    } else {
      conversation = await getOrCreateActiveConversation(this.repository, uid, personaId);
    }

    // 6. Build history text with memory compression
    const historyText = buildContextHistory(conversation.messages, conversation.summary);

    // 7. Append user message
    const userMsg: MentorMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      personaId
    };
    conversation = appendMessage(conversation, userMsg);

    // 8. Build profile surrogate for AIService (enriched context injected via aboutMe override)
    const enrichedProfile = {
      ...profile,
      aboutMe: `${enrichedContext}\n\n--- Original Bio ---\n${profile.aboutMe || ''}`
    };

    // 9. Call AI Foundation Layer exclusively — never call Gemini directly
    const aiResult = await AIService.generateMentorReply(enrichedProfile, conversation.messages, text);
    const replyText = aiResult.success ? (aiResult.recommendation as string) : 'I apologize — I encountered a temporary issue. Please try again.';

    // 10. Append mentor reply message
    const mentorMsg: MentorMessage = {
      id: `msg-m-${Date.now()}`,
      role: 'mentor',
      sender: 'mentor',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      personaId
    };
    conversation = appendMessage(conversation, mentorMsg);

    // 11. Update summary if conversation is long
    if (conversation.messages.length >= 10) {
      conversation = {
        ...conversation,
        summary: buildConversationSummary(conversation.messages)
      };
    }

    // 12. Persist conversation
    await this.repository.save(conversation);

    // 13. Persist legacy DbService chat for backward compatibility
    await DbService.saveUserChat(uid, conversation.messages as any);

    // 14. Build structured recommendation
    const recommendation = buildRecommendation(replyText, personaId);

    return {
      reply: replyText,
      recommendation,
      conversationId: conversation.id,
      personaId,
      chat: conversation.messages,
      replyMessage: mentorMsg
    };
  }

  // ============================================================
  // Conversation Management
  // ============================================================

  /** Returns all conversations for the authenticated user. */
  async getHistory(uid: string): Promise<Conversation[]> {
    return this.repository.getByUser(uid);
  }

  /** Returns a single conversation. Validates ownership. */
  async getConversation(uid: string, id: string): Promise<Conversation> {
    const conv = await this.repository.getById(id);
    if (!conv) throw new ConversationNotFoundError(id);
    if (conv.uid !== uid) throw new UnauthorizedConversationAccessError(id);
    return conv;
  }

  /** Deletes a conversation. Validates ownership. */
  async deleteConversation(uid: string, id: string): Promise<void> {
    const conv = await this.repository.getById(id);
    if (!conv) throw new ConversationNotFoundError(id);
    if (conv.uid !== uid) throw new UnauthorizedConversationAccessError(id);
    await this.repository.delete(id);
  }

  /**
   * Starts a fresh conversation with the selected persona.
   * Returns the new conversation with the persona welcome message pre-loaded.
   */
  async setPersona(uid: string, personaId: MentorPersonaId): Promise<Conversation> {
    const persona = getPersona(personaId);
    let conv = createConversation(uid, personaId);

    // Seed with the persona welcome message
    const welcomeMsg: MentorMessage = {
      id: `msg-m-${Date.now()}`,
      role: 'mentor',
      sender: 'mentor',
      text: persona.welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      personaId
    };
    conv = appendMessage(conv, welcomeMsg);
    await this.repository.save(conv);
    return conv;
  }

  /**
   * Legacy-compatible: returns the latest conversation messages as a flat array,
   * or the default welcome message if no conversation exists.
   */
  async getLegacyChat(uid: string): Promise<MentorMessage[]> {
    const conversations = await this.repository.getByUser(uid);
    if (conversations.length === 0) {
      const defaultMsg: MentorMessage = {
        id: 'chat-1',
        role: 'mentor',
        sender: 'mentor',
        text: "Hello! I am your AI Career Mentor. I've analyzed your profile and I'm ready to help you land your dream role. Ask me anything about your custom roadmap, skills gap, or upcoming interviews!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      // Bootstrap the default conversation
      const conv = createConversation(uid, 'career-mentor');
      const seeded = appendMessage(conv, defaultMsg);
      await this.repository.save(seeded);
      await DbService.saveUserChat(uid, seeded.messages as any);
      return seeded.messages;
    }
    return conversations[0].messages;
  }

  // ============================================================
  // Private: Context Enrichment
  // ============================================================

  /**
   * Appends persona system prompt, readiness report, and vault summary
   * to the compiled AI context without modifying builder.ts.
   */
  private enrichContext(
    compiledText: string,
    personaSystemPrompt: string,
    readinessReport: any | null,
    vaultDocs: any[]
  ): string {
    let enriched = `=========================================\nMENTOR PERSONA INSTRUCTION\n=========================================\n${personaSystemPrompt}\n\n${compiledText}`;

    // Append readiness context if available
    if (readinessReport) {
      const report = readinessReport.report || readinessReport;
      enriched += `\n\n=========================================
CAREER READINESS REPORT
=========================================
Overall Status: ${report.overallStatus || 'N/A'}
Overall Score: ${report.overallScore || 0}%
Strengths: ${(report.strengths || []).join(', ') || 'N/A'}
Priority Tasks: ${(report.priorityTasks || []).slice(0, 3).join(', ') || 'N/A'}
=========================================`;
    }

    // Append vault document summary
    if (vaultDocs.length > 0) {
      const docList = vaultDocs.slice(0, 5).map(d =>
        `- ${d.category}: "${d.title}" (v${d.version}, ${d.health.verificationStatus})`
      ).join('\n');
      enriched += `\n\n=========================================
CAREER VAULT DOCUMENTS
=========================================
${docList}
=========================================`;
    }

    return enriched;
  }
}

export default MentorService;
