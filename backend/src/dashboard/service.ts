import { DashboardRepository } from './repository';
import { DashboardAggregator } from './aggregator';
import { SnapshotCalculator } from './snapshot';
import { WidgetsBuilder } from './widgets';
import { AnalyticsCompiler } from './analytics';
import { InsightsGenerator } from './insights';
import {
  DashboardResponse,
  CareerSnapshot,
  DashboardWidget,
  RecentActivity,
  DashboardAnalytics,
  DashboardInsights
} from './models';
import { DashboardLoadError } from './exceptions';

export class DashboardService {
  constructor(
    private repository: DashboardRepository,
    private aggregator: DashboardAggregator
  ) {}

  async getDashboard(uid: string, widgetsFilter?: string[]): Promise<DashboardResponse> {
    try {
      const aggregated = await this.aggregator.aggregate(uid);

      const snapshot = SnapshotCalculator.calculate(aggregated);
      let widgets = WidgetsBuilder.buildAll(aggregated);
      if (widgetsFilter && widgetsFilter.length > 0) {
        widgets = widgets.filter(w => widgetsFilter.includes(w.type));
      }
      
      const activities = WidgetsBuilder.buildRecentActivities(aggregated);
      const analytics = AnalyticsCompiler.compile(aggregated);
      const insights = await InsightsGenerator.generate(aggregated);

      return {
        uid,
        snapshot,
        widgets,
        activities,
        analytics,
        insights,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      throw new DashboardLoadError(uid, error);
    }
  }

  async getSnapshot(uid: string): Promise<CareerSnapshot> {
    try {
      const aggregated = await this.aggregator.aggregate(uid);
      return SnapshotCalculator.calculate(aggregated);
    } catch (error: any) {
      throw new DashboardLoadError(uid, error);
    }
  }

  async getWidgets(uid: string, widgetsFilter?: string[]): Promise<DashboardWidget[]> {
    try {
      const aggregated = await this.aggregator.aggregate(uid);
      let widgets = WidgetsBuilder.buildAll(aggregated);
      if (widgetsFilter && widgetsFilter.length > 0) {
        widgets = widgets.filter(w => widgetsFilter.includes(w.type));
      }
      return widgets;
    } catch (error: any) {
      throw new DashboardLoadError(uid, error);
    }
  }

  async getActivity(uid: string): Promise<RecentActivity[]> {
    try {
      const aggregated = await this.aggregator.aggregate(uid);
      return WidgetsBuilder.buildRecentActivities(aggregated);
    } catch (error: any) {
      throw new DashboardLoadError(uid, error);
    }
  }

  async getAnalytics(uid: string): Promise<DashboardAnalytics> {
    try {
      const aggregated = await this.aggregator.aggregate(uid);
      return AnalyticsCompiler.compile(aggregated);
    } catch (error: any) {
      throw new DashboardLoadError(uid, error);
    }
  }

  async getInsights(uid: string): Promise<DashboardInsights> {
    try {
      const aggregated = await this.aggregator.aggregate(uid);
      return await InsightsGenerator.generate(aggregated);
    } catch (error: any) {
      throw new DashboardLoadError(uid, error);
    }
  }
}
export default DashboardService;
