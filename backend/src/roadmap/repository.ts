import { UserRoadmap, RoadmapHistoryItem } from './models';
import { DemoUserService } from '../services/demo_user_service';

export interface RoadmapRepository {
  save(roadmap: UserRoadmap): Promise<void>;
  getActive(uid: string): Promise<UserRoadmap | null>;
  saveHistoryItem(item: RoadmapHistoryItem): Promise<void>;
  getHistory(uid: string): Promise<RoadmapHistoryItem[]>;
}

export class LocalRoadmapRepository implements RoadmapRepository {
  private activeStore = new Map<string, UserRoadmap>();
  private historyStore = new Map<string, RoadmapHistoryItem[]>();

  async save(roadmap: UserRoadmap): Promise<void> {
    if (DemoUserService.isDemoUid(roadmap.uid)) {
      const session = DemoUserService.getSessionByUid(roadmap.uid);
      if (session) {
        session.activeRoadmap = roadmap;
      }
      return;
    }
    this.activeStore.set(roadmap.uid, roadmap);
  }

  async getActive(uid: string): Promise<UserRoadmap | null> {
    if (DemoUserService.isDemoUid(uid)) {
      const session = DemoUserService.getSessionByUid(uid);
      return session ? session.activeRoadmap : null;
    }
    return this.activeStore.get(uid) || null;
  }

  async saveHistoryItem(item: RoadmapHistoryItem): Promise<void> {
    if (DemoUserService.isDemoUid(item.uid)) {
      const session = DemoUserService.getSessionByUid(item.uid);
      if (session) {
        session.roadmapHistory.push(item);
      }
      return;
    }
    const list = this.historyStore.get(item.uid) || [];
    list.push(item);
    this.historyStore.set(item.uid, list);
  }

  async getHistory(uid: string): Promise<RoadmapHistoryItem[]> {
    if (DemoUserService.isDemoUid(uid)) {
      const session = DemoUserService.getSessionByUid(uid);
      if (!session) return [];
      return [...session.roadmapHistory].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    const list = this.historyStore.get(uid) || [];
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
export default LocalRoadmapRepository;
