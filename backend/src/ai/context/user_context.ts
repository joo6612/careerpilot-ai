import { UserProfile } from '../../types';

/**
 * Generates user biography and interest context strings.
 */
export function buildUserContext(profile: UserProfile): string {
  const skillsList = (profile.skills || []).join(', ') || 'None declared';
  return `Candidate Name: ${profile.name || 'Anonymous'}
Biography/Interests: ${profile.aboutMe || 'Not provided'}
Education Level: ${profile.education?.degree || 'Not provided'}
Self-rated Skills: ${skillsList}
Target Career Goal: ${profile.selectedCareer || 'Undecided'}`;
}
export default buildUserContext;
