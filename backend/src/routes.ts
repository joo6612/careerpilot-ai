import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from './middleware/auth';
import { DbService } from './services/db';
import { ProfileRepository } from './services/profile_repository';
import { ProfileService } from './services/profile_service';
import { DemoUserService } from './services/demo_user_service';
import { careerRepository } from './career/dependencies';
import { assessmentService } from './assessment/dependencies';
import { CareerMatching } from './discovery/matching';
import { ReadinessCalculator } from './readiness/calculator';

const profileRepository = new ProfileRepository();
const profileService = new ProfileService(profileRepository);
import { AIService } from './ai/services/ai_service';
import { careerRouter } from './career/dependencies';
import { assessmentRouter } from './assessment/dependencies';
import { discoveryRouter, discoveryService } from './discovery/dependencies';
import { resumeRouter } from './resume/dependencies';
import { readinessRouter } from './readiness/dependencies';
import { roadmapRouter } from './roadmap/dependencies';
import { vaultRouter } from './storage/career_vault/dependencies';
import { mentorRouter } from './mentor/dependencies';
import { dashboardRouter } from './dashboard/dependencies';
import { integrationRouter } from './integration/dependencies';
import { EventBus } from './integration/event_bus';
import { EventCatalog } from './integration/event_catalog';
import type { UserProfile, RoadmapItem, ChatMessage } from './types';

const router = Router();

// Apply authentication middleware to all routes below this point
router.use(authMiddleware);

router.get('/v1/ai/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = AIService.getProviderStatus();
    return res.json(status);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve AI provider status' });
  }
});

// --- Authentication Endpoints ---
router.get('/v1/auth/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: No user session' });
    }
    return res.json({
      uid: user.uid,
      userId: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Alex Pioneer',
      photoURL: user.photoURL || '',
      provider: user.provider || 'firebase'
    });
  } catch (error: any) {
    console.error('GET /auth/me error:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve user details' });
  }
});

router.post('/v1/auth/logout', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (uid && DemoUserService.isDemoUid(uid)) {
      DemoUserService.destroySession(uid);
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('POST /auth/logout error:', error);
    return res.status(500).json({ error: error.message || 'Failed to logout' });
  }
});

// --- Career Discovery Endpoints ---
router.use('/career', discoveryRouter);

// --- Career Domain Endpoints ---
router.use('/career', careerRouter);

// --- Skill Assessment Endpoints ---
router.use('/assessment', assessmentRouter);

async function enrichProfileWithMetrics(profile: UserProfile): Promise<UserProfile> {
  if (!profile.selectedCareer) {
    profile.careerMatch = 0;
    profile.careerReadiness = 0;
    profile.skillStrength = 0;
    return profile;
  }

  try {
    const careerId = profile.selectedCareer;
    let career = await careerRepository.getById(careerId);
    if (!career) {
      const normalized = careerId.toLowerCase().trim().replace(/\s+/g, '-');
      career = await careerRepository.getById(normalized);
    }

    if (!career) {
      profile.careerMatch = 0;
      profile.careerReadiness = 0;
      profile.skillStrength = 0;
      return profile;
    }

    const assessments = await assessmentService.getAttemptsHistory(profile.userId || '').catch(() => []);
    
    // Calculate Match Score
    const match = CareerMatching.calculateMatchScore(profile, career, assessments);
    profile.careerMatch = match.overallMatch;

    // Calculate Readiness
    const readiness = ReadinessCalculator.calculate(profile, career, assessments, []);
    profile.careerReadiness = readiness.overallReadiness;

    // Calculate Skill Strength
    const reqSkills = career.requiredSkills.map(s => s.toLowerCase().trim());
    const userSkills = (profile.skills || []).map(s => s.toLowerCase().trim());
    let matchCount = 0;
    reqSkills.forEach(s => {
      if (userSkills.includes(s)) matchCount++;
    });
    profile.skillStrength = reqSkills.length > 0
      ? Math.round((matchCount / reqSkills.length) * 100)
      : 50;

  } catch (error) {
    console.error('Error enriching profile metrics:', error);
  }

  return profile;
}

// --- User Profile Endpoints ---
router.get(['/profile', '/v1/profile'], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    let profile = await profileService.getProfile(uid);
    if (!profile) {
      console.log(`[PROVISIONING] Auto-creating minimal profile for User: ${uid}`);
      profile = await profileService.createProfile(uid, {
        name: req.user!.displayName || 'Alex Pioneer',
        email: req.user!.email || '',
        photoURL: req.user!.photoURL || '',
        provider: req.user!.provider || 'google.com'
      });
    }
    const enriched = await enrichProfileWithMetrics(profile);
    return res.json(enriched);
  } catch (error: any) {
    console.error('GET /profile error:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve profile' });
  }
});

