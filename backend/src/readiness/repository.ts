import { ReadinessHistoryItem } from './models';

export interface ReadinessRepository {
  save(item: ReadinessHistoryItem): Promise<void>;
  getLatest(uid: string): Promise<ReadinessHistoryItem | null>;
  getHistory(uid: string): Promise<ReadinessHistoryItem[]>;
}

export class LocalReadinessRepository implements ReadinessRepository {
  private store = new Map<string, ReadinessHistoryItem[]>();

  async save(item: ReadinessHistoryItem): Promise<void> {
    const list = this.store.get(item.uid) || [];
    list.push(item);
    this.store.set(item.uid, list);
  }

  async getLatest(uid: string): Promise<ReadinessHistoryItem | null> {
    const list = this.store.get(uid) || [];
    if (list.length === 0) return null;
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }

  async getHistory(uid: string): Promise<ReadinessHistoryItem[]> {
    const list = this.store.get(uid) || [];
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
export default LocalReadinessRepository;
