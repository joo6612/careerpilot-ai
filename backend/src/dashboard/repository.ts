export interface DashboardRepository {
  getWidgetLayout(uid: string): Promise<string[] | null>;
  saveWidgetLayout(uid: string, layout: string[]): Promise<void>;
}

export class LocalDashboardRepository implements DashboardRepository {
  private layoutStore = new Map<string, string[]>();

  async getWidgetLayout(uid: string): Promise<string[] | null> {
    return this.layoutStore.get(uid) || null;
  }

  async saveWidgetLayout(uid: string, layout: string[]): Promise<void> {
    this.layoutStore.set(uid, layout);
  }
}
export default LocalDashboardRepository;
