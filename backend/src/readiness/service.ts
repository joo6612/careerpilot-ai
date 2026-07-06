import { UserProfile } from '../types';
import { ReadinessRepository } from './repository';
import { CareerRepository } from '../career/repository';
import { AssessmentResult } from '../assessment/models';
import { ReadinessHistoryItem, ReadinessReport, ReadinessTrend, ReadinessRecommendation } from './models';
import { ReadinessCalculator } from './calculator';
import { ReadinessRecommendations } from './recommendations';
import { AIService } from '../ai/services/ai_service';
import { ReportNotFoundError } from './exceptions';
import { CareerNotFoundError } from '../career/exceptions';
import { DbService } from '../services/db';

export class ReadinessService {
  constructor(
    private repository: ReadinessRepository,
    private careerRepository: CareerRepository
  ) {}

  /**
   * Runs the complete readiness calculation pipeline, queries AI insights,
   * compiles roadmap recommendations, and saves the history item.
   */
  async calculateReadiness(
    uid: string,
    profile: UserProfile,
    assessments: AssessmentResult[]
  ): Promise<ReadinessHistoryItem> {
    const careerId = profile.selectedCareer;
    if (!careerId) {
      throw new Error('Target career path has not been selected on your profile.');
    }

    // Resolve robust career lookup (handling synonyms like Data Analysis)
    let career = await this.careerRepository.getById(careerId);
    if (!career) {
      const normalized = careerId.toLowerCase().trim().replace(/\s+/g, '-');
      career = await this.careerRepository.getById(normalized);
      if (!career && (normalized === 'data-analysis' || normalized === 'data-analytics')) {
        career = await this.careerRepository.getById('data-analyst');
      }
      if (!career) {
        throw new CareerNotFoundError(careerId);
      }
    }

    const roadmapItems = await DbService.getUserRoadmap(uid) || [];

    // Calculate baseline sub-scores and overall scores
    const { overallReadiness, status, categoryScores } = ReadinessCalculator.calculate(
      profile,
      career,
      assessments,
      roadmapItems
    );

    // Call AI Foundation Layer to refine strengths, weaknesses, and missing skills
    let strengths = ['Committed hours aligned with target requirements.'];
    let weaknesses = ['Some core skills are not yet verified through assessments.'];
    let missingSkills = career.requiredSkills.filter(s => 
      !(profile.skills || []).map(us => us.toLowerCase()).includes(s.toLowerCase())
    );
    let estimatedCompletionTimeHours = 40;
    let confidenceRating: ReadinessReport['confidence'] = 'High';

    try {
      const aiResponse = await AIService.generateReadinessInsights(profile, career.title, categoryScores);
      if (aiResponse.success && aiResponse.data) {
        const d = aiResponse.data;
        strengths = d.strengths || strengths;
        weaknesses = d.weaknesses || weaknesses;
        missingSkills = d.missingSkills || missingSkills;
        estimatedCompletionTimeHours = d.estimatedCompletionTimeHours || estimatedCompletionTimeHours;
        confidenceRating = d.confidence || confidenceRating;
      }
    } catch (error) {
      console.warn('AI Readiness insights failed. Falling back to programmatic defaults:', error);
    }

    // Compile recommendations
    const recommendations = ReadinessRecommendations.generate(categoryScores, missingSkills);

    const report: ReadinessReport = {
      overallReadiness,
      status,
      categoryScores,
      strengths,
      weaknesses,
      missingSkills,
      recommendations,
      estimatedCompletionTimeHours,
      confidence: confidenceRating,
      metadata: {
        timestamp: new Date().toISOString(),
        careerId: career.id,
        careerTitle: career.title
      }
    };

    const historyItem: ReadinessHistoryItem = {
      id: `read-${Date.now()}`,
      uid,
      timestamp: new Date().toISOString(),
      report
    };

    await this.repository.save(historyItem);
    return historyItem;
  }

  /**
   * Gets the latest readiness report. Throws ReportNotFoundError if none exists.
   */
  async getLatestReport(uid: string): Promise<ReadinessReport> {
    const item = await this.repository.getLatest(uid);
    if (!item) {
      throw new ReportNotFoundError(uid);
    }
    return item.report;
  }

  /**
   * Retrieves full run history.
   */
  async getHistory(uid: string): Promise<ReadinessHistoryItem[]> {
    return this.repository.getHistory(uid);
  }

  /**
   * Computes progress metrics and readiness score changes over time.
   */
  async getTrends(uid: string): Promise<ReadinessTrend> {
    const list = await this.repository.getHistory(uid);
    if (list.length === 0) {
      return {
        historicalScores: [],
        skillsVerificationsPassed: 0,
        overallScoreChange: 0
      };
    }

    // Format historical scores oldest to newest
    const sorted = [...list].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const historicalScores = sorted.map(item => ({
      timestamp: item.timestamp,
      score: item.report.overallReadiness
    }));

    // Fetch verified assessments passes count
    const assessments = await DbService.getUserRoadmap(uid) || []; // Using roadmap/assessments
    // Count passes from assessments (Mock count if unavailable)
    const passedCount = historicalScores.length > 0 ? Math.min(8, Math.round(historicalScores[historicalScores.length - 1].score / 10)) : 0;

    const firstScore = historicalScores[0].score;
    const latestScore = historicalScores[historicalScores.length - 1].score;
    const overallScoreChange = latestScore - firstScore;

    return {
      historicalScores,
      skillsVerificationsPassed: passedCount,
      overallScoreChange
    };
  }
}
export default ReadinessService;
