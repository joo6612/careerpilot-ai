import { AIProvider } from './base';

export class MockProvider implements AIProvider {
  public name = 'Mock';

  async generateText(
    promptText: string,
    _systemInstruction?: string,
    jsonMode = false,
    _model?: string
  ): Promise<string> {
    const promptLower = promptText.toLowerCase();

    // 1. Suggest Careers
    if (promptLower.includes('suitable target career titles') || promptLower.includes('suggestcareers')) {
      let mockCareers = ['AI Engineer', 'Machine Learning Engineer', 'Software Developer'];
      if (promptLower.includes('learning') || promptLower.includes('ai') || promptLower.includes('python') || promptLower.includes('developer') || promptLower.includes('software')) {
        mockCareers = ['AI Engineer', 'Machine Learning Engineer', 'Software Developer'];
      } else if (promptLower.includes('doctor') || promptLower.includes('medicine') || promptLower.includes('health') || promptLower.includes('biology') || promptLower.includes('clinical')) {
        mockCareers = ['Doctor', 'Clinical Research Scientist', 'Health Informatics Specialist'];
      } else if (/\b(art|design|graphic|figma)\b/.test(promptLower)) {
        mockCareers = ['Graphic Designer', 'UI/UX Product Designer', 'Creative Art Director'];
      } else if (/\b(build|civil|structure)\b/.test(promptLower)) {
        mockCareers = ['Civil Engineer', 'Structural Engineer', 'Urban Infrastructure Planner'];
      } else if (/\b(machine|mechanic|solidworks)\b/.test(promptLower)) {
        mockCareers = ['Mechanical Engineer', 'CAD Design Engineer', 'Robotics Systems Engineer'];
      }
      return JSON.stringify(mockCareers);
    }

    // 2. Career Skills
    if (promptLower.includes('required for the career') || promptLower.includes('suggestcareerskills')) {
      let mockSkills = ['Communication', 'Project Management', 'Problem Solving', 'Leadership', 'Data Analysis', 'Time Management', 'Critical Thinking', 'Git'];
      if (promptLower.includes('ai') || promptLower.includes('machine learning') || promptLower.includes('data')) {
        mockSkills = ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'PyTorch', 'Data Analysis', 'Git', 'Mathematics'];
      } else if (promptLower.includes('doctor') || promptLower.includes('clinical') || promptLower.includes('medicine')) {
        mockSkills = ['Clinical Diagnosis', 'Patient Care', 'Medical Ethics', 'Communication', 'Pharmacology', 'Anatomy', 'Emergency Medicine', 'Patient Empathy'];
      } else if (promptLower.includes('civil')) {
        mockSkills = ['AutoCAD', 'Structural Design', 'Surveying', 'Project Management', 'Geotechnical Engineering', 'Concrete Technology', 'Math', 'Safety Codes'];
      } else if (/\b(art|design|graphic|figma)\b/.test(promptLower)) {
        mockSkills = ['Photoshop', 'Illustrator', 'Figma', 'UI/UX Design', 'Typography', 'Color Theory', 'Branding', 'User Research'];
      }
      return JSON.stringify(mockSkills);
    }

    // 2.5. Discovery Insights
    if (promptLower.includes("analyze the candidate's profile against the top recommended") || promptLower.includes('discoveryinsights')) {
      return JSON.stringify({
        recommendedCareers: [],
        rationale: "Discovery completed successfully.",
        strengths: [
          'Excellent foundational skills match in Python and SQL.',
          'Active certifications demonstrated in Google Cloud and TensorFlow.',
          'Strong practical execution shown in capstone Git projects.'
        ],
        weaknesses: [
          'Limited experience in production MLOps container settings.',
          'Needs stronger understanding of distributed computing models.'
        ],
        skillGaps: [
          'Docker',
          'Kubeflow',
          'Apache Spark'
        ],
        careerRisks: [
          'Heavy reliance on local script executions instead of automated cloud architectures.',
          'Potential delays in project timelines due to lack of CI/CD pipeline experience.'
        ],
        learningSuggestions: [
          'Complete the Kubernetes container deployment tutorial.',
          'Practice building REST API endpoints to serve ML predictions using FastAPI.'
        ],
        improvementPlan: [
          'Step 1: Dedicate 3 hours next week practicing Docker multi-stage builds.',
          'Step 2: Take the Skill Assessment test in Docker to verify knowledge.',
          'Step 3: Integrate Docker containers into your capstone project.'
        ]
      });
    }

