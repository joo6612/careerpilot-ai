import { UserProfile } from '../types';
import { DiscoveryRepository } from './repository';
import { CareerRepository } from '../career/repository';
import { AssessmentResult } from '../assessment/models';
import { DiscoveryHistoryItem, CareerComparison, RecommendedCareer, DiscoveryInsights } from './models';
import { CareerRanking } from './ranking';
import { AIService } from '../ai/services/ai_service';
import { ResultNotFoundError } from './exceptions';
import { CareerNotFoundError } from '../career/exceptions';
import { createHash } from 'crypto';

export class DiscoveryService {
  constructor(
    private repository: DiscoveryRepository,
    private careerRepository: CareerRepository
  ) {}

  private computeDiscoveryProfileHash(profile: UserProfile, assessments: AssessmentResult[]): string {
    const dataToHash = {
      aboutMe: profile.aboutMe,
      interests: (profile.interests || []).sort(),
      skills: (profile.skills || []).sort(),
      certifications: (profile.certifications || []).map(c => c.courseName).sort(),
      degree: profile.education?.degree,
      assessments: assessments.map(a => ({ id: a.sessionId, percentage: a.percentage })).sort((a, b) => a.id.localeCompare(b.id))
    };
    return createHash('sha256').update(JSON.stringify(dataToHash)).digest('hex');
  }

  /**
   * Evaluates candidate profile and verified skills, runs scoring matches,
   * queries AI insights, and stores the completed discovery recommendations history.
   */
  async runDiscovery(
    uid: string,
    profile: UserProfile,
    assessments: AssessmentResult[]
  ): Promise<DiscoveryHistoryItem> {
    const latestItem = await this.repository.getLatestItem(uid).catch(() => null);
    const currentHash = this.computeDiscoveryProfileHash(profile, assessments);

    if (latestItem && (latestItem as any).profileHash === currentHash) {
      console.log('[DiscoveryService] Profile and assessment data are unchanged. Skipping career discovery rerun.');
      return latestItem;
    }
    const careers = await this.careerRepository.getAll();
    const topCareers = CareerRanking.rankTopCareers(profile, careers, assessments);

    // Call AI Foundation Layer to generate structured insights
    let insights: DiscoveryInsights;
    try {
      const aiResponse = await AIService.generateDiscoveryInsights(profile, topCareers);
      if (aiResponse.success && aiResponse.data) {
        insights = aiResponse.data as DiscoveryInsights;
      } else {
        throw new Error(aiResponse.reason || 'Failed to generate insights');
      }
    } catch (error) {
      console.warn('AI Insights generation failed. Falling back to structured programmatic defaults:', error);
      insights = {
        strengths: ['Solid understanding of core technologies', 'Hands-on project experience'],
        weaknesses: ['Needs more cloud environment familiarity', 'Quantified project outcomes could be improved'],
        skillGaps: topCareers[0]?.missingSkills || [],
        careerRisks: ['Highly competitive entry level market'],
        learningSuggestions: ['Dedicate 4-5 hours per week reviewing missing technical tools'],
        improvementPlan: ['Step 1: Start the first milestone of the recommended roadmap']
      };
    }

    const historyItem: DiscoveryHistoryItem = {
      id: `disc-${Date.now()}`,
      uid,
      timestamp: new Date().toISOString(),
      recommendations: topCareers,
      insights,
      profileHash: currentHash
    } as any;

    await this.repository.saveHistoryItem(historyItem);
    return historyItem;
  }

  /**
   * Retrieves the most recent discovery result. Throws ResultNotFoundError if none found.
   */
  async getLatestRecommendations(uid: string): Promise<DiscoveryHistoryItem> {
    const item = await this.repository.getLatestItem(uid);
    if (!item) {
      throw new ResultNotFoundError(uid);
    }
    return item;
  }