router.post(['/profile', '/v1/profile'], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const profileData = req.body as UserProfile;
    const enriched = await enrichProfileWithMetrics(profileData);
    
    const existing = await profileService.getProfile(uid);
    if (!existing) {
      await profileService.createProfile(uid, enriched);
    } else {
      await profileService.saveProfile(uid, enriched);
    }
    
    // Trigger integration workflow asynchronously
    EventBus.publish(EventCatalog.PROFILE_UPDATED, { uid, profile: enriched });
    
    return res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('POST /profile error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

// --- User Onboarding Endpoints ---
router.post('/v1/onboarding/chat', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let profile = await profileService.getProfile(uid);
    if (!profile) {
      console.log(`[PROVISIONING] Auto-creating minimal profile for User: ${uid}`);
      profile = await profileService.createProfile(uid, {
        name: req.user!.displayName || 'Alex Pioneer',
        email: req.user!.email || '',
        photoURL: req.user!.photoURL || '',
        provider: req.user!.provider || 'google.com'
      });
    }

    const chatKey = `${uid}-onboarding`;
    const chatHistory = await DbService.getUserChat(chatKey) || [];

    const aiResponse = await AIService.generateOnboardingChat(profile, chatHistory, message);
    const aiData = aiResponse.data;

    const updatedHistory = [
      ...chatHistory,
      { id: `msg-${Date.now()}-user`, sender: 'user' as const, text: message, timestamp: new Date().toISOString() },
      { id: `msg-${Date.now()}-ai`, sender: 'mentor' as const, text: aiData.assistantMessage, timestamp: new Date().toISOString() }
    ];
    await DbService.saveUserChat(chatKey, updatedHistory);

    const ext = aiData.extractedProfile || {};
    const updatedFields = aiData.updatedFields || [];

    let profileChanged = false;
    if (ext.name && updatedFields.includes('name')) {
      profile.name = ext.name;
      profileChanged = true;
    }
    if (ext.education && updatedFields.includes('education')) {
      profile.education = { ...profile.education, degree: ext.education };
      profileChanged = true;
    }
    if (ext.college && updatedFields.includes('college')) {
      profile.education = { ...profile.education, collegeName: ext.college };
      profileChanged = true;
    }
    if (ext.currentYear && updatedFields.includes('currentYear')) {
      profile.education = { ...profile.education, graduationYear: ext.currentYear };
      profileChanged = true;
    }
    if (ext.skills && ext.skills.length > 0 && updatedFields.includes('skills')) {
      profile.skills = Array.from(new Set([...(profile.skills || []), ...ext.skills]));
      profileChanged = true;
    }
    if (ext.interests && ext.interests.length > 0 && updatedFields.includes('interests')) {
      profile.interests = Array.from(new Set([...(profile.interests || []), ...ext.interests]));
      profileChanged = true;
    }
    if (ext.careerGoal && updatedFields.includes('careerGoal')) {
      profile.selectedCareer = ext.careerGoal;
      profileChanged = true;
    }
    if (ext.preferredDomain && updatedFields.includes('preferredDomain')) {
      if (profile.professionalDetails) {
        profile.professionalDetails.industry = ext.preferredDomain;
      }
      profileChanged = true;
    }
    if (ext.preferredWorkStyle && updatedFields.includes('preferredWorkStyle')) {
      profile.workPreference = ext.preferredWorkStyle;
      profileChanged = true;
    }
    if (ext.preferredLocation && updatedFields.includes('preferredLocation')) {
      profile.country = ext.preferredLocation;
      profileChanged = true;
    }
    if (ext.targetSalary && updatedFields.includes('targetSalary')) {
      profile.expectedSalary = ext.targetSalary;
      profileChanged = true;
    }

    profile.profileCompletion = aiData.conversationProgress || profile.profileCompletion;

    if (profileChanged) {
      await profileService.saveProfile(uid, profile);
    }

    let careerRecommendations: any[] = [];
    if (updatedFields.includes('careerGoal') || updatedFields.includes('interests') || updatedFields.includes('skills')) {
      console.log(`[ONBOARDING-CHAT] Profile changes warrant Career Discovery rerun.`);
      const discoveryResult = await discoveryService.runDiscovery(uid, profile, []);
      careerRecommendations = discoveryResult.recommendations || [];
    }

    return res.json({
      assistantMessage: aiData.assistantMessage,
      extractedProfile: {
        name: profile.name,
        education: profile.education?.degree || '',
        college: profile.education?.collegeName || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        careerGoal: profile.selectedCareer || '',
        preferredDomain: profile.professionalDetails?.industry || '',
        preferredWorkStyle: profile.workPreference || '',
        preferredLocation: profile.country || '',
        targetSalary: profile.expectedSalary || ''
      },
      updatedFields: aiData.updatedFields,
      careerRecommendations,
      nextQuestion: aiData.nextQuestion,
      conversationProgress: aiData.conversationProgress,
      confidence: aiData.confidence
    });
  } catch (error: any) {
    console.error('POST /onboarding/chat error:', error);
    return res.status(500).json({ error: error.message || 'Onboarding chat failed' });
  }
});

