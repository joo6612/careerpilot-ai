import { UserProfile } from '../../types';
import { Career } from '../../career/models';
import { AssessmentResult } from '../../assessment/models';
import { buildUserContext } from './user_context';
import { buildCareerContext } from './career_context';
import { buildAssessmentContext } from './assessment_context';
import { buildResumeContext } from './resume_context';

export interface AIContextBlock {
  userContext: string;
  careerContext: string;
  assessmentContext: string;
  resumeContext: string;
  preferencesContext: string;
  roadmapContext: string;
  projectsContext: string;
  certificatesContext: string;
  vaultContext: string;
  conversationContext: string;
  compiledText: string;
}

/**
 * Aggregates all modular sub-contexts, vault documents, and conversation summaries into a unified prompt block.
 */
export function compileAIContext(
  profile: UserProfile,
  career: Career | null,
  assessments: AssessmentResult[],
  roadmapItems?: any[],
  vaultItems?: any[],
  conversationSummary?: string
): AIContextBlock {
  const userContext = buildUserContext(profile);
  const careerContext = buildCareerContext(career);
  const assessmentContext = buildAssessmentContext(assessments);
  const resumeContext = buildResumeContext(profile);

  const hoursPerDay = parseInt(profile.timeAvailability?.hoursPerDay || '0');
  const daysPerWeek = parseInt(profile.timeAvailability?.daysPerWeek || '0');
  const studyHoursPerWeek = hoursPerDay * daysPerWeek;

  const preferencesContext = `Learning Schedule Preferences:
- Committed Hours: ${studyHoursPerWeek || 15} hours per week
- Target Duration: ${profile.timeAvailability?.targetMonths || 6} months
- Preferred Learning Style: ${profile.favoriteSubjects || 'practical projects'}`;

  let roadmapContext = 'Roadmap Status: No custom learning roadmap generated yet.';
  if (roadmapItems && roadmapItems.length > 0) {
    const list = roadmapItems.map(item =>
      `- Milestone: ${item.title} (Status: ${item.status || 'locked'}, Duration: ${item.duration || 'N/A'}, Progress: ${item.progressPercent || 0}%)`
    );
    roadmapContext = `Current Roadmap Milestones:\n${list.join('\n')}`;
  }

  // Projects Extraction
  let projectsContext = 'Projects: No projects registered.';
  if (profile.projects) {
    projectsContext = `Projects:
- GitHub Link: ${profile.projects.githubUrl || 'N/A'}
- Portfolio Link: ${profile.projects.portfolioUrl || 'N/A'}
- Description: ${profile.projects.description || 'N/A'}`;
  }

  // Certificates Extraction
  let certificatesContext = 'Certificates: No certifications uploaded.';
  if (profile.certifications && profile.certifications.length > 0) {
    const list = profile.certifications.map(c => `- Certificate: ${c.courseName} (Issued by: ${c.provider || 'N/A'})`);
    certificatesContext = `Certifications:\n${list.join('\n')}`;
  }

  // Career Vault Document Details
  let vaultContext = 'Career Vault Documents: No files uploaded.';
  if (vaultItems && vaultItems.length > 0) {
    const list = vaultItems.map(file => `- File: ${file.fileName} (Category: ${file.category}, Uploaded: ${file.uploadedAt})`);
    vaultContext = `Vault Files:\n${list.join('\n')}`;
  }

  // Conversation Summary Context
  const conversationContext = conversationSummary 
    ? `Conversation Summary:\n${conversationSummary}`
    : 'Conversation Summary: No prior messages saved.';

  const compiledText = `=========================================
USER RELEVANT BIO-PROFILE
=========================================
${userContext}

=========================================
TARGET CAREER CATALOG PROFILE
=========================================
${careerContext}

=========================================
VERIFIED ASSESSMENT PROGRESS
=========================================
${assessmentContext}

=========================================
RESUME & ATS AUDITING
=========================================
${resumeContext}

=========================================
STUDY SCHEDULING PREFERENCES
=========================================
${preferencesContext}

=========================================
PROJECT DETAILS
=========================================
${projectsContext}

=========================================
CERTIFICATIONS
=========================================
${certificatesContext}

=========================================
CAREER VAULT FILES
=========================================
${vaultContext}

=========================================
CONVERSATION SUMMARY
=========================================
${conversationContext}

=========================================
ROADMAP TRACKING
=========================================
${roadmapContext}
=========================================`;

  return {
    userContext,
    careerContext,
    assessmentContext,
    resumeContext,
    preferencesContext,
    roadmapContext,
    projectsContext,
    certificatesContext,
    vaultContext,
    conversationContext,
    compiledText
  };
}
