import { AssessmentSession, AssessmentResult } from './models';
import { DemoUserService } from '../services/demo_user_service';

export interface AssessmentRepository {
  saveSession(session: AssessmentSession): Promise<void>;
  getSession(sessionId: string): Promise<AssessmentSession | null>;
  deleteSession(sessionId: string): Promise<void>;
  saveAttempt(uid: string, result: AssessmentResult): Promise<void>;
  getAttemptsByUid(uid: string): Promise<AssessmentResult[]>;
  getAttemptCount(uid: string, skill: string): Promise<number>;
  getBestScore(uid: string, skill: string): Promise<AssessmentResult | null>;
}

export class LocalAssessmentRepository implements AssessmentRepository {
  // Session Cache (Map: sessionId -> session)
  private sessions = new Map<string, AssessmentSession>();
  
  // Attempts Database (Map: uid -> list of results)
  private attempts = new Map<string, AssessmentResult[]>();

  async saveSession(session: AssessmentSession): Promise<void> {
    if (DemoUserService.isDemoUid(session.uid)) {
      const demoSession = DemoUserService.getSessionByUid(session.uid);
      if (demoSession) {
        demoSession.assessmentSessions.set(session.sessionId, session);
      }
      return;
    }
    this.sessions.set(session.sessionId, session);
  }

  async getSession(sessionId: string): Promise<AssessmentSession | null> {
    for (const demoSession of DemoUserService.getSessions()) {
      const s = demoSession.assessmentSessions.get(sessionId);
      if (s) return s;
    }
    return this.sessions.get(sessionId) || null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    for (const demoSession of DemoUserService.getSessions()) {
      if (demoSession.assessmentSessions.has(sessionId)) {
        demoSession.assessmentSessions.delete(sessionId);
        return;
      }
    }
    this.sessions.delete(sessionId);
  }

  async saveAttempt(uid: string, result: AssessmentResult): Promise<void> {
    if (DemoUserService.isDemoUid(uid)) {
      const demoSession = DemoUserService.getSessionByUid(uid);
      if (demoSession) {
        demoSession.assessments.push(result);
      }
      return;
    }
    const list = this.attempts.get(uid) || [];
    list.push(result);
    this.attempts.set(uid, list);
  }

  async getAttemptsByUid(uid: string): Promise<AssessmentResult[]> {
    if (DemoUserService.isDemoUid(uid)) {
      const demoSession = DemoUserService.getSessionByUid(uid);
      return demoSession ? demoSession.assessments : [];
    }
    return this.attempts.get(uid) || [];
  }

  async getAttemptCount(uid: string, skill: string): Promise<number> {
    const list = await this.getAttemptsByUid(uid);
    return list.filter(r => r.skill.toLowerCase() === skill.toLowerCase()).length;
  }

  async getBestScore(uid: string, skill: string): Promise<AssessmentResult | null> {
    const list = await this.getAttemptsByUid(uid);
    const skillList = list.filter(r => r.skill.toLowerCase() === skill.toLowerCase());
    if (skillList.length === 0) return null;
    
    return skillList.reduce((best, curr) => 
      curr.verifiedScore > best.verifiedScore ? curr : best
    , skillList[0]);
  }
}