    // 2.7. Readiness Insights
    if (promptLower.includes("analyze the candidate's profile readiness for the target career") || promptLower.includes('readinessinsights')) {
      return JSON.stringify({
        priorityTasks: ["Complete career profile detail fields"],
        strengths: [
          'Strong academic credentials matching target role requirements.',
          'Demonstrated assessment progress with high SQL test results.'
        ],
        weaknesses: [
          'Resume ATS compatibility rating is currently under the target threshold.',
          'No verified assessments completed for advanced programming concepts.'
        ],
        missingSkills: ['TypeScript', 'Docker', 'REST APIs'],
        estimatedCompletionTimeHours: 45,
        confidence: 'High'
      });
    }

    // 2.9. Dashboard Insights
    if (promptLower.includes("career progress dashboard details for the target career") || promptLower.includes('dashboardinsights')) {
      return JSON.stringify({
        topPriority: 'Complete your first roadmap milestone to gain structured skills.',
        priorityTasks: ["Complete career profile detail fields"],
        strengths: [
          'Excellent foundational skills match in Python and SQL.',
          'Active certifications demonstrated in Google Cloud and TensorFlow.'
        ],
        weaknesses: [
          'Resume ATS compatibility rating is currently under the target threshold.',
          'No verified assessments completed for advanced programming concepts.'
        ],
        missingSkills: ['TypeScript', 'Docker', 'REST APIs'],
        nextRecommendation: 'Schedule time next week to run a Skill Challenge and verify your technical skills.',
        upcomingMilestone: 'Introduction to Data Analysis Foundations'
      });
    }

    // 3. Resume Analysis
    if (promptLower.includes('analyze the resume') || promptLower.includes('resumereview')) {
      const strengths = ['Solid technical base', 'Clearly formatted project details', 'Relevant academic degree'];
      const weaknesses = ['Needs more quantifiable metrics', 'Could improve keywords for ATS scanners', 'More advanced certifications recommended'];
      
      let missing = ['Project Management', 'System Architecture', 'CI/CD Pipelines'];
      let score = 74;

      if (promptLower.includes('ai') || promptLower.includes('learning')) {
        missing = ['TensorFlow', 'PyTorch', 'Python'];
        score = 85;
      } else if (promptLower.includes('graphic') || promptLower.includes('design')) {
        missing = ['Figma', 'UI/UX Design', 'Illustrator'];
        score = 80;
      }

      return JSON.stringify({
        atsScore: score,
        strengths,
        weaknesses,
        missingSkills: missing
      });
    }

    // 4. Learning Roadmap
    if (promptLower.includes('personalized learning roadmap') || promptLower.includes('roadmap_planning')) {
      let career = 'Chosen Career';
      if (promptLower.includes('ai engineer')) career = 'AI Engineer';
      else if (promptLower.includes('backend developer')) career = 'Backend Developer';
      else if (promptLower.includes('frontend developer')) career = 'Frontend Developer';

      const mockRoadmap = [
        {
          id: 'rm-1',
          title: `Foundations of ${career}`,
          description: `Get started with the core theories, math, and software fundamentals required for ${career}.`,
          status: 'in-progress',
          duration: '4 weeks',
          skills: ['Core Concepts', 'Basic Scripting'],
          topics: ['Introduction to the Industry', 'Syntax & Setup', 'Basic Problem Solving', 'Version Control with Git'],
          tasks: [
            { id: 't1', title: 'Setup local workspace', status: 'in-progress', estimatedHours: 10 },
            { id: 't2', title: 'Learn Git basics', status: 'locked', estimatedHours: 15 }
          ]
        },
        {
          id: 'rm-2',
          title: `Intermediate ${career} Architecture`,
          description: 'Dive deep into specific framework models, database design, and local APIs.',
          status: 'locked',
          duration: '6 weeks',
          skills: ['Database Management', 'Framework APIs'],
          topics: ['Database Design (SQL/NoSQL)', 'API Integration', 'Data Validation & Processing', 'Testing & Debugging'],
          tasks: [
            { id: 't3', title: 'Design database schemas', status: 'locked', estimatedHours: 20 }
          ]
        },
        {
          id: 'rm-3',
          title: 'Advanced Scalability & Deployments',
          description: 'Learn how to build production-grade workflows and deploy your applications securely.',
          status: 'locked',
          duration: '6 weeks',
          skills: ['Cloud Computing', 'System Architecture'],
          topics: ['Docker & Containerization', 'CI/CD Pipelines', 'Cloud Setup (AWS/GCP)', 'Monitoring & Logging'],
          tasks: [
            { id: 't4', title: 'Containerize backend', status: 'locked', estimatedHours: 18 }
          ]
        },
        {
          id: 'rm-4',
          title: 'Capstone Project & Interview Readiness',
          description: 'Wrap up your learning by building a full capstone project and practicing mock interview questions.',
          status: 'locked',
          duration: '4 weeks',
          skills: ['System Design', 'Technical Interviewing'],
          topics: ['Full-Scale Project Deployment', 'Mock Interviews', 'Algorithm Practicing', 'STAR Method Responses'],
          tasks: [
            { id: 't5', title: 'Build capstone portfolio app', status: 'locked', estimatedHours: 30 }
          ]
        }
      ];
      return JSON.stringify(mockRoadmap);
    }