router.get('/v1/onboarding/state', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    let profile = await profileService.getProfile(uid);
    if (!profile) {
      console.log(`[PROVISIONING] Auto-creating minimal profile for User: ${uid}`);
      profile = await profileService.createProfile(uid, {
        name: req.user!.displayName || 'Alex Pioneer',
        email: req.user!.email || '',
        photoURL: req.user!.photoURL || '',
        provider: req.user!.provider || 'google.com'
      });
    }

    const chatKey = `${uid}-onboarding`;
    const chatHistory = await DbService.getUserChat(chatKey) || [];

    return res.json({
      messages: chatHistory,
      conversationProgress: profile.profileCompletion || 0,
      extractedProfile: {
        name: profile.name,
        education: profile.education?.degree || '',
        college: profile.education?.collegeName || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        careerGoal: profile.selectedCareer || '',
        preferredDomain: profile.professionalDetails?.industry || '',
        preferredWorkStyle: profile.workPreference || '',
        preferredLocation: profile.country || '',
        targetSalary: profile.expectedSalary || ''
      }
    });
  } catch (error: any) {
    console.error('GET /onboarding/state error:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve onboarding state' });
  }
});

router.patch('/v1/onboarding/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const updates = req.body;

    let profile = await profileService.getProfile(uid);
    if (!profile) {
      console.log(`[PROVISIONING] Auto-creating minimal profile for User: ${uid}`);
      profile = await profileService.createProfile(uid, {
        name: req.user!.displayName || 'Alex Pioneer',
        email: req.user!.email || '',
        photoURL: req.user!.photoURL || '',
        provider: req.user!.provider || 'google.com'
      });
    }

    if (updates.name !== undefined) profile.name = updates.name;
    if (updates.education !== undefined) profile.education.degree = updates.education;
    if (updates.college !== undefined) profile.education.collegeName = updates.college;
    if (updates.currentYear !== undefined) profile.education.graduationYear = updates.currentYear;
    if (updates.skills !== undefined) profile.skills = updates.skills;
    if (updates.interests !== undefined) profile.interests = updates.interests;
    if (updates.careerGoal !== undefined) profile.selectedCareer = updates.careerGoal;
    if (updates.preferredDomain !== undefined) profile.professionalDetails.industry = updates.preferredDomain;
    if (updates.preferredWorkStyle !== undefined) profile.workPreference = updates.preferredWorkStyle;
    if (updates.preferredLocation !== undefined) profile.country = updates.preferredLocation;
    if (updates.targetSalary !== undefined) profile.expectedSalary = updates.targetSalary;
    
    if (updates.onboardingCompleted !== undefined) {
      profile.onboardingCompleted = updates.onboardingCompleted;
    }

    await profileService.saveProfile(uid, profile);
    const enriched = await enrichProfileWithMetrics(profile);
 
    return res.json({
      success: true,
      profile: {
        ...enriched,
        name: profile.name,
        education: profile.education?.degree || '',
        college: profile.education?.collegeName || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        careerGoal: profile.selectedCareer || '',
        preferredDomain: profile.professionalDetails?.industry || '',
        preferredWorkStyle: profile.workPreference || '',
        preferredLocation: profile.country || '',
        targetSalary: profile.expectedSalary || '',
        onboardingCompleted: profile.onboardingCompleted
      }
    });
  } catch (error: any) {
    console.error('PATCH /onboarding/profile error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

// --- Career Discovery Endpoints ---
router.post('/career/suggest', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { aboutMe } = req.body;
    if (!aboutMe) {
      return res.status(400).json({ error: 'AboutMe description is required' });
    }
    const result = await AIService.suggestCareers(aboutMe);
    if (!result.success) {
      return res.status(500).json({ error: result.reason });
    }
    return res.json({ suggestions: result.recommendation });
  } catch (error) {
    console.error('POST /career/suggest error:', error);
    return res.status(500).json({ error: 'Failed to generate career suggestions' });
  }
});

