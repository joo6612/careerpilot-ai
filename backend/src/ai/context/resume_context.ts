import { UserProfile } from '../../types';

/**
 * Generates ATS scores and resume summaries context.
 */
export function buildResumeContext(profile: UserProfile): string {
  const resume = profile.resume;
  if (!resume || !resume.method) {
    return 'Resume Details: No resume uploaded or generated yet.';
  }

  const strengths = (resume.strengths || []).join(', ') || 'None identified';
  const weaknesses = (resume.weaknesses || []).join(', ') || 'None identified';
  const missing = (resume.missingSkills || []).join(', ') || 'None identified';

  return `Resume Method: ${resume.method}
Filename: ${resume.fileName || 'N/A'}
ATS Compatibility Score: ${resume.atsScore || 'N/A'}/100
Strengths: ${strengths}
Weaknesses: ${weaknesses}
Missing Keywords: ${missing}`;
}
export default buildResumeContext;
