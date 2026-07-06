import { DashboardAnalytics } from './models';
import { AggregatedData } from './aggregator';

export class AnalyticsCompiler {
  static compile(aggregated: AggregatedData): DashboardAnalytics {
    const {
      activeRoadmap,
      readinessHistory,
      readinessTrends,
      resumeHistory,
      roadmapHistory
    } = aggregated;

    // 1. Weekly & Monthly Progress from Roadmap progress calculations
    let weeklyProgress: { week: string; tasksCompleted: number }[] = [];
    let monthlyProgress: { month: string; milestonesCompleted: number }[] = [];

    if (activeRoadmap) {
      let completedTasks = 0;
      let completedMilestones = 0;
      activeRoadmap.phases.forEach(p => {
        p.milestones.forEach(m => {
          if (m.status === 'completed') completedMilestones++;
          m.tasks.forEach(t => {
            if (t.status === 'completed') completedTasks++;
          });
        });
      });

      weeklyProgress = [
        { week: 'Week 1', tasksCompleted: Math.min(completedTasks, 2) },
        { week: 'Week 2', tasksCompleted: Math.max(0, completedTasks - 2) }
      ];
      monthlyProgress = [
        { month: 'Month 1', milestonesCompleted: completedMilestones }
      ];
    }

    // 2. Career Trend: changes in selected careers from readiness history
    const careerTrend = readinessHistory
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(item => ({
        timestamp: item.timestamp,
        selectedCareer: item.report.metadata?.careerTitle || 'Not Selected'
      }));

    // If history is empty but profile has career, seed the trend
    if (careerTrend.length === 0 && aggregated.profile?.selectedCareer) {
      careerTrend.push({
        timestamp: new Date().toISOString(),
        selectedCareer: aggregated.profile.selectedCareer
      });
    }

    // 3. Readiness Trend
    const readinessTrend = readinessTrends?.historicalScores || [];

    // 4. Resume Improvement Trend
    const resumeImprovementTrend = resumeHistory
      .filter(res => res.atsAnalysis !== null)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(res => ({
        timestamp: res.timestamp,
        score: res.atsAnalysis!.atsScore
      }));

    // 5. Roadmap Completion Trend
    const roadmapCompletionTrend = roadmapHistory
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(item => ({
        timestamp: item.timestamp,
        completionPercentage: item.roadmap.completionPercentage
      }));

    return {
      weeklyProgress,
      monthlyProgress,
      careerTrend,
      readinessTrend,
      resumeImprovementTrend,
      roadmapCompletionTrend
    };
  }
}
