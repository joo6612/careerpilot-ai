import { DiscoveryHistoryItem } from './models';

export interface DiscoveryRepository {
  saveHistoryItem(item: DiscoveryHistoryItem): Promise<void>;
  getLatestItem(uid: string): Promise<DiscoveryHistoryItem | null>;
  getHistory(uid: string): Promise<DiscoveryHistoryItem[]>;
}

export class LocalDiscoveryRepository implements DiscoveryRepository {
  // Database store (Map: uid -> history list)
  private history = new Map<string, DiscoveryHistoryItem[]>();

  async saveHistoryItem(item: DiscoveryHistoryItem): Promise<void> {
    const list = this.history.get(item.uid) || [];
    list.push(item);
    this.history.set(item.uid, list);
  }

  async getLatestItem(uid: string): Promise<DiscoveryHistoryItem | null> {
    const list = this.history.get(uid) || [];
    if (list.length === 0) return null;
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }

  async getHistory(uid: string): Promise<DiscoveryHistoryItem[]> {
    const list = this.history.get(uid) || [];
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
export default LocalDiscoveryRepository;
