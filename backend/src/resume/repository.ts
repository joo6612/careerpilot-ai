import { ResumeVersion } from './models';

export interface ResumeRepository {
  save(version: ResumeVersion): Promise<void>;
  getById(versionId: string): Promise<ResumeVersion | null>;
  getLatest(uid: string): Promise<ResumeVersion | null>;
  getHistory(uid: string): Promise<ResumeVersion[]>;
}

export class LocalResumeRepository implements ResumeRepository {
  private store = new Map<string, ResumeVersion[]>();

  async save(version: ResumeVersion): Promise<void> {
    const list = this.store.get(version.uid) || [];
    list.push(version);
    this.store.set(version.uid, list);
  }

  async getById(versionId: string): Promise<ResumeVersion | null> {
    for (const list of this.store.values()) {
      const found = list.find(v => v.id === versionId);
      if (found) return found;
    }
    return null;
  }

  async getLatest(uid: string): Promise<ResumeVersion | null> {
    const list = this.store.get(uid) || [];
    if (list.length === 0) return null;
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }

  async getHistory(uid: string): Promise<ResumeVersion[]> {
    const list = this.store.get(uid) || [];
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
export default LocalResumeRepository;
