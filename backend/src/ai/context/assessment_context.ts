import { AssessmentResult } from '../../assessment/models';

/**
 * Compiles a list of verified skills and confidence levels.
 */
export function buildAssessmentContext(attempts: AssessmentResult[]): string {
  if (attempts.length === 0) {
    return 'Verified Skills Assessment History: No assessments completed yet.';
  }

  // Get the best score achieved for each skill
  const bestScores = new Map<string, AssessmentResult>();
  attempts.forEach(attempt => {
    const existing = bestScores.get(attempt.skill);
    if (!existing || attempt.verifiedScore > existing.verifiedScore) {
      bestScores.set(attempt.skill, attempt);
    }
  });

  const lines = Array.from(bestScores.values()).map(r => 
    `- ${r.skill}: Verified Level = ${r.skillLevel} (Score: ${r.verifiedScore}/100, Confidence: ${r.confidence})`
  );

  return `Verified Skills Assessment History:\n${lines.join('\n')}`;
}
export default buildAssessmentContext;
