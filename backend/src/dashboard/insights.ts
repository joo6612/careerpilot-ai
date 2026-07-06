import { DashboardInsights } from './models';
import { AggregatedData } from './aggregator';
import { AIService } from '../ai/services/ai_service';
import { createHash } from 'crypto';

export class InsightsGenerator {
  private static userCache = new Map<string, { insights: DashboardInsights; hash: string }>();

  static async generate(aggregated: AggregatedData): Promise<DashboardInsights> {
    const { profile, careerDetails, activeRoadmap, latestReadiness, latestResume, assessmentAttempts } = aggregated;

    const careerTitle = careerDetails?.title || profile?.selectedCareer || 'Not Selected';

    // 1. Calculate missing skills from catalog requirements vs profile skills
    const requiredSkills = careerDetails?.requiredSkills || [];
    const userSkills = (profile?.skills || []).map(s => s.toLowerCase().trim());
    const missingSkills = requiredSkills.filter(req => !userSkills.includes(req.toLowerCase().trim()));

    // 2. Identify upcoming milestone from the active roadmap
    let upcomingMilestone = 'N/A';
    if (activeRoadmap) {
      const nextMilestone = activeRoadmap.phases
        .flatMap(p => p.milestones)
        .find(m => m.status !== 'completed');
      if (nextMilestone) {
        upcomingMilestone = nextMilestone.title;
      }
    }

    // 3. Compile structural defaults for graceful fallbacks
    let fallbackTopPriority = 'Upload your resume and complete a skill assessment';
    if (activeRoadmap) {
      const firstIncompleteTask = activeRoadmap.phases
        .flatMap(p => p.milestones)
        .find(m => m.status !== 'completed')
        ?.tasks?.find(t => t.status !== 'completed');
      if (firstIncompleteTask) {
        fallbackTopPriority = `Complete task: "${firstIncompleteTask.title}"`;
      }
    }

    const defaults: DashboardInsights = {
      topPriority: fallbackTopPriority,
      strengths: latestReadiness?.strengths || latestResume?.improvementReport?.strengths || [
        'Dedicated hours match target career requirements.',
        'Demonstrates initial career focus.'
      ],
      weaknesses: latestReadiness?.weaknesses || latestResume?.improvementReport?.weaknesses || [
        'Some core skills are not yet verified through assessments.',
        'Resume ATS score can be optimized further.'
      ],
      missingSkills: missingSkills.length > 0 ? missingSkills : (latestReadiness?.missingSkills || []),
      nextRecommendation: latestReadiness?.recommendations?.[0]?.action || 'Complete your first roadmap milestone to gain structured skills.',
      upcomingMilestone
    };

    // If profile or career selection are not present, return defaults immediately
    if (!profile || !careerDetails) {
      return defaults;
    }

    const cacheKey = profile.userId || profile.name || 'default';

    // Calculate a hash of the dashboard state parameters to check cache
    const hashData = {
      careerTitle,
      userSkills: [...userSkills].sort(),
      readinessScore: latestReadiness?.overallReadiness || 0,
      roadmapPercent: activeRoadmap?.completionPercentage || 0,
      atsScore: latestResume?.atsAnalysis?.atsScore || 0,
      assessmentsCount: assessmentAttempts.length,
      verifiedSkills: assessmentAttempts.filter(a => a.percentage >= 70).map(a => a.skill).sort(),
      vaultCount: aggregated.vaultDocuments.length
    };
    const currentHash = createHash('sha256').update(JSON.stringify(hashData)).digest('hex');

    const cached = this.userCache.get(cacheKey);
    if (cached && cached.hash === currentHash) {
      console.log(`[InsightsGenerator] Underlying data unchanged. Returning cached dashboard insights for: ${cacheKey}`);
      return cached.insights;
    }

    try {
      // Build dashboard summary context for AI analysis
      const aggregateSummary = `
Target Career: ${careerTitle}
Readiness Score: ${latestReadiness?.overallReadiness || 0}%
Roadmap Completion: ${activeRoadmap?.completionPercentage || 0}%
Resume ATS Score: ${latestResume?.atsAnalysis?.atsScore || 0}%
Total Assessments Completed: ${assessmentAttempts.length}
Verified Skills: ${assessmentAttempts.filter(a => a.percentage >= 70).map(a => a.skill).join(', ') || 'None'}
Total Vault Documents: ${aggregated.vaultDocuments.length}
`;

      const aiResponse = await AIService.generateDashboardInsights(profile, careerTitle, aggregateSummary);
      if (aiResponse.success && aiResponse.data) {
        const d = aiResponse.data;
        const insightsResult = {
          topPriority: d.topPriority || defaults.topPriority,
          strengths: d.strengths || defaults.strengths,
          weaknesses: d.weaknesses || defaults.weaknesses,
          missingSkills: d.missingSkills || defaults.missingSkills,
          nextRecommendation: d.nextRecommendation || defaults.nextRecommendation,
          upcomingMilestone: d.upcomingMilestone || defaults.upcomingMilestone
        };
        this.userCache.set(cacheKey, { insights: insightsResult, hash: currentHash });
        return insightsResult;
      }
    } catch (error) {
      console.warn('[Dashboard-AI-Insights] AI generation failed, falling back to default insights:', error);
    }

    this.userCache.set(cacheKey, { insights: defaults, hash: currentHash });
    return defaults;
  }
}
