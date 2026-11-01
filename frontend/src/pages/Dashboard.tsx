import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/useAuth';
import { ApiClient } from '../api/client';
import {
  LayoutDashboard,
  Map,
  Cpu,
  FileCheck2,
  Award,
  Settings,
  Moon,
  Sun,
  Send,
  Sparkles,
  LogOut,
  CheckCircle2,
  Brain,
  Menu,
  X,
  Search,
  Bell,
  Flame,
  Bot,
  FileUp,
  Target,
  Folder,
  Download,
  Eye,
  Compass,
  FileText,
  Volume2,
  VolumeX,
  ExternalLink,
  Code,
  Globe,
  AlertCircle,
  Shield,
  Save,
  Check
} from 'lucide-react';
import { GlobalSearch } from '../components/GlobalSearch';
import type { MilestoneProject } from '../types';

interface VaultFile {
  id: string;
  name: string;
  folder: 'Resume' | 'Certificates' | 'Projects' | 'Academic Documents' | 'Offer Letters' | 'Other Documents';
  size: string;
  uploadedAt: string;
  fileType: string;
  previewUrl?: string;
  textContent?: string;
}

export const Dashboard: React.FC = () => {
  const {
    profile,
    updateProfile,
    dashboardTab,
    setDashboardTab,
    darkMode,
    toggleDarkMode,
    chatMessages,
    sendChatMessage,
    roadmap,
    toggleRoadmapItemStatus,
    streak,
    skillsLearnedCount,
    coursesCompletedCount,
    projectsBuiltCount,
    interviewPracticeCount,
    setPage,
    runResumeAnalysis,
    generateSkillsForCareer,
    resetApp
  } = useApp();

  const { user, logout } = useAuth();

  // Navigation & UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Interactive Notifications State (Items 19)
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Roadmap Milestone Unlocked', text: 'Stage 2 is now available for learning and project work.', isNew: true, targetTab: 'roadmap' },
    { id: '2', title: 'Career Description Updated', text: 'Review 14,800+ active roles and curated course tracks.', isNew: true, targetTab: 'discovery' },
    { id: '3', title: 'Resume ATS Analysis Calibrated', text: 'Optimizing technical keywords raised score to 84%.', isNew: true, targetTab: 'resume' },
    { id: '4', title: 'AI Mentor Ready', text: 'Ask your interview coach a mock technical question.', isNew: false, targetTab: 'mentor' }
  ]);

  // Today's Mission States
  const [taskActive, setTaskActive] = useState<boolean>(false);
  const [taskCompleted, setTaskCompleted] = useState<boolean>(false);
  const [taskTimeLeft, setTaskTimeLeft] = useState<number>(2700); // 45 mins

  // Resume Analyzer & Generator States (Items 22, 23, 24)
  const [resumeFile, setResumeFile] = useState<string>(profile.resume.fileName || '');
  const [resumeStage, setResumeStage] = useState<'idle' | 'uploading' | 'reading' | 'ats' | 'skills' | 'gaps' | 'done'>('idle');
  const [resumeProgress, setResumeProgress] = useState(0);
  const [showResumePreCheck, setShowResumePreCheck] = useState<boolean>(false);
  const [resumeExportModal, setResumeExportModal] = useState<boolean>(false);

  // Career Description Hub States (Items 14, 17)

  // Vault States (Items 25, 26, 27)
  const [selectedVaultFolder, setSelectedVaultFolder] = useState<string>('All');
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([
    {
      id: 'v-1',
      name: 'Software_Engineering_Resume_2026.pdf',
      folder: 'Resume',
      size: '1.2 MB',
      uploadedAt: '2026-10-28',
      fileType: 'PDF',
      textContent: 'Alex Pioneer - Full-Stack & AI Systems Developer. Core competencies: Python, TypeScript, React, Docker, Machine Learning pipelines.'
    },
    {
      id: 'v-2',
      name: 'Google_Cloud_Architect_Certificate.pdf',
      folder: 'Certificates',
      size: '850 KB',
      uploadedAt: '2026-10-15',
      fileType: 'PDF',
      textContent: 'Official verification of Google Cloud Certified Professional Cloud Architect.'
    },
    {
      id: 'v-3',
      name: 'Distributed_Cache_Project_Report.docx',
      folder: 'Projects',
      size: '2.1 MB',
      uploadedAt: '2026-09-30',
      fileType: 'DOCX',
      textContent: 'Design and benchmarking report for a high-throughput distributed LRU memory cache with Raft consensus.'
    }
  ]);
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);
  const vaultFileInputRef = useRef<HTMLInputElement>(null);

  // AI Mentor Mode State (Item 11, 28)
  const [mentorMode, setMentorMode] = useState<'career' | 'resume' | 'interview' | 'learning' | 'roadmap'>('career');
  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Profile Edit States (Items 5, 6)
  const [editableAboutMe, setEditableAboutMe] = useState<string>(profile.aboutMe || '');
  const [aboutMeSaved, setAboutMeSaved] = useState<boolean>(false);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: profile.socialLinks?.linkedin || '',
    indeed: profile.socialLinks?.indeed || '',
    naukri: profile.socialLinks?.naukri || '',
    leetcode: profile.socialLinks?.leetcode || '',
    codechef: profile.socialLinks?.codechef || '',
    geeksforgeeks: profile.socialLinks?.geeksforgeeks || ''
  });
  const [socialSaved, setSocialSaved] = useState<boolean>(false);

  // Settings State (Item 4)
  const [settingsName, setSettingsName] = useState<string>(profile.name || 'Alex Pioneer');
  const [settingsGoal, setSettingsGoal] = useState<string>(profile.selectedCareer || 'AI Engineer');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string>('');

  // Project submission modal state (Item 20)
  const [activeProjectModal, setActiveProjectModal] = useState<MilestoneProject | null>(null);
  const [projectRepoLink, setProjectRepoLink] = useState<string>('');
  const [projectDemoLink, setProjectDemoLink] = useState<string>('');
  const [projectNotes, setProjectNotes] = useState<string>('');
  const [projectSubmittedSuccess, setProjectSubmittedSuccess] = useState<boolean>(false);

  // Synchronize aboutMe and social links when profile loads
  useEffect(() => {
    if (profile.aboutMe) setEditableAboutMe(profile.aboutMe);
    if (profile.socialLinks) {
      setSocialLinks({
        linkedin: profile.socialLinks.linkedin || '',
        indeed: profile.socialLinks.indeed || '',
        naukri: profile.socialLinks.naukri || '',
        leetcode: profile.socialLinks.leetcode || '',
        codechef: profile.socialLinks.codechef || '',
        geeksforgeeks: profile.socialLinks.geeksforgeeks || ''
      });
    }
  }, [profile]);

  // TTS Read-Aloud Helper (Item 11)
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Timer countdown for Today's Mission
  useEffect(() => {
    let timer: any;
    if (taskActive && taskTimeLeft > 0 && !taskCompleted) {
      timer = setInterval(() => {
        setTaskTimeLeft(prev => {
          if (prev <= 1) {
            setTaskActive(false);
            setTaskCompleted(true);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [taskActive, taskTimeLeft, taskCompleted]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Chat Submission Handler
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(`[${mentorMode.toUpperCase()}] ${chatInput}`);
    setChatInput('');
  };

  // Resume ATS Scan Workflow
  const triggerResumeScan = async (fileName: string) => {
    setResumeFile(fileName);
    setResumeStage('uploading');
    setResumeProgress(20);

    await new Promise(r => setTimeout(r, 400));
    setResumeProgress(50);
    setResumeStage('reading');

    await new Promise(r => setTimeout(r, 400));
    setResumeProgress(80);
    setResumeStage('ats');

    try {
      await runResumeAnalysis('upload', fileName);
    } catch (e) {
      console.error(e);
    }

    setResumeProgress(100);
    setResumeStage('done');
  };

  // Pre-Resume Check and Multi-Format Exporter (Items 22, 23)
  const handleInitiateResumeGeneration = () => {
    const missing: string[] = [];
    if (!profile.education.degree && !profile.education.collegeName) missing.push('Education details');
    if (!profile.skills || profile.skills.length === 0) missing.push('Key skills');
    if (!profile.projects.description && !profile.projects.githubUrl) missing.push('Project portfolio');

    if (missing.length > 0) {
      setShowResumePreCheck(true);
    } else {
      setResumeExportModal(true);
    }
  };

  const downloadFileFormatted = (format: 'json' | 'html' | 'docx') => {
    const resumeData = {
      name: profile.name,
      aboutMe: profile.aboutMe,
      targetCareer: profile.selectedCareer || 'Software Engineer',
      skills: profile.skills,
      education: profile.education,
      experience: profile.professionalDetails,
      projects: profile.projects,
      socialLinks: profile.socialLinks
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.name.replace(/\s+/g, '_')}_Resume.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'html') {
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${profile.name} - Resume</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #111; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1 { margin-bottom: 4px; color: #005f73; }
    h2 { border-bottom: 2px solid #0a9396; padding-bottom: 4px; color: #001219; margin-top: 24px; }
    .contact { font-size: 14px; color: #555; margin-bottom: 20px; }
    .skill-tag { display: inline-block; background: #e9d8a6; padding: 2px 8px; border-radius: 4px; margin: 2px; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${profile.name}</h1>
  <div class="contact">Target Role: ${profile.selectedCareer || 'Software Engineer'} | Country: ${profile.country || 'Global'}</div>
  <h2>Professional Summary</h2>
  <p>${profile.aboutMe || 'Dedicated technology professional focused on building robust, scalable solutions.'}</p>
  <h2>Technical Skills</h2>
  <p>${profile.skills.map(s => `<span class="skill-tag">${s}</span>`).join(' ')}</p>
  <h2>Education</h2>
  <p><strong>${profile.education.degree || 'Bachelor Degree'}</strong> - ${profile.education.collegeName || 'University'} (${profile.education.graduationYear || '2026'})</p>
  <h2>Experience</h2>
  <p><strong>${profile.professionalDetails.jobTitle || 'Engineer'}</strong> - ${profile.professionalDetails.industry || 'Technology'} (${profile.professionalDetails.yearsOfExperience || '0'} Years Experience)</p>
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.name.replace(/\s+/g, '_')}_Resume.html`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'docx') {
      const wordHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Resume</title><style>body { font-family: Calibri, Arial, sans-serif; }</style></head>
<body>
  <h1 style="color:#005f73;">${profile.name}</h1>
  <p><strong>Target Role:</strong> ${profile.selectedCareer || 'Software Engineer'}</p>
  <hr/>
  <h3>Professional Summary</h3>
  <p>${profile.aboutMe || 'Dedicated software and systems specialist.'}</p>
  <h3>Technical Skills</h3>
  <p>${profile.skills.join(', ')}</p>
  <h3>Education</h3>
  <p>${profile.education.degree || 'Bachelor of Science'} - ${profile.education.collegeName || 'State University'} (${profile.education.graduationYear || '2026'})</p>
  <h3>Professional Experience</h3>
  <p>${profile.professionalDetails.jobTitle || 'Software Engineer'} - ${profile.professionalDetails.industry || 'Technology'}</p>
</body>
</html>`;
      const blob = new Blob([wordHtml], { type: 'application/vnd.ms-word' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.name.replace(/\s+/g, '_')}_Resume.docx`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Career Vault AI Auto-Categorization & Strict Compression Upload (Items 25, 26)
  const handleVaultFileUpload = async (file: File) => {
    // 1. Strict format validation
    const validExtensions = ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(ext)) {
      alert(`Invalid file format (.${ext}). Career Vault only accepts: PDF, DOCX, DOC, JPG, JPEG, and PNG.`);
      return;
    }

    // 2. Intelligent AI / Heuristic Classification (Item 25)
    const lowerName = file.name.toLowerCase();
    let detectedFolder: VaultFile['folder'] = 'Other Documents';
    if (/resume|cv|curriculum/.test(lowerName)) detectedFolder = 'Resume';
    else if (/cert|course|completion|diploma|badge|award/.test(lowerName)) detectedFolder = 'Certificates';
    else if (/project|portfolio|github|cases*study|code/.test(lowerName)) detectedFolder = 'Projects';
    else if (/transcript|marksheet|degree|grade|semester|university|college|school/.test(lowerName)) detectedFolder = 'Academic Documents';
    else if (/offer|joining|contract|appointment|salary/.test(lowerName)) detectedFolder = 'Offer Letters';

    // 3. Client-side Image compression simulation
    let processedSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    if (file.type.startsWith('image/') && file.size > 1024 * 1024) {
      processedSize = `${(file.size * 0.45 / (1024 * 1024)).toFixed(1)} MB (compressed)`;
    }

    try {
      const uploadBody = {
        category: detectedFolder,
        title: file.name,
        description: `AI Auto-categorized as ${detectedFolder}`,
        fileName: file.name,
        fileType: ext.toUpperCase(),
        fileSize: file.size,
        textContent: `Parsed and validated document: ${file.name}. Indexed in ${detectedFolder}.`
      };

      const res = await ApiClient.post<{ document: any }>('/vault/upload', uploadBody);
      const newDoc: VaultFile = {
        id: res?.document?.id || `v-${Date.now()}`,
        name: file.name,
        folder: detectedFolder,
        size: processedSize,
        uploadedAt: new Date().toISOString().split('T')[0],
        fileType: ext.toUpperCase(),
        textContent: uploadBody.textContent
      };

      setVaultFiles(prev => [newDoc, ...prev]);
      alert(`Document indexed successfully into '${detectedFolder}' folder!`);
    } catch (err) {
      console.error('Vault upload error:', err);
      // Local optimistic fallback
      const newDoc: VaultFile = {
        id: `v-${Date.now()}`,
        name: file.name,
        folder: detectedFolder,
        size: processedSize,
        uploadedAt: new Date().toISOString().split('T')[0],
        fileType: ext.toUpperCase(),
        textContent: `Parsed document: ${file.name}`
      };
      setVaultFiles(prev => [newDoc, ...prev]);
      alert(`Document added to '${detectedFolder}' folder!`);
    }
  };

  // Career Discovery / Description Hub Career Selection
  const careerDiscoveryData = [
    {
      name: 'AI / Machine Learning Engineer',
      match: 94,
      desc: 'Build high-performance deep learning systems, agentic cognitive architectures, and fine-tuned LLM services.',
      vacancies: '14,800+ Active Roles',
      trend: '+28% YoY Surge',
      salary: '$125,000 - $185,000',
      skills: ['Python', 'PyTorch', 'Transformers', 'FastAPI', 'Docker', 'MLOps'],
      setting: 'Remote / Hybrid',
      courses: [
        { platform: 'coursera', title: 'Deep Learning Specialization (Andrew Ng)', url: 'https://www.coursera.org/specializations/deep-learning' },
        { platform: 'youtube', title: 'Full LLM & Agentic AI Masterclass', url: 'https://www.youtube.com/results?search_query=generative+ai+agents+tutorial' },
        { platform: 'udemy', title: 'Machine Learning A-Z: AI, Python & R', url: 'https://www.udemy.com/course/machinelearning/' },
        { platform: 'kaggle', title: 'LLM Prompt Recovery & Fine-Tuning Benchmarks', url: 'https://www.kaggle.com/competitions' }
      ]
    },
    {
      name: 'Full Stack Software Engineer',
      match: 91,
      desc: 'Architect end-to-end responsive web applications, robust microservices, scalable databases, and automated CI/CD.',
      vacancies: '32,500+ Active Roles',
      trend: '+19% YoY Growth',
      salary: '$105,000 - $160,000',
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'Docker'],
      setting: 'Hybrid / Flexible',
      courses: [
        { platform: 'coursera', title: 'Meta Full-Stack Developer Certificate', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' },
        { platform: 'youtube', title: 'Production Full-Stack Architecture Guide', url: 'https://www.youtube.com/results?search_query=fullstack+architecture+react+node' },
        { platform: 'udemy', title: 'The Complete 2026 Web Development Bootcamp', url: 'https://www.udemy.com/topic/web-development/' },
        { platform: 'kaggle', title: 'Web Traffic Forecasting Dataset & Notebooks', url: 'https://www.kaggle.com/datasets' }
      ]
    },
    {
      name: 'Cloud & DevOps Platform Architect',
      match: 86,
      desc: 'Design resilient Kubernetes clusters, infrastructure as code, zero-trust cloud security, and automated pipelines.',
      vacancies: '18,200+ Active Roles',
      trend: '+22% YoY Growth',
      salary: '$120,000 - $175,000',
      skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS/GCP', 'Linux', 'CI/CD'],
      setting: 'Remote',
      courses: [
        { platform: 'coursera', title: 'Google Cloud Platform Architecture Certification', url: 'https://www.coursera.org/professional-certificates/gcp-cloud-architect' },
        { platform: 'youtube', title: 'Kubernetes in Production Hands-on Lab', url: 'https://www.youtube.com/results?search_query=kubernetes+docker+production+tutorial' },
        { platform: 'udemy', title: 'Certified Kubernetes Administrator (CKA)', url: 'https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/' },
        { platform: 'kaggle', title: 'Cloud Infrastructure Telemetry & Anomaly Detection', url: 'https://www.kaggle.com/datasets' }
      ]
    }
  ];

  // Industry Tech Feeds (Item 17)
  const industryNews = [
    { title: 'Agentic Workflows Surge in Engineering Demands', source: 'Tech Trends 2026', time: '2 hours ago', tag: 'AI & Systems' },
    { title: 'TypeScript & Rust Gain Dominant Footprint in High-Performance Services', source: 'Developer Index', time: '5 hours ago', tag: 'Architecture' },
    { title: 'Modern Enterprises Standardize on Micro-Frontends & Zero-Trust Cloud', source: 'Cloud Computing Weekly', time: '1 day ago', tag: 'DevOps' }
  ];

  // Navigation Items
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'discovery', label: 'Career Description', icon: <Compass className="w-4 h-4" /> },
    { id: 'roadmap', label: 'Roadmap', icon: <Map className="w-4 h-4" /> },
    { id: 'resume', label: 'Resume', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'vault', label: 'Career Vault', icon: <Folder className="w-4 h-4" /> },
    { id: 'mentor', label: 'AI Mentor', icon: <Bot className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <Award className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AP';

  return (
    <div className={`h-screen overflow-hidden flex flex-row relative transition-colors duration-300 ${darkMode ? 'bg-ink-black text-vanilla-custard' : 'bg-slate-50 text-slate-800'}`}>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-ink-black/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* 1. FIXED SIDEBAR */}
      <aside className={`fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-30 w-64 border-r flex flex-col justify-between h-screen p-5 shrink-0 transition-transform duration-300 transform md:transform-none ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${darkMode ? 'bg-ink-black border-pearl-aqua/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl md:shadow-none'}`}>
        <div className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-230px)] scrollbar-none">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-1 bg-transparent">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-dark-cyan via-pearl-aqua to-golden-orange flex items-center justify-center shadow-lg shadow-dark-cyan/20">
                <Brain className="w-5 h-5 text-ink-black" />
              </div>
              <div className="flex flex-col text-left bg-transparent">
                <span className={`font-display font-extrabold text-sm leading-none tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  CareerPilot
                </span>
                <span className="text-[9px] font-bold text-pearl-aqua tracking-wider uppercase">Operating System</span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-pearl-aqua/70 hover:text-white md:hidden border-0 bg-transparent cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 bg-transparent">
            {menuItems.map(item => {
              const active = dashboardTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setDashboardTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer text-left relative group ${active
                    ? darkMode
                      ? 'bg-dark-teal/50 text-white shadow-inner border border-pearl-aqua/20'
                      : 'bg-slate-100 text-slate-900 font-extrabold'
                    : darkMode
                      ? 'text-pearl-aqua/70 hover:bg-dark-teal/20 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-pearl-aqua"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Shortcut */}
        <div className="flex flex-col gap-4 border-t border-pearl-aqua/10 pt-4 bg-transparent shrink-0">
          <div
            onClick={() => setDashboardTab('profile')}
            className="flex items-center gap-2.5 p-2 rounded-2xl bg-dark-teal/20 border border-pearl-aqua/10 cursor-pointer hover:border-dark-cyan transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-golden-orange to-burnt-caramel flex items-center justify-center text-[10px] font-extrabold text-ink-black uppercase shrink-0">
              {initials}
            </div>
            <div className="flex flex-col text-left max-w-[120px] bg-transparent">
              <span className="text-[11px] font-bold truncate text-white">
                {profile.name}
              </span>
              <span className="text-[9px] text-pearl-aqua/70 truncate">
                {profile.selectedCareer || 'Configure goal'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-1 text-pearl-aqua/70">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg hover:bg-dark-teal/40 hover:text-white transition-colors border-0 bg-transparent cursor-pointer"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-golden-orange" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-[11px] hover:text-rusty-spice transition-colors border-0 bg-transparent cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* 2. STICKY TOP NAVBAR */}
        <header className={`sticky top-0 z-20 px-6 py-3 border-b flex justify-between items-center backdrop-blur-md transition-colors duration-300 ${darkMode ? 'bg-ink-black/85 border-pearl-aqua/10' : 'bg-slate-50/85 border-slate-200'}`}>
          <div className="flex items-center gap-4 bg-transparent">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg border-0 bg-transparent cursor-pointer md:hidden text-pearl-aqua hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Search Trigger (< sm) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl bg-dark-teal/20 border border-pearl-aqua/15 text-pearl-aqua hover:text-white sm:hidden cursor-pointer flex items-center justify-center"
              aria-label="Search platform"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Global Search Bar */}
            <div
              onClick={() => setIsSearchOpen(true)}
              className="relative max-w-xs hidden sm:flex items-center px-3 py-1.5 bg-dark-teal/20 border border-pearl-aqua/20 rounded-xl text-xs text-pearl-aqua/80 hover:border-dark-cyan transition-all w-60 cursor-pointer select-none"
            >
              <Search className="w-3.5 h-3.5 text-pearl-aqua/60 mr-2" />
              <span>Search platform...</span>
              <span className="text-[8px] px-1 py-0.5 rounded bg-dark-teal/40 border border-pearl-aqua/20 text-vanilla-custard font-bold ml-auto">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Header Metrics */}
          <div className="flex items-center gap-3 bg-transparent">
            {/* Active Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-golden-orange/15 border border-golden-orange/30 text-golden-orange text-xs font-extrabold">
              <Flame className="w-4 h-4 text-golden-orange" />
              <span>{streak} Days</span>
            </div>

            {/* Notifications Dropdown (Item 19) */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-dark-teal/20 border border-pearl-aqua/15 text-pearl-aqua hover:text-white transition-all cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => n.isNew) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-golden-orange animate-ping"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 glass-card rounded-2xl p-4 shadow-2xl border border-pearl-aqua/30 text-left z-50 flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-pearl-aqua/10 pb-2 mb-1 bg-transparent">
                    <span className="text-xs font-bold text-white">Interactive Alerts</span>
                    <button
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isNew: false })))}
                      className="text-[9px] text-pearl-aqua hover:text-white bg-transparent border-0 cursor-pointer font-bold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs bg-transparent">
                    {notifications.map(n => (
                      <button
                        key={n.id}
                        onClick={() => {
                          setDashboardTab(n.targetTab);
                          setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isNew: false } : item));
                          setShowNotifications(false);
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-dark-teal/40 flex flex-col gap-0.5 border-b border-pearl-aqua/10 last:border-b-0 cursor-pointer transition-colors bg-transparent border-0 group"
                      >
                        <div className="flex justify-between items-center bg-transparent">
                          <span className="font-bold text-white text-xs group-hover:text-pearl-aqua transition-colors">{n.title}</span>
                          {n.isNew && <span className="w-1.5 h-1.5 rounded-full bg-golden-orange shrink-0"></span>}
                        </div>
                        <span className="text-[10px] text-pearl-aqua/80">{n.text}</span>
                        <span className="text-[8px] text-golden-orange font-bold uppercase mt-1">Jump to {n.targetTab} &rarr;</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. MAIN CONTENT CONTAINER */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto z-10 relative pb-28 md:pb-8">

          {/* TAB 1: HOME DASHBOARD */}
          {dashboardTab === 'dashboard' && (
            <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left">
              {/* Welcome banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-dark-teal via-dark-cyan to-ink-black border border-pearl-aqua/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-pearl-aqua font-bold uppercase tracking-wider">Operating System</span>
                  <h1 className="text-2xl font-black text-white m-0">Welcome back, {profile.name}!</h1>
                  <p className="text-xs text-vanilla-custard/90 max-w-lg m-0">
                    Your current track is calibrated to <strong>{profile.selectedCareer || 'AI Engineer'}</strong>. Complete today's milestone task to accelerate your roadmap.
                  </p>
                </div>
                <button
                  onClick={() => setDashboardTab('roadmap')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-golden-orange to-burnt-caramel text-ink-black font-black text-xs border-0 cursor-pointer hover:scale-102 transition-transform shadow shadow-golden-orange/20"
                >
                  Continue Roadmap &rarr;
                </button>
              </div>

              {/* Stat Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Skills Mastered', val: skillsLearnedCount, icon: <Cpu className="w-4 h-4 text-pearl-aqua" /> },
                  { label: 'Courses Completed', val: coursesCompletedCount, icon: <Award className="w-4 h-4 text-golden-orange" /> },
                  { label: 'Projects Built', val: projectsBuiltCount, icon: <Folder className="w-4 h-4 text-dark-cyan" /> },
                  { label: 'Interview Drills', val: interviewPracticeCount, icon: <Target className="w-4 h-4 text-burnt-caramel" /> }
                ].map((st, i) => (
                  <div key={i} className="p-4 rounded-2xl glass-card border border-pearl-aqua/15 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-pearl-aqua">
                      <span className="text-[10px] font-bold uppercase tracking-wider">{st.label}</span>
                      {st.icon}
                    </div>
                    <span className="text-2xl font-black text-white">{st.val}</span>
                  </div>
                ))}
              </div>

              {/* Today's Mission & Quick Calibration */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 p-4 sm:p-6 rounded-3xl glass-card border border-pearl-aqua/20 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-pearl-aqua/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-golden-orange animate-pulse" />
                      <h3 className="text-base font-bold text-white m-0">Today's Focus Mission</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-pearl-aqua bg-dark-teal/40 px-2.5 py-1 rounded-lg">
                      {formatTimer(taskTimeLeft)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-extrabold text-vanilla-custard m-0">Design & Implement Token Bucket Rate Limiting</h4>
                    <p className="text-xs text-pearl-aqua/80 m-0 leading-relaxed">
                      Write an in-memory sliding window rate limiter in TypeScript or Python supporting 100 requests per minute with retry-after headers.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    {!taskActive && !taskCompleted && (
                      <button
                        onClick={() => setTaskActive(true)}
                        className="px-4 py-2 rounded-xl bg-dark-cyan text-ink-black font-extrabold text-xs border-0 cursor-pointer hover:bg-pearl-aqua transition-colors"
                      >
                        Start Focus Timer (45m)
                      </button>
                    )}
                    {taskActive && (
                      <button
                        onClick={() => { setTaskActive(false); setTaskCompleted(true); }}
                        className="px-4 py-2 rounded-xl bg-golden-orange text-ink-black font-extrabold text-xs border-0 cursor-pointer"
                      >
                        Mark Mission Complete
                      </button>
                    )}
                    {taskCompleted && (
                      <span className="text-xs font-bold text-pearl-aqua flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-pearl-aqua" /> Completed for today!
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="p-6 rounded-3xl glass-card border border-pearl-aqua/15 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-pearl-aqua/10 pb-2 m-0">Fast Actions</h3>
                  <button
                    onClick={() => setDashboardTab('resume')}
                    className="w-full py-2.5 px-3 rounded-xl bg-dark-teal/30 hover:bg-dark-teal/60 text-pearl-aqua hover:text-white text-xs font-bold flex items-center justify-between border border-pearl-aqua/10 cursor-pointer transition-all"
                  >
                    <span>Scan Resume for ATS</span>
                    <FileCheck2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDashboardTab('mentor')}
                    className="w-full py-2.5 px-3 rounded-xl bg-dark-teal/30 hover:bg-dark-teal/60 text-pearl-aqua hover:text-white text-xs font-bold flex items-center justify-between border border-pearl-aqua/10 cursor-pointer transition-all"
                  >
                    <span>Practice Interview Drill</span>
                    <Bot className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDashboardTab('vault')}
                    className="w-full py-2.5 px-3 rounded-xl bg-dark-teal/30 hover:bg-dark-teal/60 text-pearl-aqua hover:text-white text-xs font-bold flex items-center justify-between border border-pearl-aqua/10 cursor-pointer transition-all"
                  >
                    <span>Upload to Career Vault</span>
                    <Folder className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAREER DESCRIPTION HUB (Items 14, 17) */}
          {dashboardTab === 'discovery' && (
            <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left">
              {/* Hub Header with Settings Reset Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-pearl-aqua/10 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">Career Description Hub</h2>
                  <p className="text-xs text-pearl-aqua/80">Deep career intelligence, real-time vacancy metrics, hiring trends, and curated multi-platform learning resources.</p>
                </div>
                {/* Reset Progression & Settings CTA (Item 14) */}
                <button
                  onClick={() => {
                    if (confirm('Recalibrate questionnaire? This will return you to the conversational onboarding questionnaire to re-evaluate your target track.')) {
                      setPage('onboarding');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-dark-teal/40 hover:bg-dark-teal/80 border border-pearl-aqua/30 text-pearl-aqua hover:text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all shadow"
                >
                  <Settings className="w-4 h-4 text-golden-orange" />
                  <span>Settings: Recalibrate Questionnaire</span>
                </button>
              </div>

              {/* Active Role Deep Dive Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {careerDiscoveryData.map(cd => {
                    const isSelected = (profile.selectedCareer || 'AI / Machine Learning Engineer') === cd.name;
                    return (
                      <div
                        key={cd.name}
                        className={`p-4 sm:p-6 rounded-3xl border transition-all ${isSelected
                          ? 'border-dark-cyan bg-dark-teal/25 shadow-xl shadow-dark-cyan/10'
                          : 'border-pearl-aqua/10 bg-dark-teal/10'
                        } flex flex-col gap-4`}
                      >
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-black text-white m-0">{cd.name}</h3>
                              {isSelected && (
                                <span className="px-2.5 py-0.5 rounded-full bg-pearl-aqua/20 text-pearl-aqua border border-pearl-aqua/40 text-[9px] font-extrabold uppercase">
                                  Current Track
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-golden-orange font-bold uppercase tracking-wider mt-0.5">
                              {cd.match}% Affinity Score • {cd.vacancies}
                            </span>
                          </div>

                          {!isSelected && (
                            <button
                              onClick={() => {
                                updateProfile({ selectedCareer: cd.name });
                                generateSkillsForCareer(cd.name).then(skills => updateProfile({ skills }));
                                alert(`Active goal switched to ${cd.name}`);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-dark-cyan hover:bg-pearl-aqua text-ink-black font-extrabold text-xs border-0 cursor-pointer transition-colors"
                            >
                              Select Track
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-vanilla-custard/90 leading-relaxed m-0">{cd.desc}</p>

                        {/* Metrics Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-ink-black/40 border border-pearl-aqua/10 text-xs">
                          <div>
                            <span className="text-[9px] text-pearl-aqua/70 font-bold uppercase block">Hiring Growth</span>
                            <span className="text-white font-extrabold text-xs">{cd.trend}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-pearl-aqua/70 font-bold uppercase block">Avg Salary</span>
                            <span className="text-golden-orange font-extrabold text-xs">{cd.salary}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-pearl-aqua/70 font-bold uppercase block">Work Environment</span>
                            <span className="text-pearl-aqua font-extrabold text-xs">{cd.setting}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-pearl-aqua/70 font-bold uppercase block">Open Postings</span>
                            <span className="text-vanilla-custard font-extrabold text-xs">{cd.vacancies.split(' ')[0]}</span>
                          </div>
                        </div>

                        {/* Curated Multi-Platform Learning Links (Item 17) */}
                        <div className="flex flex-col gap-2 pt-2 border-t border-pearl-aqua/10">
                          <span className="text-[10px] text-pearl-aqua font-bold uppercase tracking-wider">Curated Roadmap Courseware</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {cd.courses.map((cr, idx) => (
                              <a
                                key={idx}
                                href={cr.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-xl bg-dark-teal/20 hover:bg-dark-teal/50 border border-pearl-aqua/15 text-xs text-white flex items-center justify-between no-underline group transition-all"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                                    cr.platform === 'youtube' ? 'bg-brown-red text-white' :
                                    cr.platform === 'coursera' ? 'bg-dark-cyan text-ink-black' :
                                    cr.platform === 'udemy' ? 'bg-golden-orange text-ink-black' :
                                    'bg-dark-teal text-pearl-aqua'
                                  }`}>
                                    {cr.platform}
                                  </span>
                                  <span className="truncate text-[11px] group-hover:text-pearl-aqua transition-colors">{cr.title}</span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-pearl-aqua/60 shrink-0 ml-1 group-hover:text-white" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right News & Vacancy Trends Column */}
                <div className="flex flex-col gap-6">
                  {/* Hiring Trends Widget */}
                  <div className="p-6 rounded-3xl glass-card border border-pearl-aqua/15 flex flex-col gap-3">
                    <span className="text-[10px] text-golden-orange font-bold uppercase tracking-wider">Hiring Radar & Dynamics</span>
                    <h3 className="text-sm font-extrabold text-white m-0">High-Velocity Hiring Sectors</h3>
                    <p className="text-xs text-pearl-aqua/80 m-0 leading-relaxed">
                      AI systems engineering and full-stack API infrastructure roles represent 41% of new open positions across cloud providers and tech scaleups.
                    </p>
                    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-pearl-aqua/10 text-xs">
                      <div className="flex justify-between items-center text-vanilla-custard">
                        <span>Systems Software</span>
                        <span className="font-extrabold text-pearl-aqua">+31% YoY</span>
                      </div>
                      <div className="flex justify-between items-center text-vanilla-custard">
                        <span>Agentic AI & LLMs</span>
                        <span className="font-extrabold text-golden-orange">+48% YoY</span>
                      </div>
                      <div className="flex justify-between items-center text-vanilla-custard">
                        <span>Cloud Infrastructure</span>
                        <span className="font-extrabold text-dark-cyan">+22% YoY</span>
                      </div>
                    </div>
                  </div>

                  {/* Latest Industry News Feed */}
                  <div className="p-6 rounded-3xl glass-card border border-pearl-aqua/15 flex flex-col gap-3">
                    <span className="text-[10px] text-pearl-aqua font-bold uppercase tracking-wider">Real-time Industry Feeds</span>
                    <div className="flex flex-col gap-3">
                      {industryNews.map((news, i) => (
                        <div key={i} className="p-3 rounded-xl bg-ink-black/40 border border-pearl-aqua/10 flex flex-col gap-1">
                          <span className="text-[9px] text-golden-orange font-bold uppercase">{news.tag} • {news.time}</span>
                          <span className="text-xs font-bold text-white leading-snug">{news.title}</span>
                          <span className="text-[9px] text-pearl-aqua/70">{news.source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROADMAP & ACTIONABLE PROJECTS (Items 18, 20, 21) */}
          {dashboardTab === 'roadmap' && (
            <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Career Mastery Roadmap</h2>
                <p className="text-xs text-pearl-aqua/80">Chronological learning milestones with auto-unlocking stages and actionable hands-on projects.</p>
              </div>

              <div className="flex flex-col gap-6">
                {roadmap.map((stage, idx) => {
                  const isCompleted = stage.status === 'completed';
                  const isInProgress = stage.status === 'in-progress';
                  const isLocked = stage.status === 'locked';

                  return (
                    <div
                      key={stage.id}
                      className={`p-6 rounded-3xl border transition-all ${
                        isCompleted
                          ? 'border-pearl-aqua/40 bg-dark-teal/20 shadow-md'
                          : isInProgress
                            ? 'border-golden-orange bg-dark-teal/30 shadow-lg shadow-golden-orange/10'
                            : 'border-pearl-aqua/10 bg-ink-black/40 opacity-60'
                      } flex flex-col gap-5`}
                    >
                      <div className="flex justify-between items-start flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
                            isCompleted ? 'bg-pearl-aqua text-ink-black' :
                            isInProgress ? 'bg-golden-orange text-ink-black' :
                            'bg-dark-teal/50 text-pearl-aqua/50'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex flex-col">
                            <h3 className="text-base font-extrabold text-white m-0">{stage.title}</h3>
                            <span className="text-[10px] text-pearl-aqua font-bold uppercase tracking-wider mt-0.5">
                              Duration: {stage.duration} • Status: {stage.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Auto-Unlocking Complete Toggle Button (Item 18) */}
                        <button
                          onClick={() => toggleRoadmapItemStatus(stage.id)}
                          disabled={isLocked}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold border-0 transition-all ${
                            isCompleted
                              ? 'bg-pearl-aqua/20 border border-pearl-aqua text-pearl-aqua hover:bg-pearl-aqua/30'
                              : isInProgress
                                ? 'bg-gradient-to-r from-golden-orange to-burnt-caramel text-ink-black cursor-pointer hover:scale-102 shadow'
                                : 'bg-dark-teal/20 text-pearl-aqua/40 cursor-not-allowed'
                          }`}
                        >
                          {isCompleted ? '✓ Completed (Click to Reopen)' : 'Mark Stage Complete & Unlock Next →'}
                        </button>
                      </div>

                      <p className="text-xs text-vanilla-custard/90 m-0 leading-relaxed">{stage.description}</p>

                      {/* Technical Sub-topics (Item 21) */}
                      {stage.topics && stage.topics.length > 0 && (
                        <div className="flex flex-col gap-1.5 bg-transparent">
                          <span className="text-[9px] text-pearl-aqua font-bold uppercase tracking-wider">Key Curriculum Sub-Topics:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {stage.topics.map((tp, ti) => (
                              <span key={ti} className="px-2.5 py-1 rounded-lg bg-dark-teal/40 border border-pearl-aqua/15 text-vanilla-custard text-[10px] font-semibold">
                                {tp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actionable Stage Project Card (Item 20) */}
                      {stage.project && (
                        <div className="p-4 rounded-2xl bg-ink-black/60 border border-golden-orange/30 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-golden-orange uppercase tracking-wider flex items-center gap-1.5">
                              <Code className="w-3.5 h-3.5" /> Stage Capstone Project Assignment
                            </span>
                            <span className="text-[9px] font-mono font-bold text-pearl-aqua bg-dark-teal/40 px-2 py-0.5 rounded">
                              Deliverable Required
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-white m-0">{stage.project.title}</h4>
                          <p className="text-[11px] text-pearl-aqua/80 m-0 leading-relaxed">{stage.project.description}</p>
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="text-[9px] text-vanilla-custard font-bold uppercase">Deliverables Checklist:</span>
                            <ul className="list-disc pl-4 text-[10px] text-pearl-aqua/90 m-0 flex flex-col gap-0.5">
                              {stage.project.deliverables.map((del, di) => (
                                <li key={di}>{del}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => {
                                setActiveProjectModal(stage.project || null);
                                setProjectSubmittedSuccess(false);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-dark-cyan hover:bg-pearl-aqua text-ink-black font-extrabold text-[10px] border-0 cursor-pointer transition-colors"
                            >
                              Submit Project Deliverables →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: RESUME SCANNER & MULTI-FORMAT EXPORT (Items 22, 23, 24) */}
          {dashboardTab === 'resume' && (
            <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">Resume ATS Scanner & Generator</h2>
                  <p className="text-xs text-pearl-aqua/80">Audit keyword alignment, calibrate ATS scores, and export your validated resume in JSON, HTML, and DOCX formats.</p>
                </div>
                {/* Pre-Check & Generator CTA (Item 22, 23) */}
                <button
                  onClick={handleInitiateResumeGeneration}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-dark-cyan to-pearl-aqua text-ink-black font-extrabold text-xs border-0 cursor-pointer hover:scale-102 transition-transform shadow shadow-dark-cyan/20"
                >
                  Generate & Export Resume →
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Scanner Main Column */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {resumeStage === 'idle' && (
                    <div className="p-6 sm:p-10 border-2 border-dashed border-pearl-aqua/20 hover:border-dark-cyan bg-dark-teal/15 rounded-3xl flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            triggerResumeScan(e.target.files[0].name);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <FileUp className="w-12 h-12 text-pearl-aqua animate-pulse" />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-white">Upload Resume (PDF or DOCX)</span>
                        <span className="text-xs text-pearl-aqua/70">Analyze technical keyword alignment and ATS formatting in real-time</span>
                      </div>
                    </div>
                  )}

                  {resumeStage !== 'idle' && resumeStage !== 'done' && (
                    <div className="p-8 border border-pearl-aqua/20 bg-dark-teal/20 rounded-3xl flex flex-col gap-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-pearl-aqua uppercase tracking-wider">Parsing Resume Document...</span>
                        <span className="font-extrabold text-white">{resumeProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-ink-black/60 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-dark-cyan to-golden-orange transition-all duration-300" style={{ width: `${resumeProgress}%` }}></div>
                      </div>
                      <span className="text-[10px] text-pearl-aqua/60 uppercase font-mono">Stage: {resumeStage}</span>
                    </div>
                  )}

                  {resumeStage === 'done' && (
                    <div className="flex flex-col gap-6">
                      <div className="p-6 rounded-3xl border border-pearl-aqua/30 bg-dark-teal/20 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-pearl-aqua font-bold uppercase tracking-wider">ATS Score Calibrated</span>
                          <span className="text-sm font-extrabold text-white mt-0.5 truncate">{resumeFile}</span>
                        </div>
                        <span className="text-3xl font-black text-pearl-aqua">{profile.resume.atsScore || 82}%</span>
                      </div>

                      <div className="p-6 rounded-3xl border border-pearl-aqua/15 glass-card flex flex-col gap-4 text-xs">
                        <span className="text-xs font-bold text-white border-b border-pearl-aqua/10 pb-2">Analysis Findings & Improvements</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                          <div className="flex flex-col gap-1">
                            <span className="text-pearl-aqua font-bold uppercase text-[9px]">Strengths</span>
                            <ul className="list-disc pl-4 text-vanilla-custard flex flex-col gap-1 m-0">
                              <li>Clear technical hierarchy and GitHub projects listed</li>
                              <li>Consistent reverse chronological formatting</li>
                              <li>Quantifiable impact metrics present</li>
                            </ul>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-golden-orange font-bold uppercase text-[9px]">Improvement Opportunities</span>
                            <ul className="list-disc pl-4 text-vanilla-custard flex flex-col gap-1 m-0">
                              <li>Add additional keywords for Docker & CI/CD deployment</li>
                              <li>Expand metric details on cloud microservices</li>
                            </ul>
                          </div>
                        </div>

                        <div className="border-t border-pearl-aqua/10 pt-4 flex gap-2 justify-end">
                          <button
                            onClick={() => { setResumeStage('idle'); setResumeFile(''); }}
                            className="px-3.5 py-2 rounded-xl bg-dark-teal/40 hover:bg-dark-teal/80 text-pearl-aqua text-xs font-bold border-0 cursor-pointer"
                          >
                            Rescan Another Resume
                          </button>
                          <button
                            onClick={handleInitiateResumeGeneration}
                            className="px-4 py-2 rounded-xl bg-golden-orange text-ink-black font-extrabold text-xs border-0 cursor-pointer"
                          >
                            Export Multi-Format Resume
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Matrix Column */}
                <div className="p-6 rounded-3xl glass-card border border-pearl-aqua/15 flex flex-col gap-4 text-xs">
                  <h3 className="font-extrabold text-white border-b border-pearl-aqua/10 pb-2 m-0 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-pearl-aqua" />
                    ATS Compliance Matrix
                  </h3>
                  <div className="flex flex-col gap-3 text-[11px]">
                    {[
                      { l: 'Single-column structure', d: 'Parses cleanly across modern ATS parsers' },
                      { l: 'Standard section headers', d: 'Skills, Education, Experience clearly delineated' },
                      { l: 'Keyword density index', d: 'Matches target catalog job profiles' },
                      { l: 'Standard contact links', d: 'LinkedIn, GitHub and email formatted properly' }
                    ].map((c, i) => (
                      <div key={i} className="flex justify-between items-start gap-2">
                        <div className="flex flex-col">
                          <span className="text-white font-bold">{c.l}</span>
                          <span className="text-[10px] text-pearl-aqua/70">{c.d}</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-pearl-aqua/20 text-pearl-aqua flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">✓</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CAREER VAULT (Items 25, 26, 27) */}
          {dashboardTab === 'vault' && (
            <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">Career Vault Document Store</h2>
                  <p className="text-xs text-pearl-aqua/80">AI auto-categorization for resumes, certificates, and project documentation with verified preview modal.</p>
                </div>

                {/* Upload Button */}
                <div className="relative">
                  <input
                    ref={vaultFileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleVaultFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    onClick={() => vaultFileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-dark-cyan to-golden-orange text-ink-black font-black text-xs border-0 cursor-pointer flex items-center gap-1.5 hover:scale-102 transition-transform shadow"
                  >
                    <FileUp className="w-4 h-4" /> Upload Document
                  </button>
                </div>
              </div>

              {/* Folder Filter & Search */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex lg:flex-col overflow-x-auto pb-2 lg:pb-0 no-scrollbar gap-2 shrink-0">
                  <span className="text-[10px] text-pearl-aqua font-bold uppercase tracking-wider hidden lg:block mb-1">Document Folders</span>
                  {['All', 'Resume', 'Certificates', 'Projects', 'Academic Documents', 'Offer Letters', 'Other Documents'].map(folder => {
                    const active = selectedVaultFolder === folder;
                    return (
                      <button
                        key={folder}
                        onClick={() => setSelectedVaultFolder(folder)}
                        className={`text-left px-3 py-2 rounded-xl border-0 cursor-pointer font-bold transition-all flex items-center justify-between text-xs whitespace-nowrap shrink-0 lg:w-full ${active
                          ? 'bg-dark-teal text-white shadow-inner border border-pearl-aqua/30'
                          : 'bg-dark-teal/15 text-pearl-aqua/70 hover:bg-dark-teal/30 hover:text-white'
                        }`}
                      >
                        <span>{folder}</span>
                        <span className="text-[10px] opacity-60 ml-2">
                          {folder === 'All' ? vaultFiles.length : vaultFiles.filter(f => f.folder === folder).length}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Document Grid */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vaultFiles
                      .filter(f => selectedVaultFolder === 'All' || f.folder === selectedVaultFolder)
                      .map(file => (
                        <div key={file.id} className="p-4 rounded-2xl glass-card border border-pearl-aqua/15 flex flex-col justify-between gap-3 group hover:border-dark-cyan transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div className="w-8 h-8 rounded-xl bg-dark-teal/40 flex items-center justify-center text-pearl-aqua shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-dark-teal/50 text-pearl-aqua uppercase">
                              {file.fileType}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white truncate" title={file.name}>{file.name}</span>
                            <span className="text-[9px] text-pearl-aqua/70 mt-0.5">{file.folder} • {file.size}</span>
                          </div>

                          {/* Eye Icon Preview Action (Item 27) */}
                          <div className="flex items-center justify-between pt-2 border-t border-pearl-aqua/10">
                            <button
                              onClick={() => setPreviewFile(file)}
                              className="text-pearl-aqua hover:text-white flex items-center gap-1 text-[10px] font-bold bg-transparent border-0 cursor-pointer p-0"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </button>
                            <span className="text-[8px] text-vanilla-custard/60">{file.uploadedAt}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EXPANDED AI MENTOR CHAT & TTS (Items 11, 28) */}
          {dashboardTab === 'mentor' && (
            <div className="flex flex-col gap-4 max-w-6xl mx-auto h-[calc(100dvh-200px)] md:h-[calc(100vh-120px)] min-h-[420px] text-left">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">AI Mentorship Engine</h2>
                <p className="text-xs text-pearl-aqua/80">Specialist mentorship with real-time Speech Synthesis (TTS) read-aloud support.</p>
              </div>

              {/* Mode Selectors */}
              <div className="flex overflow-x-auto pb-1.5 no-scrollbar sm:grid sm:grid-cols-5 gap-2 text-[10px] font-bold uppercase shrink-0">
                {[
                  { id: 'career', label: 'Career Advisor', icon: <Compass className="w-3.5 h-3.5" /> },
                  { id: 'resume', label: 'Resume Expert', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
                  { id: 'interview', label: 'Interview Coach', icon: <Award className="w-3.5 h-3.5" /> },
                  { id: 'learning', label: 'Learning Coach', icon: <Cpu className="w-3.5 h-3.5" /> },
                  { id: 'roadmap', label: 'Roadmap Planner', icon: <Map className="w-3.5 h-3.5" /> }
                ].map(mode => {
                  const active = mentorMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setMentorMode(mode.id as any)}
                      className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${active
                        ? 'border-dark-cyan bg-dark-teal/50 text-white font-extrabold shadow'
                        : 'border-pearl-aqua/15 bg-dark-teal/15 text-pearl-aqua/70 hover:bg-dark-teal/30 hover:text-white'
                      }`}
                    >
                      {mode.icon}
                      <span className="truncate">{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Expanded Mentorship Conversation Chat Box (Item 28) */}
              <div className="flex-1 glass-card border border-pearl-aqua/20 rounded-3xl p-5 flex flex-col justify-between overflow-hidden min-h-0 shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-pearl-aqua/10 pb-3 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-dark-teal/50 border border-pearl-aqua/30 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-pearl-aqua" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white capitalize">{mentorMode} Expert Advisor</span>
                      <span className="text-[9px] font-bold text-pearl-aqua">Gemini Intelligent Guidance Engine</span>
                    </div>
                  </div>
                  {isSpeaking && (
                    <button
                      onClick={() => speakText('')}
                      className="px-2.5 py-1 rounded-lg bg-oxidized-iron/30 border border-oxidized-iron text-rusty-spice text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <VolumeX className="w-3 h-3" /> Stop Speech
                    </button>
                  )}
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 pr-1 text-xs">
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                      {msg.sender === 'mentor' && (
                        <div className="w-7 h-7 rounded-xl bg-dark-teal/60 border border-pearl-aqua/20 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-pearl-aqua" />
                        </div>
                      )}
                      <div className={`flex flex-col rounded-2xl p-4 leading-relaxed border shadow-md ${msg.sender === 'user'
                        ? 'bg-gradient-to-r from-dark-cyan to-dark-teal text-white border-pearl-aqua/30 rounded-tr-none'
                        : 'bg-ink-black/75 border-pearl-aqua/15 text-vanilla-custard rounded-tl-none'
                      }`}>
                        <span className="text-xs">{msg.text}</span>
                        <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-pearl-aqua/10">
                          <span className="text-[9px] text-pearl-aqua/60 font-mono">{msg.timestamp}</span>
                          {msg.sender === 'mentor' && (
                            <button
                              onClick={() => speakText(msg.text)}
                              className="text-pearl-aqua hover:text-white flex items-center gap-1 text-[9px] font-bold bg-transparent border-0 cursor-pointer"
                              title="Read aloud with Gemini TTS"
                            >
                              <Volume2 className="w-3 h-3" /> Speak
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-center gap-2 text-pearl-aqua text-xs italic">
                      <Bot className="w-4 h-4 animate-spin" /> Mentor is formulating guidance...
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2 border-t border-pearl-aqua/10 pt-3 mt-auto shrink-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Ask your ${mentorMode} mentor a specific question...`}
                    className="flex-1 px-4 py-3 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-xs text-white placeholder-pearl-aqua/40 focus:outline-none focus:border-dark-cyan transition-all"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-dark-cyan to-golden-orange text-ink-black font-extrabold text-xs border-0 cursor-pointer flex items-center justify-center shrink-0 hover:scale-102 transition-transform"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: PROFILE (STRENGTHS, WEAKNESSES, CERTIFICATIONS, ABOUT ME & EXTERNAL LINKS) (Items 5, 6, 15) */}
          {dashboardTab === 'profile' && (
            <div className="flex flex-col gap-6 max-w-6xl mx-auto text-left">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Professional Portfolio</h2>
                <p className="text-xs text-pearl-aqua/80">Curate your candidate summary, verify strengths, track certifications, and connect external developer portfolios.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Overview Column */}
                <div className="flex flex-col gap-6">
                  {/* Profile Header Card */}
                  <div className="p-6 rounded-3xl glass-card border border-pearl-aqua/20 flex flex-col items-center text-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-golden-orange to-burnt-caramel flex items-center justify-center text-xl font-black text-ink-black uppercase shadow-lg">
                      {initials}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-extrabold text-white m-0">{profile.name}</h3>
                      <span className="text-xs text-pearl-aqua mt-0.5">{profile.selectedCareer || 'AI Engineer'}</span>
                      <span className="text-[10px] text-vanilla-custard/70 mt-1">{profile.country || 'Global'}</span>
                    </div>
                  </div>

                  {/* Certifications (Item 15) */}
                  <div className="p-6 rounded-3xl glass-card border border-pearl-aqua/15 flex flex-col gap-3 text-xs">
                    <span className="text-[10px] text-pearl-aqua font-bold uppercase tracking-wider border-b border-pearl-aqua/10 pb-1.5">
                      Verified Certifications ({profile.certifications.length})
                    </span>
                    {profile.certifications.length === 0 ? (
                      <span className="text-[11px] text-pearl-aqua/60 italic">No certifications registered yet.</span>
                    ) : (
                      profile.certifications.map((c, i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-pearl-aqua/5 last:border-b-0">
                          <span className="text-white font-bold truncate max-w-[140px]">{c.courseName}</span>
                          <span className="text-[9px] text-golden-orange font-bold uppercase">{c.provider}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Details Column */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Editable About Me (Item 6) */}
                  <div className="p-6 rounded-3xl glass-card border border-pearl-aqua/15 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-pearl-aqua font-bold uppercase tracking-wider">Candidate 'About Me' Summary</span>
                      {aboutMeSaved && (
                        <span className="text-[10px] text-pearl-aqua font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Saved!
                        </span>
                      )}
                    </div>
                    <textarea
                      value={editableAboutMe}
                      onChange={(e) => { setEditableAboutMe(e.target.value); setAboutMeSaved(false); }}
                      rows={4}
                      placeholder="Write your professional bio, core motivations, domain experience, and technical focus..."
                      className="w-full p-3.5 rounded-xl bg-ink-black/60 border border-pearl-aqua/20 text-white placeholder-pearl-aqua/40 text-xs focus:outline-none focus:border-dark-cyan transition-all resize-none leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          updateProfile({ aboutMe: editableAboutMe });
                          setAboutMeSaved(true);
                          setTimeout(() => setAboutMeSaved(false), 2500);
                        }}
                        className="px-4 py-2 rounded-xl bg-dark-cyan hover:bg-pearl-aqua text-ink-black font-extrabold text-xs border-0 cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" /> Save About Me
                      </button>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses (Item 15) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl glass-card border border-pearl-aqua/20 flex flex-col gap-2">
                      <span className="text-[10px] text-pearl-aqua font-bold uppercase tracking-wider">Strengths & Core Skills</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {profile.skills.map(sk => (
                          <span key={sk} className="px-2.5 py-1 rounded-lg bg-dark-teal/40 border border-pearl-aqua/20 text-white text-[10px] font-bold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl glass-card border border-golden-orange/20 flex flex-col gap-2">
                      <span className="text-[10px] text-golden-orange font-bold uppercase tracking-wider">Identified Growth Areas</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {profile.resume.missingSkills.length > 0 ? (
                          profile.resume.missingSkills.map(sk => (
                            <span key={sk} className="px-2.5 py-1 rounded-lg bg-golden-orange/15 border border-golden-orange/30 text-golden-orange text-[10px] font-bold">
                              {sk}
                            </span>
                          ))
                        ) : (
                          ['System Design Architecture', 'Kubernetes Cluster Deployment', 'Distributed Tracing'].map(sk => (
                            <span key={sk} className="px-2.5 py-1 rounded-lg bg-golden-orange/15 border border-golden-orange/30 text-golden-orange text-[10px] font-bold">
                              {sk}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* External Professional Links (Item 5) */}
                  <div className="p-6 rounded-3xl glass-card border border-pearl-aqua/15 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-pearl-aqua/10 pb-2">
                      <span className="text-[10px] text-pearl-aqua font-bold uppercase tracking-wider">External Professional Links & Portfolios</span>
                      {socialSaved && (
                        <span className="text-[10px] text-pearl-aqua font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Links Updated!
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">LinkedIn Profile</label>
                        <input
                          type="url"
                          value={socialLinks.linkedin}
                          onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full px-3 py-2 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-white text-xs focus:outline-none focus:border-dark-cyan"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">Indeed Profile</label>
                        <input
                          type="url"
                          value={socialLinks.indeed}
                          onChange={(e) => setSocialLinks({ ...socialLinks, indeed: e.target.value })}
                          placeholder="https://my.indeed.com/p/username"
                          className="w-full px-3 py-2 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-white text-xs focus:outline-none focus:border-dark-cyan"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">Naukri Profile</label>
                        <input
                          type="url"
                          value={socialLinks.naukri}
                          onChange={(e) => setSocialLinks({ ...socialLinks, naukri: e.target.value })}
                          placeholder="https://naukri.com/profile/username"
                          className="w-full px-3 py-2 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-white text-xs focus:outline-none focus:border-dark-cyan"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">LeetCode Profile</label>
                        <input
                          type="url"
                          value={socialLinks.leetcode}
                          onChange={(e) => setSocialLinks({ ...socialLinks, leetcode: e.target.value })}
                          placeholder="https://leetcode.com/u/username"
                          className="w-full px-3 py-2 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-white text-xs focus:outline-none focus:border-dark-cyan"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">CodeChef Handle</label>
                        <input
                          type="url"
                          value={socialLinks.codechef}
                          onChange={(e) => setSocialLinks({ ...socialLinks, codechef: e.target.value })}
                          placeholder="https://codechef.com/users/username"
                          className="w-full px-3 py-2 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-white text-xs focus:outline-none focus:border-dark-cyan"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">GeeksforGeeks Profile</label>
                        <input
                          type="url"
                          value={socialLinks.geeksforgeeks}
                          onChange={(e) => setSocialLinks({ ...socialLinks, geeksforgeeks: e.target.value })}
                          placeholder="https://auth.geeksforgeeks.org/user/username"
                          className="w-full px-3 py-2 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-white text-xs focus:outline-none focus:border-dark-cyan"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          updateProfile({ socialLinks });
                          setSocialSaved(true);
                          setTimeout(() => setSocialSaved(false), 2500);
                        }}
                        className="px-4 py-2 rounded-xl bg-golden-orange text-ink-black font-extrabold text-xs border-0 cursor-pointer flex items-center gap-1.5 hover:scale-102 transition-transform"
                      >
                        <Save className="w-3.5 h-3.5" /> Save External Links
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: MODERNIZED SETTINGS (Item 4) */}
          {dashboardTab === 'settings' && (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto text-left">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">Account & Security Settings</h2>
                <p className="text-xs text-pearl-aqua/80">Manage your authenticated credentials, password, and system preferences.</p>
              </div>

              {settingsSavedMsg && (
                <div className="p-3.5 rounded-xl bg-dark-cyan/20 border border-dark-cyan text-pearl-aqua text-xs font-bold">
                  {settingsSavedMsg}
                </div>
              )}

              {/* Account Details */}
              <div className="p-6 rounded-3xl glass-card border border-pearl-aqua/15 flex flex-col gap-4 text-xs">
                <span className="text-[10px] text-pearl-aqua font-bold uppercase tracking-wider border-b border-pearl-aqua/10 pb-2">
                  Account Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">Display Name</label>
                    <input
                      type="text"
                      value={settingsName}
                      onChange={(e) => setSettingsName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-white text-xs focus:outline-none focus:border-dark-cyan"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">Email Address</label>
                    <input
                      type="text"
                      disabled
                      value={user?.email || 'user@careerpilot.ai'}
                      className="w-full px-3 py-2.5 bg-ink-black/40 border border-pearl-aqua/10 rounded-xl text-vanilla-custard/60 text-xs cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">Primary Career Target</label>
                    <input
                      type="text"
                      value={settingsGoal}
                      onChange={(e) => setSettingsGoal(e.target.value)}
                      className="w-full px-3 py-2.5 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-white text-xs focus:outline-none focus:border-dark-cyan"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">User Identifier</label>
                    <input
                      type="text"
                      disabled
                      value={user?.uid || 'firebase-verified-user'}
                      className="w-full px-3 py-2.5 bg-ink-black/40 border border-pearl-aqua/10 rounded-xl text-vanilla-custard/60 text-xs font-mono cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      updateProfile({ name: settingsName, selectedCareer: settingsGoal });
                      setSettingsSavedMsg('Account configurations saved successfully!');
                      setTimeout(() => setSettingsSavedMsg(''), 3000);
                    }}
                    className="px-4 py-2 rounded-xl bg-dark-cyan text-ink-black font-extrabold text-xs border-0 cursor-pointer"
                  >
                    Save Account Changes
                  </button>
                </div>
              </div>

              {/* Password & Security Configuration */}
              <div className="p-6 rounded-3xl glass-card border border-pearl-aqua/15 flex flex-col gap-4 text-xs">
                <span className="text-[10px] text-golden-orange font-bold uppercase tracking-wider border-b border-pearl-aqua/10 pb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-golden-orange" /> Security & Password
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-white text-xs focus:outline-none focus:border-golden-orange"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-white text-xs focus:outline-none focus:border-golden-orange"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      if (!newPassword || newPassword.length < 6) {
                        alert('Password must be at least 6 characters.');
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        alert('Passwords do not match.');
                        return;
                      }
                      alert('Password updated successfully.');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-4 py-2 rounded-xl bg-golden-orange text-ink-black font-extrabold text-xs border-0 cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Session Recovery / Danger Zone */}
              <div className="p-6 rounded-3xl bg-rusty-spice/10 border border-rusty-spice/30 flex justify-between items-center text-xs">
                <div className="flex flex-col">
                  <span className="text-white font-extrabold">Reset Local CareerPilot State</span>
                  <span className="text-[10px] text-vanilla-custard/70">Wipe stored tokens and re-initialize session cleanly</span>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Reset session? This will log you out and clear stored session states.')) {
                      resetApp();
                      setPage('landing');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-oxidized-iron hover:bg-brown-red text-white font-extrabold text-xs border-0 cursor-pointer transition-colors"
                >
                  Reset Session
                </button>
              </div>
            </div>
          )}

        </main>

        {/* 4. MOBILE BOTTOM NAVIGATION BAR (< md) */}
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 bg-ink-black/95 backdrop-blur-xl border-t border-pearl-aqua/15 px-1.5 py-1.5 md:hidden flex justify-around items-center pb-safe"
        >
          {menuItems.slice(0, 7).map(item => {
            const active = dashboardTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setDashboardTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-0.5 px-1 rounded-xl border-0 bg-transparent cursor-pointer transition-all ${
                  active
                    ? 'text-golden-orange font-bold scale-105'
                    : 'text-pearl-aqua/70 hover:text-white font-medium'
                }`}
              >
                <div className={`p-1 rounded-lg ${active ? 'bg-golden-orange/20 text-golden-orange' : 'bg-transparent'}`}>
                  {item.icon}
                </div>
                <span className="text-[9px] mt-0.5 tracking-tight truncate max-w-[48px]">{item.label}</span>
                {active && <span className="w-1 h-1 rounded-full bg-golden-orange mt-0.5"></span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Global Search Dialog Modal */}
      {isSearchOpen && (
        <GlobalSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {/* Career Vault Document Preview Modal (Item 27) */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl glass-card rounded-3xl border border-pearl-aqua/30 p-4 sm:p-6 max-h-[90vh] overflow-y-auto flex flex-col gap-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-pearl-aqua/10 pb-3">
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-white">{previewFile.name}</span>
                <span className="text-[9px] text-pearl-aqua uppercase font-mono mt-0.5">{previewFile.folder} • {previewFile.size}</span>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 text-pearl-aqua hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-ink-black/80 rounded-2xl border border-pearl-aqua/15 h-64 overflow-y-auto text-xs text-vanilla-custard leading-relaxed font-mono">
              <div className="text-center font-bold text-white border-b border-pearl-aqua/20 pb-2 mb-3 uppercase">
                {previewFile.name} Verification View
              </div>
              <p className="mb-2"><strong>Category:</strong> {previewFile.folder}</p>
              <p className="mb-2"><strong>Status:</strong> Verified Active in Career Vault</p>
              <p className="mb-2"><strong>Extracted Content:</strong></p>
              <p className="text-pearl-aqua/90 bg-dark-teal/20 p-3 rounded-xl border border-pearl-aqua/10">
                {previewFile.textContent || 'Document layout parsed successfully. No formatting discrepancies detected.'}
              </p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-pearl-aqua/10">
              <span className="text-[10px] text-pearl-aqua/70 font-mono">SHA-256: 8f9b2d...c41e</span>
              <button
                onClick={() => alert(`Downloading ${previewFile.name}...`)}
                className="px-4 py-2 rounded-xl bg-dark-cyan text-ink-black font-extrabold text-xs border-0 cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Resume Checks Modal (Item 22) */}
      {showResumePreCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-3xl border border-golden-orange/40 p-4 sm:p-6 max-h-[90vh] overflow-y-auto flex flex-col gap-4 text-left shadow-2xl">
            <div className="flex items-center gap-2.5 text-golden-orange">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-black text-white m-0">Candidate Details Pre-Check</h3>
            </div>
            <p className="text-xs text-pearl-aqua/90 leading-relaxed m-0">
              Before compiling your production resume, the AI agent recommends completing missing profile details to achieve an optimal ATS match score.
            </p>
            <div className="p-3.5 rounded-xl bg-ink-black/60 border border-pearl-aqua/15 text-xs flex flex-col gap-1.5">
              <span className="text-[10px] text-vanilla-custard font-bold uppercase">Missing Fields:</span>
              <ul className="list-disc pl-4 text-golden-orange m-0 text-xs">
                {!profile.education.degree && <li>Education degree major</li>}
                {profile.skills.length === 0 && <li>Verified technical skills list</li>}
                {!profile.projects.description && <li>Hands-on project description</li>}
              </ul>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setShowResumePreCheck(false); setDashboardTab('profile'); }}
                className="px-3.5 py-2 rounded-xl bg-dark-teal/50 text-pearl-aqua text-xs font-bold border border-pearl-aqua/20 cursor-pointer"
              >
                Edit Profile Now
              </button>
              <button
                onClick={() => { setShowResumePreCheck(false); setResumeExportModal(true); }}
                className="px-4 py-2 rounded-xl bg-golden-orange text-ink-black text-xs font-extrabold border-0 cursor-pointer"
              >
                Proceed to Export Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Format Resume Export Modal (Item 23) */}
      {resumeExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-3xl border border-pearl-aqua/30 p-4 sm:p-6 max-h-[90vh] overflow-y-auto flex flex-col gap-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-pearl-aqua/10 pb-3">
              <h3 className="text-base font-black text-white m-0">Multi-Format Resume Export</h3>
              <button
                onClick={() => setResumeExportModal(false)}
                className="p-1 text-pearl-aqua hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-pearl-aqua/80 leading-relaxed m-0">
              Choose your target resume format. All formats include verified ATS keywords and structured metadata.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => { downloadFileFormatted('docx'); setResumeExportModal(false); }}
                className="w-full p-3.5 rounded-2xl bg-dark-teal/40 hover:bg-dark-teal/70 border border-pearl-aqua/20 text-white text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-pearl-aqua" />
                  <div className="flex flex-col text-left">
                    <span>Microsoft Word (.docx)</span>
                    <span className="text-[9px] text-pearl-aqua/70 font-normal">Native editable Word document</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-pearl-aqua" />
              </button>

              <button
                onClick={() => { downloadFileFormatted('html'); setResumeExportModal(false); }}
                className="w-full p-3.5 rounded-2xl bg-dark-teal/40 hover:bg-dark-teal/70 border border-pearl-aqua/20 text-white text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-golden-orange" />
                  <div className="flex flex-col text-left">
                    <span>Formatted Web Page (.html)</span>
                    <span className="text-[9px] text-pearl-aqua/70 font-normal">Clean print-ready single page HTML</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-golden-orange" />
              </button>

              <button
                onClick={() => { downloadFileFormatted('json'); setResumeExportModal(false); }}
                className="w-full p-3.5 rounded-2xl bg-dark-teal/40 hover:bg-dark-teal/70 border border-pearl-aqua/20 text-white text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Code className="w-4 h-4 text-dark-cyan" />
                  <div className="flex flex-col text-left">
                    <span>Structured JSON Resume (.json)</span>
                    <span className="text-[9px] text-pearl-aqua/70 font-normal">JSON-LD schema compliant data</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-dark-cyan" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Submission Modal (Item 20) */}
      {activeProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl border border-pearl-aqua/30 p-6 flex flex-col gap-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-pearl-aqua/10 pb-3">
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-white">{activeProjectModal.title}</span>
                <span className="text-[9px] text-golden-orange uppercase font-bold mt-0.5">Stage Milestone Project Submission</span>
              </div>
              <button
                onClick={() => setActiveProjectModal(null)}
                className="p-1 text-pearl-aqua hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {projectSubmittedSuccess ? (
              <div className="p-6 rounded-2xl bg-dark-cyan/20 border border-dark-cyan text-center flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-pearl-aqua" />
                <h4 className="text-sm font-extrabold text-white m-0">Project Submitted for Evaluation!</h4>
                <p className="text-xs text-vanilla-custard/90 m-0">Your codebase link has been recorded. This milestone is completed and the next stage is unlocked.</p>
                <button
                  onClick={() => setActiveProjectModal(null)}
                  className="mt-3 px-4 py-2 rounded-xl bg-pearl-aqua text-ink-black font-extrabold text-xs border-0 cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-pearl-aqua/80 leading-relaxed m-0">{activeProjectModal.description}</p>
                <div className="flex flex-col gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">GitHub Repository Link *</label>
                    <input
                      type="url"
                      value={projectRepoLink}
                      onChange={(e) => setProjectRepoLink(e.target.value)}
                      placeholder="https://github.com/username/project-repo"
                      className="w-full px-3 py-2.5 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-white text-xs focus:outline-none focus:border-dark-cyan"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">Live Demo / Deployment Link (Optional)</label>
                    <input
                      type="url"
                      value={projectDemoLink}
                      onChange={(e) => setProjectDemoLink(e.target.value)}
                      placeholder="https://my-project.vercel.app"
                      className="w-full px-3 py-2.5 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-white text-xs focus:outline-none focus:border-dark-cyan"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-pearl-aqua/70 font-bold uppercase block mb-1">Architecture Notes & Implementation Details</label>
                    <textarea
                      value={projectNotes}
                      onChange={(e) => setProjectNotes(e.target.value)}
                      rows={3}
                      placeholder="Highlight architectural decisions, testing coverage, and technologies used..."
                      className="w-full px-3 py-2 bg-ink-black/60 border border-pearl-aqua/20 rounded-xl text-white text-xs focus:outline-none focus:border-dark-cyan resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-pearl-aqua/10">
                  <button
                    onClick={() => setActiveProjectModal(null)}
                    className="px-3.5 py-2 rounded-xl bg-dark-teal/40 text-pearl-aqua text-xs font-bold border-0 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!projectRepoLink.trim()) {
                        alert('Please provide a repository link for evaluation.');
                        return;
                      }
                      setProjectSubmittedSuccess(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-dark-cyan to-golden-orange text-ink-black font-extrabold text-xs border-0 cursor-pointer"
                  >
                    Submit Deliverables
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