router.post('/career/skills', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { career } = req.body;
    if (!career || typeof career !== 'string' || career.trim() === '') {
      return res.status(400).json({ error: 'Career title required. Please select or enter a valid target career.' });
    }
    const result = await AIService.getCareerSkills(career);
    if (!result.success) {
      return res.status(500).json({ error: result.reason });
    }
    return res.json({ skills: result.recommendation });
  } catch (error) {
    console.error('POST /career/skills error:', error);
    return res.status(500).json({ error: 'Failed to generate skills for career' });
  }
});

// --- Resume Analysis Endpoints ---
router.use('/resume', resumeRouter);

// --- Career Readiness Endpoints ---
router.use('/readiness', readinessRouter);

// --- Roadmap Endpoints ---
router.use('/roadmap', roadmapRouter);

// --- Career Vault Endpoints ---
router.use('/vault', vaultRouter);

// --- AI Mentor Engine ---
router.use('/mentor', mentorRouter);

// --- Dashboard Endpoints ---
router.use('/dashboard', dashboardRouter);

// --- System Integration Endpoints ---
router.use('/system', integrationRouter);

// --- Mock Interview Endpoints ---
router.post('/interview/evaluate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Both question and answer are required' });
    }
    const result = await AIService.evaluateInterview(question, answer);
    if (!result.success) {
      return res.status(500).json({ error: result.reason });
    }
    return res.json(result.recommendation);
  } catch (error) {
    console.error('POST /interview/evaluate error:', error);
    return res.status(500).json({ error: 'Failed to evaluate interview answer' });
  }
});

// --- AI Health Test Endpoint ---
// POST /api/v1/ai/test   { "message": "Hello" }
router.post('/v1/ai/test', async (req: AuthenticatedRequest, res: Response) => {
  const { message = 'Hello' } = req.body;
  const startTime = Date.now();

  try {
    const reply = await AIService.generateMentorReply(
      // minimal anonymous profile — we just need the provider to respond
      {
        name: 'Test User',
        aboutMe: message,
        interests: [],
        favoriteSubjects: '',
        country: '',
        expectedSalary: '',
        workPreference: 'Remote',
        selectedCareer: 'Software Engineer',
        status: null,
        professionalDetails: { jobTitle: '', yearsOfExperience: '', currentSkills: '', industry: '' },
        education: { degree: '', collegeName: '', cgpa: '', graduationYear: '', internshipExperience: '', languagesKnown: '' },
        skills: [],
        certifications: [],
        projects: { githubUrl: '', projectLinks: '', portfolioUrl: '', description: '' },
        resume: { method: null, strengths: [], weaknesses: [], missingSkills: [] },
        timeAvailability: { hoursPerDay: '0', daysPerWeek: '0', targetMonths: '0', preferredStudyTime: 'Morning' }
      } as any,
      [],
      message
    );

    return res.json({
      success: true,
      provider: 'OpenRouter',
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      executionTimeMs: Date.now() - startTime,
      reply: reply.recommendation ?? reply.data ?? 'No reply generated'
    });
  } catch (error: any) {
    const execTime = Date.now() - startTime;
    console.error('[AI-TEST] Error:', error.message);

    // Classify error type for a meaningful response
    const msg = (error.message || '').toLowerCase();
    let errorType = 'GenerationError';
    if (msg.includes('api key') || msg.includes('unauthorized') || msg.includes('invalid')) errorType = 'InvalidApiKey';
    else if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('exhausted')) errorType = 'RateLimitExceeded';
    else if (msg.includes('timeout') || msg.includes('timed out')) errorType = 'Timeout';
    else if (msg.includes('network') || msg.includes('fetch failed') || msg.includes('enotfound')) errorType = 'NetworkError';
    else if (msg.includes('not initialized') || msg.includes('missing')) errorType = 'ConfigurationError';
    else if (msg.includes('provider error') || msg.includes('providererror')) errorType = 'ProviderError';

    return res.status(502).json({
      success: false,
      provider: 'OpenRouter',
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      errorType,
      error: error.message,
      executionTimeMs: execTime
    });
  }
});

export default router;