  /**
   * Performs side-by-side comparative analysis of two careers.
   */
  async getCompareCareers(careerAId: string, careerBId: string): Promise<CareerComparison> {
    const careerA = await this.careerRepository.getById(careerAId);
    if (!careerA) throw new CareerNotFoundError(careerAId);

    const careerB = await this.careerRepository.getById(careerBId);
    if (!careerB) throw new CareerNotFoundError(careerBId);

    // Helper to calculate midpoints
    const midA = (careerA.salaryRange.min + careerA.salaryRange.max) / 2;
    const midB = (careerB.salaryRange.min + careerB.salaryRange.max) / 2;

    const salaryDifference = midA > midB
      ? `${careerA.title} offers a higher average starting salary ($${midA.toLocaleString()}) compared to ${careerB.title} ($${midB.toLocaleString()}), representing a midpoint difference of $${(midA - midB).toLocaleString()}.`
      : `${careerB.title} offers a higher average starting salary ($${midB.toLocaleString()}) compared to ${careerA.title} ($${midA.toLocaleString()}), representing a midpoint difference of $${(midB - midA).toLocaleString()}.`;

    // Map difficulty to estimated learning readiness in months
    const getMonths = (diff: string) => diff === 'Beginner' ? 3 : diff === 'Intermediate' ? 6 : 9;
    const monthsA = getMonths(careerA.difficulty);
    const monthsB = getMonths(careerB.difficulty);

    const learningTimeDifference = monthsA === monthsB
      ? `Both tracks require an equivalent estimated study timeline of approximately ${monthsA} months to achieve entry-level job readiness.`
      : monthsA > monthsB
        ? `The ${careerA.difficulty} track (${careerA.title}) requires approximately ${monthsA} months of dedicated study, which is ${monthsA - monthsB} months longer than the ${careerB.difficulty} track (${careerB.title}).`
        : `The ${careerB.difficulty} track (${careerB.title}) requires approximately ${monthsB} months of dedicated study, which is ${monthsB - monthsA} months longer than the ${careerA.difficulty} track (${careerA.title}).`;

    // Calculate skill details
    const skillsA = careerA.requiredSkills;
    const skillsB = careerB.requiredSkills;

    const common = skillsA.filter(s => skillsB.includes(s));
    const onlyInA = skillsA.filter(s => !skillsB.includes(s));
    const onlyInB = skillsB.filter(s => !skillsA.includes(s));

    // Dynamic pros/cons compile
    const getProsCons = (c: typeof careerA) => {
      const pros = ['High starting salary midpoint', 'Remote friendly flexibility'];
      if (c.growthTrend.toLowerCase().includes('explosive') || c.growthTrend.toLowerCase().includes('very high')) {
        pros.push('Explosive YoY job market demand');
      }
      const cons = [`Requires mastering ${c.difficulty.toLowerCase()} level challenges`];
      if (c.difficulty === 'Advanced') {
        cons.push('Longer training curve to job readiness');
      }
      return { pros, cons };
    };

    const pcA = getProsCons(careerA);
    const pcB = getProsCons(careerB);

    return {
      careerA: {
        id: careerA.id,
        title: careerA.title,
        salaryRange: careerA.salaryRange,
        difficulty: careerA.difficulty,
        estimatedTimeToReadyMonths: monthsA,
        pros: pcA.pros,
        cons: pcA.cons
      },
      careerB: {
        id: careerB.id,
        title: careerB.title,
        salaryRange: careerB.salaryRange,
        difficulty: careerB.difficulty,
        estimatedTimeToReadyMonths: monthsB,
        pros: pcB.pros,
        cons: pcB.cons
      },
      skillDifference: {
        common,
        onlyInA,
        onlyInB
      },
      salaryDifference,
      learningTimeDifference
    };
  }

  /**
   * Returns user's discovery histories.
   */
  async getDiscoveryHistory(uid: string): Promise<DiscoveryHistoryItem[]> {
    return this.repository.getHistory(uid);
  }
}
