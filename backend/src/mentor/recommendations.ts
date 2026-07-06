import { MentorRecommendation, MentorPersonaId } from './models';

/**
 * Maps persona IDs to default recommended actions for the recommendation engine.
 */
const PERSONA_DEFAULT_ACTIONS: Record<MentorPersonaId, string> = {
  'career-mentor': 'Review your Career Readiness score and identify your top priority gap.',
  'resume-mentor': 'Update your resume with the missing keywords highlighted in your ATS analysis.',
  'interview-coach': 'Practice 2 mock interview questions in the Interview Preparation section.',
  'learning-coach': 'Complete the next task in your active roadmap milestone today.',
  'roadmap-planner': 'Open your roadmap and mark any completed tasks to update your progress.'
};

const PERSONA_RESOURCES: Record<MentorPersonaId, string[]> = {
  'career-mentor': ['Career Discovery Engine', 'Career Readiness Dashboard', 'Skill Assessment Module'],
  'resume-mentor': ['Resume Intelligence Engine', 'ATS Score Report', 'Skill Gap Analysis'],
  'interview-coach': ['Interview Preparation Module', 'LeetCode Practice', 'STAR Method Guide'],
  'learning-coach': ['Roadmap Learning Tasks', 'Coursera', 'freeCodeCamp', 'Official Documentation'],
  'roadmap-planner': ['Learning Roadmap Module', 'Milestone Progress Tracker', 'Weekly Schedule Planner']
};

const PERSONA_NEXT_QUESTIONS: Record<MentorPersonaId, string[]> = {
  'career-mentor': [
    'What industry trends should I be aware of for my target career?',
    'How do I network effectively in this field?',
    'What certifications would make me stand out?'
  ],
  'resume-mentor': [
    'Can you review my projects section?',
    'How do I add quantifiable metrics to my achievements?',
    'What format works best for an ATS resume?'
  ],
  'interview-coach': [
    'Give me a harder technical question.',
    'How do I answer questions about my weaknesses?',
    'What should I ask the interviewer at the end?'
  ],
  'learning-coach': [
    'What is the best course for my next missing skill?',
    'How many hours per week should I study?',
    'Can you build me a 30-day study plan?'
  ],
  'roadmap-planner': [
    'Which milestone should I prioritize this week?',
    'How do I catch up if I fall behind on my roadmap?',
    'Show me what comes after my current milestone.'
  ]
};

/**
 * Derives a structured MentorRecommendation from the reply text and persona context.
 * Uses heuristic keyword matching to assign confidence levels and tailored actions.
 */
export function buildRecommendation(
  replyText: string,
  personaId: MentorPersonaId
): MentorRecommendation {
  const lower = replyText.toLowerCase();

  // Confidence heuristic: longer, specific replies get higher confidence
  let confidence: 'Low' | 'Medium' | 'High' = 'Medium';
  if (replyText.length > 300) confidence = 'High';
  else if (replyText.length < 80) confidence = 'Low';

  // Build reason from first sentence of reply
  const firstSentence = replyText.split(/[.!?]/)[0].trim();
  const reason = firstSentence.length > 20
    ? firstSentence
    : 'Based on your complete career profile and current readiness state.';

  // Pick recommended action
  let recommendedAction = PERSONA_DEFAULT_ACTIONS[personaId];

  // Keyword-based action overrides
  if (lower.includes('resume') || lower.includes('ats')) {
    recommendedAction = 'Upload or update your resume and run a fresh ATS analysis.';
  } else if (lower.includes('roadmap') || lower.includes('milestone')) {
    recommendedAction = 'Open your roadmap and update the status of your current tasks.';
  } else if (lower.includes('interview') || lower.includes('practice')) {
    recommendedAction = 'Practice at least one mock interview question today.';
  } else if (lower.includes('course') || lower.includes('learn') || lower.includes('study')) {
    recommendedAction = 'Enroll in the recommended course and log your study hours this week.';
  } else if (lower.includes('assessment') || lower.includes('skill test')) {
    recommendedAction = 'Take a skill challenge assessment to verify your knowledge level.';
  }

  // Pick next suggested question
  const questions = PERSONA_NEXT_QUESTIONS[personaId];
  const nextSuggestedQuestion = questions[Math.floor(Math.random() * questions.length)];

  return {
    reason,
    confidence,
    recommendedAction,
    relatedResources: PERSONA_RESOURCES[personaId],
    nextSuggestedQuestion
  };
}
