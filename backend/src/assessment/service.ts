import { AssessmentSession, AssessmentResult, UserAnswers } from './models';
import { AssessmentRepository } from './repository';
import { QUESTION_BANK, getSkillList } from './question_bank';
import { AssessmentDifficulty } from './difficulty';
import { AssessmentScoring } from './scoring';
import { SessionNotFoundError, SkillNotFoundError } from './exceptions';

export class AssessmentService {
  constructor(private repository: AssessmentRepository) {}

  /**
   * Returns lists of skills containing configured questions.
   */
  async getSkillsAvailable(): Promise<string[]> {
    return getSkillList();
  }

  /**
   * Initializes a skill challenge session selecting questions based on self-rating rules.
   */
  async startAssessmentSession(
    uid: string,
    skill: string,
    selfRating: number
  ): Promise<AssessmentSession> {
    const skillList = getSkillList().map(s => s.toLowerCase());
    if (!skillList.includes(skill.toLowerCase())) {
      throw new SkillNotFoundError(skill);
    }

    const difficulty = AssessmentDifficulty.resolveDifficulty(selfRating);
    const pool = QUESTION_BANK.filter(
      q => q.skill.toLowerCase() === skill.toLowerCase() && q.difficulty === difficulty
    );

    if (pool.length === 0) {
      throw new SkillNotFoundError(skill);
    }

    // Select exactly 3 questions according to rules
    let selected: typeof pool = [];

    if (difficulty === 'Beginner') {
      const concepts = pool.filter(q => q.tags.includes('Basic Concept'));
      const codings = pool.filter(q => q.tags.includes('Simple Coding'));
      const logics = pool.filter(q => q.tags.includes('Aptitude') || q.tags.includes('Logic'));

      selected.push(concepts[0] || pool[0]);
      selected.push(codings[0] || pool[1] || pool[0]);
      selected.push(logics[0] || pool[2] || pool[0]);
    } else if (difficulty === 'Intermediate') {
      const concepts = pool.filter(q => q.tags.includes('Medium Concept'));
      const codings = pool.filter(q => q.tags.includes('Coding'));
      const problems = pool.filter(q => q.tags.includes('Problem Solving') || q.tags.includes('Scenario'));

      selected.push(concepts[0] || pool[0]);
      selected.push(codings[0] || pool[1] || pool[0]);
      selected.push(problems[0] || pool[2] || pool[0]);
    } else { // Advanced
      const codings = pool.filter(q => q.tags.includes('Coding'));
      const useCases = pool.filter(q => q.tags.includes('Real-world Use Case') || q.tags.includes('Scenario'));

      selected.push(codings[0] || pool[0]);
      selected.push(codings[1] || pool[1] || pool[0]);
      selected.push(useCases[0] || pool[2] || pool[0]);
    }

    // De-duplicate selected questions
    selected = Array.from(new Set(selected)).slice(0, 3);

    // Pad if deduplication removed duplicate fallbacks
    while (selected.length < 3 && pool.length > selected.length) {
      const extra = pool.find(q => !selected.includes(q));
      if (extra) selected.push(extra);
    }

    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create client-facing view (omit correct answers and explanations)
    const clientQuestions = selected.map(q => ({
      id: q.id,
      skill: q.skill,
      difficulty: q.difficulty,
      type: q.type,
      question: q.question,
      options: q.options,
      tags: q.tags
    }));

    const session: AssessmentSession = {
      sessionId,
      uid,
      skill,
      selfRating,
      difficulty,
      questions: clientQuestions,
      fullQuestions: selected,
      createdAt: Date.now()
    };

    await this.repository.saveSession(session);
    return session;
  }

  /**
   * Grades session answers, computes scores, and saves history.
   */
  async submitAssessmentSession(
    uid: string,
    sessionId: string,
    answers: UserAnswers
  ): Promise<AssessmentResult> {
    const session = await this.repository.getSession(sessionId);
    if (!session || session.uid !== uid) {
      throw new SessionNotFoundError(sessionId);
    }

    const attemptsCount = await this.repository.getAttemptCount(uid, session.skill);
    const result = AssessmentScoring.calculateResult(session, answers, attemptsCount + 1);

    await this.repository.saveAttempt(uid, result);
    await this.repository.deleteSession(sessionId);

    return result;
  }

  /**
   * Retrieves full attempt history log for a specific user.
   */
  async getAttemptsHistory(uid: string): Promise<AssessmentResult[]> {
    return this.repository.getAttemptsByUid(uid);
  }

  /**
   * Resolves a single past result details.
   */
  async getResultDetails(uid: string, sessionId: string): Promise<AssessmentResult | null> {
    const list = await this.repository.getAttemptsByUid(uid);
    return list.find(r => r.sessionId === sessionId) || null;
  }

  /**
   * Resolves the best verified attempt score for a specific skill.
   */
  async getBestScore(uid: string, skill: string): Promise<AssessmentResult | null> {
    return this.repository.getBestScore(uid, skill);
  }
}