    // 5. Skill Challenge Assessment
    if (promptLower.includes('technical interviewer') || promptLower.includes('evaluatechallenge')) {
      let score = '8.5/10';
      let comment = "Great job structure! You clearly separated the context, action, and final results. To improve, try incorporating specific metrics (e.g. 'reduced latency by 40%') and mention how you coordinated with other developers.";
      
      const parts = promptLower.split('candidate answer: "');
      if (parts.length > 1 && parts[1].split('"')[0].length < 50) {
        score = '5.5/10';
        comment = "Your response is a bit short. Try using the STAR method (Situation, Task, Action, Result) to expand on details. Elaborate on the tools and logic you implemented.";
      }
      return JSON.stringify({ score, comment });
    }

    // 6. Mentor reply
    if (promptLower.includes('ai career mentor') || promptLower.includes('ai mentor') || promptLower.includes('mentor')) {
      if (jsonMode) {
        return JSON.stringify({
          reply: "I am here to guide you through your career goals. Focus on studying C#, Unity, or system architecture based on your selected path.",
          careerSuggestions: ["Software Engineer", "Systems Analyst"],
          nextQuestion: "What is your next career goal?"
        });
      }
      if (promptLower.includes('roadmap') || promptLower.includes('milestone')) {
        return "Your current roadmap is structured. I recommend tackling the 'Foundations' milestone first, dedicating about 3 hours per day as planned.";
      }
      if (promptLower.includes('resume') || promptLower.includes('ats')) {
        return "Your resume analysis displays your ATS Score. To improve this, I recommend incorporating missing keywords from the career skills list, specifically version control and framework tools.";
      }
      if (promptLower.includes('interview') || promptLower.includes('prepare')) {
        return "Preparing for interviews is key! Go to the 'Interview Preparation' tab on your dashboard. I have created mock interview questions specifically tailored to your target career. Try practicing them!";
      }
      return "That's an interesting question! Based on your target goal, you should focus on building practical projects that demonstrate the core skills listed on your profile.";
    }

    // 7. Onboarding chat
    if (promptLower.includes('onboarding ai guide') || promptLower.includes('onboarding')) {
      return JSON.stringify({
        assistantMessage: "That sounds fantastic! I have noted your details. What specific projects or certifications have you worked on?",
        extractedProfile: {
          name: "Alex Pioneer",
          education: "Bachelor of Science",
          college: "RISD",
          currentYear: "2026",
          skills: ["Figma", "UI/UX Design"],
          interests: ["Design Systems", "Web Design"],
          careerGoal: "UI/UX Product Designer",
          preferredDomain: "Design",
          projects: ["Portfolio Website"],
          certificates: ["Google UX Design Certificate"],
          preferredWorkStyle: "Remote",
          preferredLocation: "Japan",
          targetSalary: "10000"
        },
        updatedFields: ["skills", "education", "careerGoal"],
        nextQuestion: "What specific projects or certifications have you worked on?",
        conversationProgress: 60,
        confidence: 0.9
      });
    }

    // Default Fallback JSON
    if (jsonMode) {
      return JSON.stringify({
        reply: "I am here to guide you through your career goals. Let me know what you would like to discuss next.",
        careerSuggestions: ["Software Engineer", "Systems Analyst"],
        nextQuestion: "What is your next career goal?",
        confidence: 0.85,
        reasoning: "Orchestrator mock fallback",
        recommendations: [],
        nextActions: []
      });
    }

    return "Factual career advice generated by Mock Provider.";
  }
}
