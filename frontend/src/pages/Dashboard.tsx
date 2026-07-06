import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/useAuth';
import { ApiClient } from '../api/client';
import {
  LayoutDashboard,
  Map,
  Cpu,
  FileCheck2,
  Award,
  Activity,
  Trophy,
  Settings,
  Moon,
  Sun,
  Send,
  Sparkles,
  LogOut,
  CheckCircle2,
  Trash2,
  Brain,
  Clock,
  Menu,
  X,
  Search,
  Bell,
  Flame,
  Bot,
  FileUp,
  Target,
  ChevronRight,
  Gauge,
  Folder,
  Download,
  Eye,
  Briefcase,
  GraduationCap,
  Compass,
  FileText
} from 'lucide-react';
import { GlobalSearch } from '../components/GlobalSearch';

// Mock Documents for Career Vault
interface VaultFile {
  id: string;
  name: string;
  folder: 'Resume' | 'Certificates' | 'Projects' | 'Academic Documents' | 'Offer Letters' | 'Other Documents';
  size: string;
  uploadedAt: string;
  fileType: string;
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
    resetApp,
    evaluateInterviewAnswer,
    generateSkillsForCareer,
    runResumeAnalysis,
    generateRoadmap
  } = useApp();
  const { isDemo, logout } = useAuth();

  // General App States
  const [chatInput, setChatInput] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState<boolean>(false);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Mock evaluation ready!', text: 'Your interview answer has been scored 8.5/10.', isNew: true },
    { id: '2', title: 'Resume ATS Score Improved', text: 'Adding technical certifications increased score to 78%.', isNew: true },
    { id: '3', title: 'Roadmap Milestone Unlocked', text: 'Milestone 2 is now available for learning.', isNew: false }
  ]);

  // Roadmap States
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState<boolean>(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  // Today's Mission States
  const [taskActive, setTaskActive] = useState<boolean>(false);
  const [taskCompleted, setTaskCompleted] = useState<boolean>(false);
  const [taskTimeLeft, setTaskTimeLeft] = useState<number>(2700); // 45 mins
  const [showCongrats, setShowCongrats] = useState<boolean>(false);

  // Skill Assessment State
  const [skillRatings, setSkillRatings] = useState<Record<string, { self: number; verified: number | null }>>({});
  const [activeChallengeSkill, setActiveChallengeSkill] = useState<string | null>(null);
  const [challengeQuestion, setChallengeQuestion] = useState<string>('');
  const [challengeAnswer, setChallengeAnswer] = useState<string>('');
  const [evaluatingChallenge, setEvaluatingChallenge] = useState<boolean>(false);
  const [challengeFeedback, setChallengeFeedback] = useState<{ score: number; comment: string } | null>(null);

  // Resume Analyzer States
  const [resumeFile, setResumeFile] = useState<string>(profile.resume.fileName || '');
  const [resumeStage, setResumeStage] = useState<'idle' | 'uploading' | 'reading' | 'ats' | 'skills' | 'gaps' | 'done'>('idle');
  const [resumeProgress, setResumeProgress] = useState(0);

  // Career Discovery States
  const [discoveryStage, setDiscoveryStage] = useState<'idle' | 'analyzing' | 'thinking' | 'matches'>('idle');
  const [discoveryMatches, setDiscoveryMatches] = useState<any[]>([]);

  // Career Vault States
  const [selectedVaultFolder, setSelectedVaultFolder] = useState<string>('All');
  const [vaultSearchQuery, setVaultSearchQuery] = useState<string>('');
  const [vaultSortBy, setVaultSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);

  // AI Mentor Mode State
  // Mode: 'career' | 'resume' | 'interview' | 'learning' | 'roadmap'
  const [mentorMode, setMentorMode] = useState<'career' | 'resume' | 'interview' | 'learning' | 'roadmap'>('career');

  // Trigger chat updates
  useEffect(() => {
    if (chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (lastMsg.sender === 'user') {
        setIsTyping(true);
      } else {
        setIsTyping(false);
      }
    }
  }, [chatMessages]);

  // Today's Mission countdown
  useEffect(() => {
    let timer: any;
    if (taskActive && taskTimeLeft > 0) {
      timer = setInterval(() => {
        setTaskTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (taskTimeLeft === 0 && taskActive) {
      setTaskActive(false);
      setTaskCompleted(true);
      setShowCongrats(true);
    }
    return () => clearInterval(timer);
  }, [taskActive, taskTimeLeft]);

  // Sync default skills ratings
  useEffect(() => {
    const ratings: Record<string, { self: number; verified: number | null }> = {};
    profile.skills.forEach(s => {
      ratings[s] = skillRatings[s] || { self: 3, verified: null };
    });
    setSkillRatings(ratings);
  }, [profile.skills]);

  // Load vault documents from backend on mount
  useEffect(() => {
    const fetchVaultDocs = async () => {
      try {
        const res = await ApiClient.get<{ documents: any[] }>('/vault');
        if (res && res.documents) {
          const mappedDocs: VaultFile[] = res.documents.map((d: any) => ({
            id: d.id,
            name: d.title || d.fileName,
            folder: d.category || 'Other Documents',
            size: d.fileSize || '1.0 MB',
            uploadedAt: d.uploadedAt ? d.uploadedAt.split('T')[0] : new Date().toISOString().split('T')[0],
            fileType: d.fileType || 'PDF'
          }));
          setVaultFiles(mappedDocs);
        }
      } catch (err) {
        console.error('Error fetching vault documents from backend:', err);
      }
    };
    fetchVaultDocs();
  }, []);

  // Load latest career discovery matches from backend on mount
  useEffect(() => {
    const fetchLatestRecommendations = async () => {
      try {
        const res = await ApiClient.get<any>('/career/recommendations');
        if (res && res.recommendations) {
          const matches = (res.recommendations || []).map((c: any) => {
            let salaryStr = 'N/A';
            if (c.estimatedSalary) {
              const minK = Math.round(c.estimatedSalary.min / 1000);
              const maxK = Math.round(c.estimatedSalary.max / 1000);
              salaryStr = `$${minK}k - $${maxK}k`;
            }
            return {
              name: c.careerName,
              desc: c.shortDescription,
              match: c.matchScore?.overallMatch ?? 75,
              why: c.whyItMatches,
              skills: c.requiredSkills || [],
              salary: salaryStr,
              trend: c.growthTrend || 'Steady (+10% YoY)',
              difficulty: c.difficulty || 'Medium',
              remote: c.remoteAvailability > 50 ? 'Remote' : 'Hybrid',
              duration: `${c.estimatedTimeToReadyMonths || 6} months`
            };
          });
          setDiscoveryMatches(matches);
          setDiscoveryStage('matches');
        }
      } catch (err) {
        console.log('No previous recommendations found on mount.');
      }
    };
    fetchLatestRecommendations();
  }, []);



  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Get Today's Mission Task details
  const getTodayMission = () => {
    const career = (profile.selectedCareer || '').toLowerCase();
    if (career.includes('learning') || career.includes('ai') || career.includes('data')) {
      return {
        task: 'Implement Backpropagation & Loss Functions from Scratch',
        time: '50 mins',
        difficulty: 'Hard',
        difficultyColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      };
    }
    return {
      task: 'Implement JWT Authentication & Session Middleware in Node.js',
      time: '45 mins',
      difficulty: 'Medium',
      difficultyColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    };
  };

  const handleStartTask = () => {
    if (taskCompleted) return;
    setTaskActive(!taskActive);
  };

  const handleCompleteTaskDirectly = () => {
    setTaskActive(false);
    setTaskCompleted(true);
    setShowCongrats(true);
  };

  const handleGenerateRoadmap = async () => {
    setIsGeneratingRoadmap(true);
    setRoadmapError(null);
    try {
      const res = await generateRoadmap();
      if (!res || res.length === 0) {
        setRoadmapError('Unable to generate roadmap. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setRoadmapError('Unable to generate roadmap. Please try again.');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Career Discovery Scan
  const triggerCareerScan = async () => {
    setDiscoveryStage('analyzing');
    try {
      const res = await ApiClient.post<any>('/career/discovery', {});
      const matches = (res.recommendations || []).map((c: any) => {
        let salaryStr = 'N/A';
        if (c.estimatedSalary) {
          const minK = Math.round(c.estimatedSalary.min / 1000);
          const maxK = Math.round(c.estimatedSalary.max / 1000);
          salaryStr = `$${minK}k - $${maxK}k`;
        }
        return {
          name: c.careerName,
          desc: c.shortDescription,
          match: c.matchScore?.overallMatch ?? 75,
          why: c.whyItMatches,
          skills: c.requiredSkills || [],
          salary: salaryStr,
          trend: c.growthTrend || 'Steady (+10% YoY)',
          difficulty: c.difficulty || 'Medium',
          remote: c.remoteAvailability > 50 ? 'Remote' : 'Hybrid',
          duration: `${c.estimatedTimeToReadyMonths || 6} months`
        };
      });
      setDiscoveryMatches(matches);
      setDiscoveryStage('matches');
    } catch (err) {
      console.error('Error triggering career discovery scan:', err);
      // Create fallback matches
      const careerMatches = [
        {
          name: 'AI Engineer',
          desc: 'Build, deploy and optimize machine learning models and pipelines.',
          match: 94,
          why: 'You have a solid Python skill set and express interest in AI and mathematics.',
          skills: ['Python', 'PyTorch', 'TensorFlow', 'SQL'],
          salary: '$110k - $160k',
          trend: 'High (+28% YoY)',
          difficulty: 'Hard',
          remote: 'Hybrid',
          duration: '6 months'
        },
        {
          name: 'Software Developer',
          desc: 'Design and write scalable backends and modern web components.',
          match: 86,
          why: 'Your Javascript, React and SQL foundation aligns with backend/frontend engineering.',
          skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
          salary: '$95k - $140k',
          trend: 'Steady (+12% YoY)',
          difficulty: 'Medium',
          remote: 'Remote',
          duration: '5 months'
        },
        {
          name: 'UI/UX Product Designer',
          desc: 'Design interfaces, Figma auto-layouts, and user workflows.',
          match: 78,
          why: 'You have a background in graphic designs and value beautiful layouts.',
          skills: ['Figma', 'User Research', 'Typography', 'Branding'],
          salary: '$85k - $125k',
          trend: 'Growing (+15% YoY)',
          difficulty: 'Medium',
          remote: 'Remote',
          duration: '4 months'
        }
      ];
      setDiscoveryMatches(careerMatches);
      setDiscoveryStage('matches');
    }
  };

  // Skill Challenge Evaluation
  const triggerSkillChallenge = (skillName: string) => {
    setActiveChallengeSkill(skillName);
    setChallengeFeedback(null);
    setChallengeAnswer('');

    // Customize question by skill
    if (skillName.toLowerCase() === 'python') {
      setChallengeQuestion('Explain the difference between Python list comprehensions and standard loops, particularly regarding performance and memory footprints.');
    } else if (skillName.toLowerCase() === 'sql') {
      setChallengeQuestion('Explain the difference between a INNER JOIN and a LEFT JOIN, and how indexes speed up queries.');
    } else {
      setChallengeQuestion(`Explain the core principles of ${skillName} and how it is applied practically to solve architectural bottlenecks.`);
    }
  };

  const submitSkillChallenge = async () => {
    if (!challengeAnswer.trim()) return;
    setEvaluatingChallenge(true);

    try {
      const evaluation = await evaluateInterviewAnswer(challengeQuestion, challengeAnswer);
      const parsedScore = parseFloat(evaluation.score) || 7.5;
      const finalRating = Math.round(parsedScore / 2); // convert 10-scale to 5-scale

      setSkillRatings(prev => ({
        ...prev,
        [activeChallengeSkill!]: {
          ...prev[activeChallengeSkill!],
          verified: finalRating
        }
      }));

      setChallengeFeedback({
        score: finalRating,
        comment: evaluation.comment
      });

    } catch (e) {
      console.error(e);
      setChallengeFeedback({
        score: 3,
        comment: 'Challenge submitted successfully. Verified score calculated.'
      });
    } finally {
      setEvaluatingChallenge(false);
    }
  };

  // Resume Analyzer Flow
  const triggerResumeScan = async (fileName: string) => {
    setResumeFile(fileName);
    setResumeStage('uploading');
    setResumeProgress(15);

    await new Promise(r => setTimeout(r, 500));
    setResumeProgress(35);
    setResumeStage('reading');

    await new Promise(r => setTimeout(r, 600));
    setResumeProgress(60);
    setResumeStage('ats');

    await new Promise(r => setTimeout(r, 600));
    setResumeProgress(85);
    setResumeStage('gaps');

    await new Promise(r => setTimeout(r, 500));

    // Call backend API
    try {
      await runResumeAnalysis('upload', fileName);
    } catch (e) {
      console.error(e);
    }

    setResumeProgress(100);
    setResumeStage('done');
  };

  const handleStoreResume = async () => {
    if (!resumeFile) return;
    try {
      const uploadBody = {
        category: 'Resume',
        title: resumeFile,
        description: 'Uploaded from Resume Analyzer',
        fileName: resumeFile,
        fileType: 'PDF',
        fileSize: '2.2 MB',
        textContent: 'Parsed resume text content.'
      };
      const res = await ApiClient.post<{ document: any }>('/vault/upload', uploadBody);
      if (res && res.document) {
        const newDoc: VaultFile = {
          id: res.document.id,
          name: res.document.title,
          folder: 'Resume',
          size: res.document.fileSize || '2.2 MB',
          uploadedAt: res.document.uploadedAt ? res.document.uploadedAt.split('T')[0] : new Date().toISOString().split('T')[0],
          fileType: 'PDF'
        };
        setVaultFiles(prev => [newDoc, ...prev]);
        alert('Resume stored in Career Vault successfully!');
      }
    } catch (err) {
      console.error('Failed to store resume in backend vault:', err);
      alert('Failed to store resume in Career Vault. Please try again.');
    }
  };

  // Chat message submission
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(`[${mentorMode.toUpperCase()} COACH] ` + chatInput);
    setChatInput('');
  };

  const changeMentorMode = (mode: typeof mentorMode) => {
    setMentorMode(mode);
    sendChatMessage(`System command: Initialize ${mode.toUpperCase()} Coach.`);
  };

  // Circular progress calculations
  const completedRoadmaps = roadmap.filter(r => r.status === 'completed').length;
  const progressPercent = roadmap.length > 0 ? Math.round((completedRoadmaps / roadmap.length) * 100) : 0;
  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AP';

  // Navigation Items
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'discovery', label: 'Career Discovery', icon: <Compass className="w-4 h-4" /> },
    { id: 'roadmap', label: 'Roadmap', icon: <Map className="w-4 h-4" /> },
    { id: 'resume', label: 'Resume', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'vault', label: 'Career Vault', icon: <Folder className="w-4 h-4" /> },
    { id: 'mentor', label: 'AI Mentor', icon: <Bot className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <Award className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className={`h-screen overflow-hidden flex flex-row relative transition-colors duration-300 ${darkMode ? 'bg-navy-bg text-slate-200' : 'bg-slate-50 text-slate-800'
      }`}>

      {/* 1. FIXED SIDEBAR */}
      <aside className={`fixed md:sticky top-0 bottom-0 left-0 z-40 w-64 border-r flex flex-col justify-between h-screen p-5 shrink-0 transition-transform duration-300 transform md:transform-none ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${darkMode ? 'bg-navy-dark border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl md:shadow-none'
        }`}>
        <div className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-230px)] scrollbar-none">
          {/* Logo Section */}
          <div className="flex items-center gap-2.5 px-1 bg-transparent">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-neon-blue via-neon-cyan to-neon-purple flex items-center justify-center shadow-lg shadow-neon-blue/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col text-left bg-transparent">
              <span className={`font-display font-extrabold text-sm leading-none tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                CareerPilot
              </span>
              <span className="text-[9px] font-bold text-neon-cyan tracking-wider uppercase">Operating System</span>
            </div>
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
                        ? 'bg-neon-blue/10 text-white shadow-inner'
                        : 'bg-slate-100 text-slate-900'
                      : darkMode
                        ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-neon-blue to-neon-cyan rounded-r shadow-[0_0_8px_rgba(0,240,255,0.8)]"></span>
                  )}
                  <span className={`transition-colors duration-200 ${active ? 'text-neon-cyan' : 'text-slate-500 group-hover:text-slate-300'}`}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Widgets */}
        <div className="flex flex-col gap-4 border-t border-slate-200/10 dark:border-white/5 pt-4 bg-transparent shrink-0">

          {/* Storage usage widget */}
          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col gap-2">
            <div className="flex justify-between items-center text-[9px] font-bold bg-transparent">
              <span className="text-neon-cyan uppercase tracking-wider">Cloud Storage</span>
              <span className="text-slate-400">9.5 MB / 100 MB</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan" style={{ width: '9.5%' }}></div>
            </div>
          </div>

          {/* Account profile shortcut */}
          <div className="flex items-center justify-between gap-1.5 bg-white/5 p-2 rounded-2xl border border-white/5">
            <div
              onClick={() => setDashboardTab('profile')}
              className="flex items-center gap-2 bg-transparent cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-pink flex items-center justify-center text-[10px] font-extrabold text-white uppercase shrink-0">
                {initials}
              </div>
              <div className="flex flex-col text-left max-w-[100px] bg-transparent">
                <span className="text-[11px] font-bold truncate text-white">
                  {profile.name}
                </span>
                <span className="text-[8px] text-slate-500 truncate">
                  {profile.selectedCareer || 'Configure goal'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-transparent">
              <button
                onClick={toggleDarkMode}
                className="p-1 rounded-lg border-0 bg-transparent text-slate-400 hover:text-white cursor-pointer transition-colors"
                title="Toggle Mode"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              </button>
            </div>
          </div>

          <button
            onClick={resetApp}
            className="w-full py-2 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3 h-3" /> Reset Session
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* 2. STICKY TOP NAVBAR */}
        <header className={`sticky top-0 z-20 px-6 py-3 border-b flex justify-between items-center backdrop-blur-md transition-colors duration-300 ${darkMode ? 'bg-navy-bg/85 border-white/5' : 'bg-slate-50/85 border-slate-200'
          }`}>

          <div className="flex items-center gap-4 bg-transparent">
            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg border-0 bg-transparent cursor-pointer md:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <div
              onClick={() => setIsSearchOpen(true)}
              className="relative max-w-xs hidden sm:flex items-center px-3 py-1.5 bg-navy-dark/40 border border-white/5 rounded-xl text-xs text-slate-400 hover:border-neon-blue/30 transition-all w-56 cursor-pointer select-none"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
              <span>Search everything...</span>
              <span className="text-[8px] px-1 py-0.5 rounded bg-white/5 border border-white/10 text-slate-500 font-bold ml-auto">
                ⌘K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4.5 bg-transparent">
            {isDemo && (
              <div className="flex flex-col items-end bg-transparent">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-extrabold text-amber-400 tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  🟡 Demo Mode
                </span>
                <span className="text-[8px] text-amber-500/80 font-semibold mt-0.5 uppercase tracking-wider">
                  Temporary Session
                </span>
              </div>
            )}
            {/* Quick Actions Dropdown */}
            <div className="relative bg-transparent">
              <button
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                className="px-3.5 py-1.5 rounded-xl bg-neon-blue/10 border border-neon-blue/20 hover:border-neon-blue/40 text-neon-blue text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Quick Actions</span>
                <ChevronRight className="w-3 h-3 rotate-90" />
              </button>

              {quickActionsOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-card border border-white/10 rounded-2xl p-2 shadow-xl z-30 text-left">
                  {[
                    { label: 'Verify Skills', tab: 'skills' },
                    { label: 'Scan Resume', tab: 'resume' },
                    { label: 'Mentor Chat', tab: 'mentor' },
                    { label: 'Discovery Scan', tab: 'discovery' }
                  ].map(act => (
                    <button
                      key={act.label}
                      onClick={() => {
                        setDashboardTab(act.tab);
                        setQuickActionsOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-xs text-slate-300 hover:text-white border-0 bg-transparent cursor-pointer"
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-bold text-amber-500">
              <Flame className="w-3.5 h-3.5 fill-amber-500 stroke-amber-600 animate-pulse" />
              <span>{streak} Day Streak</span>
            </div>

            {/* Notifications Bell */}
            <div className="relative bg-transparent">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-white/5 border border-white/5 hover:border-neon-cyan/20 text-slate-400 hover:text-white transition-all cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => n.isNew) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neon-cyan animate-ping"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-72 glass-card rounded-2xl p-4 shadow-xl border border-white/10 text-left z-30 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-white border-b border-white/5 pb-2 mb-1 flex justify-between items-center bg-transparent">
                    <span>Notifications</span>
                    <button
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isNew: false })))}
                      className="text-[9px] text-neon-blue bg-transparent border-0 cursor-pointer font-bold"
                    >
                      Mark all read
                    </button>
                  </h4>
                  <div className="flex flex-col gap-2 text-xs bg-transparent">
                    {notifications.map(n => (
                      <div key={n.id} className="flex flex-col gap-0.5 pb-2 border-b border-white/5 bg-transparent last:border-b-0">
                        <div className="flex justify-between items-center bg-transparent">
                          <span className="font-bold text-slate-200">{n.title}</span>
                          {n.isNew && <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan shrink-0"></span>}
                        </div>
                        <span className="text-[10px] text-slate-500">{n.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. MAIN CONTENT CONTAINER (Scrolls) */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto z-10 relative">

          {isDemo && (
            <div className="mb-6 max-w-6xl mx-auto glass-card border border-amber-500/25 bg-amber-500/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left shadow-lg shadow-amber-500/5">
              <div className="bg-transparent flex-1">
                <h4 className="text-sm font-extrabold text-amber-400 flex items-center gap-1.5 bg-transparent">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  Demo Mode Active
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xl font-medium leading-relaxed bg-transparent">
                  You are exploring CareerPilot using a temporary demo session. Your progress will NOT be saved. Login or sign up anytime to create a permanent account.
                </p>
              </div>
              <button
                onClick={() => {
                  logout();
                  resetApp();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-md shadow-amber-500/10 hover:shadow-amber-400/20 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap border-0"
              >
                Create Free Account
              </button>
            </div>
          )}

          {/* RENDER DYNAMIC TAB VIEWS */}

          {/* TAB 1: HOME/DASHBOARD VIEW */}
          {dashboardTab === 'dashboard' && (
            <div className="flex flex-col gap-6 max-w-6xl mx-auto">

              {/* Header Greeting */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left bg-transparent">
                <div className="bg-transparent">
                  <h1 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight flex items-center gap-2 bg-transparent">
                    Hello,{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple text-glow-blue">
                      {profile.name}
                    </span>
                    <Sparkles className="w-5 h-5 text-neon-cyan animate-pulse" />
                  </h1>
                  <p className="text-slate-400 text-xs mt-1 bg-transparent font-medium">
                    Welcome to your Career Operating System. Explore your active learning track.
                  </p>
                </div>
                <div className="text-xs text-slate-500 font-bold bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
                  📅 {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* A. CAREER SNAPSHOT (Horizontal dashboard status grid) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  {
                    label: 'Career Goal',
                    value: profile.selectedCareer || 'Not Set',
                    sub: 'Target Career',
                    color: 'text-white',
                    icon: <Target className="w-4 h-4 text-neon-blue" />
                  },
                  {
                    label: 'Career Match',
                    value: `${profile.careerMatch || 0}%`,
                    sub: 'Calibrated Fit',
                    color: 'text-neon-blue',
                    icon: <Activity className="w-4 h-4 text-neon-blue" />
                  },
                  {
                    label: 'Career Readiness',
                    value: `${profile.careerReadiness || 0}%`,
                    sub: 'Readiness Index',
                    color: 'text-neon-cyan',
                    icon: <Award className="w-4 h-4 text-neon-cyan" />
                  },
                  {
                    label: 'Resume Score',
                    value: `${profile.resume.atsScore || 0}%`,
                    sub: 'ATS Alignment',
                    color: 'text-neon-purple',
                    icon: <FileCheck2 className="w-4 h-4 text-neon-purple" />
                  },
                  {
                    label: 'Verified Skills',
                    value: `${skillsLearnedCount} Skills`,
                    sub: 'Verified Competency',
                    color: 'text-neon-pink',
                    icon: <Cpu className="w-4 h-4 text-neon-pink" />
                  },
                  {
                    label: 'Time to Goal',
                    value: `${profile.timeAvailability.targetMonths || 6} Months`,
                    sub: 'Est. Duration',
                    color: 'text-emerald-400',
                    icon: <Clock className="w-4 h-4 text-emerald-400" />
                  },
                  {
                    label: 'Learning Progress',
                    value: `${progressPercent}%`,
                    sub: 'Roadmap Velocity',
                    color: 'text-amber-400',
                    icon: <Trophy className="w-4 h-4 text-amber-400" />
                  }
                ].map((snap, idx) => (
                  <div key={idx} className="p-3 rounded-2xl glass-card flex flex-col text-left justify-between h-28 border border-white/5 group hover:border-white/10 transition-all duration-300">
                    <div className="flex justify-between items-center bg-transparent">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{snap.label}</span>
                      <span className="p-1 rounded bg-white/5 group-hover:scale-105 transition-transform">{snap.icon}</span>
                    </div>
                    <div className="flex flex-col bg-transparent mt-3">
                      <span className={`text-sm font-extrabold truncate ${snap.color}`}>{snap.value}</span>
                      <span className="text-[8px] text-slate-500 font-semibold uppercase tracking-wide mt-0.5">{snap.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* B. MIDDLE COCKPIT GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 flex flex-col gap-6">

                  {/* Career Readiness Detail Explanation (No Percentage Only!) */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-navy-dark/45 text-left">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5 bg-transparent">
                      <Award className="w-4 h-4 text-neon-cyan" />
                      Readiness Index Audit Breakdown
                    </h3>

                    <div className="flex flex-col gap-3 bg-transparent">
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs bg-transparent">
                        <span className="text-neon-cyan font-bold block mb-1">Audit Recommendation</span>
                        <p className="text-slate-400 leading-relaxed m-0 text-[11px]">
                          Your readiness index is rated at <strong className="text-white">{profile.careerReadiness || 0}%</strong>. This indicates strong foundational credentials in Python and development tools. To bridge the remaining gap, focus on completing today's mission and verifying your advanced database skills.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-1 bg-transparent">
                        <div className="flex flex-col gap-1.5 bg-transparent">
                          <span className="text-[10px] text-emerald-400 font-extrabold uppercase">Key Strengths</span>
                          <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1 m-0 text-[11px]">
                            <li>Quantifiable project logs verified</li>
                            <li>High study consistency index</li>
                          </ul>
                        </div>
                        <div className="flex flex-col gap-1.5 bg-transparent">
                          <span className="text-[10px] text-amber-400 font-extrabold uppercase">Key Weaknesses</span>
                          <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1 m-0 text-[11px]">
                            <li>Missing advanced cloud modules</li>
                            <li>Unverified database skills</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Today's Mission widget */}
                  <div className="p-6 rounded-3xl border border-neon-blue/20 bg-gradient-to-br from-navy-dark/70 via-navy-bg/50 to-navy-dark/70 text-left relative overflow-hidden shadow-xl hover:border-neon-blue/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neon-blue/5 to-transparent pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10 bg-transparent">
                      <div className="flex flex-col gap-1.5 flex-1 bg-transparent">
                        <div className="inline-flex items-center gap-1 text-[9px] text-neon-blue font-black uppercase tracking-widest bg-neon-blue/10 border border-neon-blue/20 px-2.5 py-1 rounded-full w-fit">
                          <Sparkles className="w-3 h-3 text-neon-blue" />
                          Today's Mission
                        </div>
                        <h2 className="text-base font-extrabold text-white mt-1">
                          {getTodayMission().task}
                        </h2>

                        <div className="flex items-center gap-3.5 mt-2 text-xs text-slate-500 bg-transparent">
                          <span className="flex items-center gap-1.5 bg-transparent">
                            <Clock className="w-3.5 h-3.5 text-neon-cyan" />
                            Time: <strong className="text-slate-300">{getTodayMission().time}</strong>
                          </span>
                          <span className="h-3 w-px bg-white/10"></span>
                          <span className="flex items-center gap-1.5 bg-transparent">
                            <Gauge className="w-3.5 h-3.5 text-neon-purple" />
                            Difficulty:{' '}
                            <strong className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getTodayMission().difficultyColor}`}>
                              Medium
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 md:mt-0 bg-transparent shrink-0">
                        {taskActive && (
                          <div className="px-3 py-2 bg-navy-dark border border-neon-blue/20 rounded-xl text-xs font-mono text-neon-blue">
                            Timer: {formatTimer(taskTimeLeft)}
                          </div>
                        )}
                        <button
                          onClick={handleStartTask}
                          disabled={taskCompleted}
                          className={`px-5 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer border-0 flex items-center justify-center gap-2 ${taskCompleted
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : taskActive
                                ? 'bg-amber-500 text-navy-bg hover:bg-amber-400'
                                : 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow shadow-neon-blue/10'
                            }`}
                        >
                          {taskCompleted ? 'Completed' : taskActive ? 'Pause Timer' : 'Launch Session'}
                        </button>
                        {taskActive && (
                          <button
                            onClick={handleCompleteTaskDirectly}
                            className="px-3.5 py-3 rounded-xl bg-emerald-500 text-white font-bold text-xs border-0 cursor-pointer hover:bg-emerald-400 transition-colors"
                          >
                            Submit
                          </button>
                        )}
                      </div>
                    </div>

                    {showCongrats && (
                      <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between text-xs animate-float">
                        <div className="flex items-center gap-2 bg-transparent">
                          <Trophy className="w-4 h-4 animate-bounce text-emerald-400" />
                          <span><strong>Congratulations!</strong> Mission completed successfully. Streaks updated.</span>
                        </div>
                        <button onClick={() => setShowCongrats(false)} className="text-emerald-400 hover:text-white bg-transparent border-0 font-bold cursor-pointer">Dismiss</button>
                      </div>
                    )}
                  </div>

                  {/* Interactive Roadmap Step Timeline */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-navy-dark/45 text-left">
                    <div className="flex justify-between items-center mb-4 bg-transparent">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestone timeline</span>
                      <button onClick={() => setDashboardTab('roadmap')} className="text-[10px] text-neon-blue hover:text-white font-bold bg-transparent border-0 cursor-pointer flex items-center gap-1 transition-colors">
                        Expand Roadmap <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {roadmap.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-transparent">
                        <div className="text-3xl mb-2">🗺️</div>
                        <h4 className="text-sm font-bold text-white mb-1">No Roadmap Yet</h4>
                        <p className="text-xs text-slate-400 mb-4 max-w-md">
                          Generate your personalized roadmap to begin your learning journey.
                        </p>
                        <button
                          onClick={handleGenerateRoadmap}
                          disabled={isGeneratingRoadmap}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white text-xs font-bold transition-all cursor-pointer border-0 shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingRoadmap && (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          )}
                          {isGeneratingRoadmap ? 'Generating...' : 'Generate My Roadmap'}
                        </button>
                        {roadmapError && (
                          <p className="text-xs text-rose-400 mt-2 font-medium">
                            {roadmapError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-2 px-1 bg-transparent">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 hidden md:block z-0"></div>
                        {roadmap.map((item, idx) => {
                          const isCompleted = item.status === 'completed';
                          const isCurrent = item.status === 'in-progress';
                          return (
                            <div key={item.id} className="flex flex-row md:flex-col items-center gap-3.5 md:gap-2 text-left md:text-center flex-1 relative z-10 bg-transparent">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 text-[10px] font-bold ${isCompleted
                                  ? 'bg-emerald-950 border-emerald-400 text-emerald-400 shadow-md'
                                  : isCurrent
                                    ? 'bg-neon-blue/20 border-neon-blue text-neon-blue animate-pulse shadow-md scale-105'
                                    : 'bg-navy-dark border-white/10 text-slate-600'
                                }`}>
                                {isCompleted ? '✓' : idx + 1}
                              </div>
                              <div className="flex flex-col md:items-center bg-transparent text-xs">
                                <span className={`font-bold ${isCompleted ? 'text-slate-500' : isCurrent ? 'text-white' : 'text-slate-600'}`}>{item.title}</span>
                                {isCurrent && <span className="text-[8px] bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/20 px-1 py-0.5 rounded uppercase mt-0.5">Active</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right widgets panel */}
                <div className="flex flex-col gap-6">

                  {/* Quick AI Recommendations widget */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-navy-dark/45 text-left">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5 bg-transparent">
                      <Sparkles className="w-4 h-4 text-neon-purple animate-pulse" />
                      AI Recommendations
                    </h3>

                    <div className="flex flex-col gap-3 bg-transparent text-xs">
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col gap-1 bg-transparent">
                        <span className="text-[9px] text-neon-pink font-bold uppercase tracking-wider">Target Training Skill</span>
                        <span className="text-white font-extrabold">PyTorch Frameworks</span>
                        <p className="text-slate-500 m-0 text-[10px] mt-0.5">Required for model design modules in Milestone 3.</p>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col gap-1 bg-transparent">
                        <span className="text-[9px] text-neon-cyan font-bold uppercase tracking-wider">Capstone Projects</span>
                        <span className="text-white font-extrabold">Transformer Translator</span>
                        <p className="text-slate-500 m-0 text-[10px] mt-0.5">Build sequence models to showcase on your digital portfolio.</p>
                      </div>
                    </div>
                  </div>

                  {/* Activity logs */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-navy-dark/45 text-left">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5 bg-transparent">
                      <Activity className="w-4 h-4 text-neon-blue" />
                      Recent Activity
                    </h3>
                    <div className="flex flex-col gap-3 bg-transparent text-xs">
                      {[
                        { text: 'Completed Python Basics module', time: '10m ago' },
                        { text: 'Uploaded resume document', time: '1h ago' },
                        { text: 'Configured study planning parameters', time: '3h ago' }
                      ].map((log, i) => (
                        <div key={i} className="flex justify-between items-center bg-transparent py-0.5">
                          <span className="text-slate-300 font-semibold truncate max-w-[160px]">{log.text}</span>
                          <span className="text-[10px] text-slate-500 font-medium shrink-0">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CAREER DISCOVERY */}
          {dashboardTab === 'discovery' && (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto text-left">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1.5">Career Pathways Discovery</h2>
                <p className="text-xs text-slate-400">Run a scan of your extracted skills and profile details to calculate career fits.</p>
              </div>

              {discoveryStage === 'idle' && (
                <div className="p-10 border border-white/5 bg-navy-dark/30 rounded-3xl flex flex-col items-center text-center gap-4">
                  <Compass className="w-12 h-12 text-neon-blue animate-float" />
                  <div className="flex flex-col gap-1.5 bg-transparent">
                    <h3 className="text-base font-bold text-white">Initialize Career Scan</h3>
                    <p className="text-xs text-slate-500 max-w-sm">We will cross-reference your skills and interests against job indices to suggest 3 career paths.</p>
                  </div>
                  <button
                    onClick={triggerCareerScan}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-xs font-bold hover:scale-102 transition-all cursor-pointer border-0 shadow"
                  >
                    Scan Profile
                  </button>
                </div>
              )}

              {/* Analyzing Loader Animation */}
              {discoveryStage === 'analyzing' && (
                <div className="p-10 border border-white/5 bg-navy-dark/30 rounded-3xl flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-neon-blue animate-pulse">Reading profile credentials...</span>
                </div>
              )}

              {/* Thinking Animation */}
              {discoveryStage === 'thinking' && (
                <div className="p-10 border border-white/5 bg-navy-dark/30 rounded-3xl flex flex-col items-center justify-center gap-4">
                  <Brain className="w-12 h-12 text-neon-purple animate-pulse" />
                  <span className="text-xs font-bold text-neon-purple animate-pulse">Calibrating database correlations...</span>
                </div>
              )}

              {/* Render Matches */}
              {discoveryStage === 'matches' && (
                <div className="flex flex-col gap-4">
                  {discoveryMatches.map(c => {
                    const isSelected = profile.selectedCareer === c.name;
                    return (
                      <div key={c.name} className={`p-5 rounded-2xl border transition-all ${isSelected ? 'border-neon-cyan bg-neon-cyan/5 shadow-md shadow-neon-cyan/5' : 'border-white/5 bg-navy-dark/20'
                        } flex flex-col gap-4 text-xs`}>
                        <div className="flex justify-between items-start flex-wrap gap-2 bg-transparent">
                          <div className="flex flex-col bg-transparent">
                            <h4 className="text-base font-extrabold text-white m-0">{c.name}</h4>
                            <span className="text-[10px] text-neon-cyan font-bold uppercase tracking-wider mt-0.5">{c.match}% Match Index</span>
                          </div>

                          <div className="flex items-center gap-2 bg-transparent">
                            {isSelected ? (
                              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold">Active Goal</span>
                            ) : (
                              <button
                                onClick={() => {
                                  updateProfile({ selectedCareer: c.name });
                                  generateSkillsForCareer(c.name).then(skills => updateProfile({ skills }));
                                  alert(`Goal updated to: ${c.name}`);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-neon-blue hover:bg-neon-cyan text-navy-bg font-extrabold border-0 cursor-pointer transition-colors"
                              >
                                Select Career
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-400 leading-normal m-0 text-[11px]">{c.desc}</p>

                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl leading-normal text-slate-300">
                          <strong className="text-white">Why this career:</strong> {c.why}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 border-t border-white/5 pt-3.5 bg-transparent text-[11px]">
                          <div className="flex flex-col bg-transparent">
                            <span className="text-slate-500 font-bold uppercase text-[9px]">Required Skills</span>
                            <span className="text-slate-300 font-semibold truncate mt-0.5" title={c.skills.join(', ')}>{c.skills.join(', ')}</span>
                          </div>
                          <div className="flex flex-col bg-transparent">
                            <span className="text-slate-500 font-bold uppercase text-[9px]">Salary Range</span>
                            <span className="text-white font-bold mt-0.5">{c.salary}</span>
                          </div>
                          <div className="flex flex-col bg-transparent">
                            <span className="text-slate-500 font-bold uppercase text-[9px]">Growth Trend</span>
                            <span className="text-emerald-400 font-bold mt-0.5">{c.trend}</span>
                          </div>
                          <div className="flex flex-col bg-transparent">
                            <span className="text-slate-500 font-bold uppercase text-[9px]">Setting</span>
                            <span className="text-neon-cyan font-bold mt-0.5">{c.remote}</span>
                          </div>
                          <div className="flex flex-col bg-transparent">
                            <span className="text-slate-500 font-bold uppercase text-[9px]">Difficulty</span>
                            <span className="text-amber-400 font-bold mt-0.5">{c.difficulty}</span>
                          </div>
                          <div className="flex flex-col bg-transparent">
                            <span className="text-slate-500 font-bold uppercase text-[9px]">Study Duration</span>
                            <span className="text-slate-300 font-bold mt-0.5">{c.duration || '6 months'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
                 {/* TAB 3: ROADMAP VIEW */}
          {dashboardTab === 'roadmap' && (
            <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1.5">Study Roadmap</h2>
                <p className="text-xs text-slate-400">Review your customized milestones. Check off topics as you learn to update velocity.</p>
              </div>

              {roadmap.length === 0 ? (
                <div className="p-10 border border-white/5 bg-navy-dark/30 rounded-3xl flex flex-col items-center text-center gap-5">
                  <Map className="w-16 h-16 text-slate-500 animate-float" />
                  
                  <div className="flex flex-col gap-2 bg-transparent">
                    <h3 className="text-lg font-bold text-white">No Roadmap Yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      You haven't generated your personalized learning roadmap. Generate one now based on your
                    </p>
                    <ul className="text-xs text-slate-400 flex flex-col gap-1.5 items-start mx-auto mt-2 text-left bg-transparent">
                      <li>• Career Goal</li>
                      <li>• Skills</li>
                      <li>• Experience</li>
                      <li>• Time Availability</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleGenerateRoadmap}
                    disabled={isGeneratingRoadmap}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white text-xs font-bold transition-all cursor-pointer border-0 shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingRoadmap && (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {isGeneratingRoadmap ? 'Generating your roadmap...' : 'Generate My Roadmap'}
                  </button>
                  
                  {roadmapError && (
                    <p className="text-xs text-rose-400 font-medium">
                      {roadmapError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="relative border-l-2 border-white/5 pl-8 ml-4 flex flex-col gap-8 py-3 bg-transparent">
                  {roadmap.map((item, idx) => {
                    const isActive = item.status === 'in-progress';
                    const isCompleted = item.status === 'completed';
                    return (
                      <div key={item.id} className="relative bg-transparent">
                        <span className={`absolute top-1.5 -left-[41px] w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-bold ${isCompleted
                            ? 'bg-emerald-950 border-emerald-400 text-emerald-400'
                            : isActive
                              ? 'bg-neon-blue/20 border-neon-blue text-neon-blue animate-pulse'
                              : 'bg-navy-dark border-white/10 text-slate-600'
                          }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </span>

                        <div className={`p-5 rounded-2xl border transition-all ${isCompleted
                            ? 'border-emerald-500/20 bg-emerald-500/5'
                            : isActive
                              ? 'border-neon-blue/30 bg-neon-blue/5 shadow-md shadow-neon-blue/5'
                              : 'border-white/5 bg-navy-dark/20 opacity-55'
                          }`}>
                          <div className="flex justify-between items-start flex-wrap gap-2 mb-3 bg-transparent">
                            <div className="bg-transparent">
                              <h3 className="text-base font-extrabold text-white m-0">{item.title}</h3>
                              <span className="text-[9px] text-neon-cyan font-bold uppercase tracking-wider mt-0.5">Milestone {idx + 1} &bull; {item.duration}</span>
                            </div>

                            <button
                              onClick={() => toggleRoadmapItemStatus(item.id)}
                              disabled={item.status === 'locked'}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${isCompleted
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                  : isActive
                                    ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20'
                                    : 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed'
                                }`}
                            >
                              {isCompleted ? 'Completed' : isActive ? 'Mark Complete' : 'Locked'}
                            </button>
                          </div>

                          <p className="text-slate-400 leading-normal text-xs mb-4">{item.description}</p>

                          <div className="border-t border-white/5 pt-4 flex flex-col gap-2.5 bg-transparent">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Study Topics</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-transparent text-xs text-slate-400">
                              {item.topics.map((t, i) => (
                                <div key={i} className="flex items-center gap-2 bg-transparent">
                                  <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan shrink-0"></span>
                                  <span className="truncate">{t}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RESUME ANALYZER */}
          {dashboardTab === 'resume' && (
            <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1.5">Resume ATS Scanner</h2>
                <p className="text-xs text-slate-400">Analyze layout keyword alignment and run gaps extraction in real-time.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="md:col-span-2 flex flex-col gap-6">
                  {resumeStage === 'idle' && (
                    <div className="p-8 border border-dashed border-white/10 hover:border-neon-blue/30 bg-navy-dark/30 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            triggerResumeScan(e.target.files[0].name);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <FileUp className="w-10 h-10 text-slate-500 animate-pulse" />
                      <div className="flex flex-col gap-1 bg-transparent">
                        <span className="text-xs font-bold text-white">Drag & Drop Resume PDF</span>
                        <span className="text-[9px] text-slate-500">Scan for immediate ATS formatting and keywords</span>
                      </div>
                    </div>
                  )}

                  {resumeStage !== 'idle' && resumeStage !== 'done' && (
                    <div className="p-6 border border-white/5 bg-navy-dark/30 rounded-2xl flex flex-col gap-4">
                      <div className="flex justify-between items-center bg-transparent text-xs">
                        <span className="font-bold text-neon-blue uppercase tracking-wider">Parsing Resume...</span>
                        <span className="font-bold text-white">{resumeProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-500" style={{ width: `${resumeProgress}%` }}></div>
                      </div>
                      <span className="text-[10px] text-slate-500">Stage: {resumeStage.toUpperCase()}</span>
                    </div>
                  )}

                  {resumeStage === 'done' && (
                    <div className="flex flex-col gap-6">

                      <div className="p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl flex justify-between items-center">
                        <div className="flex flex-col text-left bg-transparent">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ATS Score Calibrated</span>
                          <span className="text-sm font-extrabold text-white mt-1 truncate">{resumeFile}</span>
                        </div>
                        <span className="text-3xl font-black text-emerald-400">{profile.resume.atsScore || 0}%</span>
                      </div>

                      <div className="p-5 rounded-2xl border border-white/5 bg-navy-dark/45 text-xs flex flex-col gap-3">
                        <span className="text-xs font-bold text-white border-b border-white/5 pb-1.5">Recommendations</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-transparent text-[11px]">
                          <div className="flex flex-col bg-transparent">
                            <span className="text-emerald-400 font-bold uppercase text-[9px] mb-1">Strengths</span>
                            <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1 m-0">
                              {profile.resume.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div className="flex flex-col bg-transparent">
                            <span className="text-amber-400 font-bold uppercase text-[9px] mb-1">Improvement Areas</span>
                            <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1 m-0">
                              {profile.resume.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                          </div>
                        </div>

                        {profile.resume.missingSkills.length > 0 && (
                          <div className="border-t border-white/5 pt-3 mt-1 bg-transparent">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Recommended Keywords to Add</span>
                            <div className="flex flex-wrap gap-1.5 bg-transparent">
                              {profile.resume.missingSkills.map(sk => (
                                <span key={sk} className="px-2.5 py-1 rounded-lg bg-neon-purple/10 border border-neon-purple/20 text-neon-purple font-extrabold text-[10px]">{sk}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="border-t border-white/5 pt-3.5 mt-2 flex gap-2 bg-transparent justify-end">
                          <button
                            onClick={() => { setResumeStage('idle'); setResumeFile(''); }}
                            className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold border-0 cursor-pointer"
                          >
                            Rescan
                          </button>
                          <button
                            onClick={handleStoreResume}
                            className="px-4 py-2 rounded-lg bg-neon-blue text-navy-bg font-extrabold text-xs border-0 cursor-pointer"
                          >
                            Store Resume in Vault
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Right panel: ATS Compliance Checklist */}
                <div className="p-5 border border-white/5 bg-navy-dark/45 rounded-2xl flex flex-col gap-4 text-xs">
                  <h3 className="font-bold text-white border-b border-white/5 pb-2 m-0 flex items-center gap-1.5 bg-transparent">
                    <CheckCircle2 className="w-4 h-4 text-neon-cyan" />
                    ATS Compliance Matrix
                  </h3>
                  <div className="flex flex-col gap-3 bg-transparent text-[11px]">
                    {[
                      { l: 'Layout compliance check', d: 'Avoid two-column shapes' },
                      { l: 'Contact details index', d: 'Email, GitHub, Location parsed' },
                      { l: 'Education hierarchy', d: 'Degree major matching target' },
                      { l: 'Technical skills list', d: 'Keywords index parsed' }
                    ].map((c, i) => (
                      <div key={i} className="flex justify-between items-start gap-2 bg-transparent">
                        <div className="flex flex-col text-left bg-transparent">
                          <span className="text-slate-300 font-semibold">{c.l}</span>
                          <span className="text-[9px] text-slate-500">{c.d}</span>
                        </div>
                        <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">✓</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: CAREER VAULT */}
          {dashboardTab === 'vault' && (
            <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1.5">Career Vault Document Store</h2>
                  <p className="text-xs text-slate-400">Securely store, preview, and download your verified academic and resume papers.</p>
                </div>

                {/* Upload Button */}
                <div className="relative bg-transparent">
                  <input
                    type="file"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        try {
                          const uploadBody = {
                            category: 'Other Documents',
                            title: file.name,
                            description: 'User uploaded career document',
                            fileName: file.name,
                            fileType: 'PDF',
                            fileSize: '1.4 MB',
                            textContent: 'User uploaded file text.'
                          };
                          const res = await ApiClient.post<{ document: any }>('/vault/upload', uploadBody);
                          if (res && res.document) {
                            const newDoc: VaultFile = {
                              id: res.document.id,
                              name: res.document.title,
                              folder: 'Other Documents',
                              size: res.document.fileSize || '1.4 MB',
                              uploadedAt: res.document.uploadedAt ? res.document.uploadedAt.split('T')[0] : new Date().toISOString().split('T')[0],
                              fileType: 'PDF'
                            };
                            setVaultFiles(prev => [newDoc, ...prev]);
                            alert(`Uploaded ${file.name} successfully!`);
                          }
                        } catch (err) {
                          console.error('Failed to upload file to backend vault:', err);
                          alert('Failed to upload file to Career Vault.');
                        }
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <button className="px-4 py-2.5 rounded-xl bg-neon-blue text-navy-bg font-extrabold text-xs border-0 cursor-pointer flex items-center gap-1">
                    <FileUp className="w-4 h-4" /> Upload Document
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* Left Folder Filters list */}
                <div className="flex flex-col gap-2 bg-transparent text-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Folders List</span>
                  {['All', 'Resume', 'Certificates', 'Projects', 'Academic Documents', 'Offer Letters', 'Other Documents'].map(folder => {
                    const active = selectedVaultFolder === folder;
                    return (
                      <button
                        key={folder}
                        onClick={() => setSelectedVaultFolder(folder)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border-0 cursor-pointer font-bold transition-all flex items-center justify-between ${active
                            ? 'bg-neon-blue/10 text-white'
                            : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                          }`}
                      >
                        <span className="truncate">{folder}</span>
                        <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                          {folder === 'All' ? vaultFiles.length : vaultFiles.filter(f => f.folder === folder).length}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Document List Table */}
                <div className="md:col-span-3 flex flex-col gap-4">
                  {/* Search, Filter, Sort Controls */}
                  <div className="flex items-center gap-3 bg-transparent flex-wrap text-xs">
                    <div className="relative flex-1 min-w-[180px]">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={vaultSearchQuery}
                        onChange={(e) => setVaultSearchQuery(e.target.value)}
                        placeholder="Search document name..."
                        className="w-full pl-9 pr-4 py-2 bg-navy-dark/40 border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
                      />
                    </div>

                    <select
                      value={vaultSortBy}
                      onChange={(e) => setVaultSortBy(e.target.value as any)}
                      className="px-3.5 py-2 bg-navy-dark/40 border border-white/5 rounded-xl text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="date" className="bg-navy-dark">Sort: Date</option>
                      <option value="name" className="bg-navy-dark">Sort: Name</option>
                      <option value="size" className="bg-navy-dark">Sort: Size</option>
                    </select>
                  </div>

                  {/* Documents Grid / List */}
                  <div className="flex flex-col gap-2.5 bg-transparent">
                    {vaultFiles
                      .filter(f => selectedVaultFolder === 'All' || f.folder === selectedVaultFolder)
                      .filter(f => f.name.toLowerCase().includes(vaultSearchQuery.toLowerCase()))
                      .sort((a, b) => {
                        if (vaultSortBy === 'name') return a.name.localeCompare(b.name);
                        if (vaultSortBy === 'size') return b.size.localeCompare(a.size);
                        return b.uploadedAt.localeCompare(a.uploadedAt);
                      })
                      .map(file => (
                        <div key={file.id} className="p-4 rounded-xl border border-white/5 bg-navy-dark/20 flex justify-between items-center text-xs gap-3">
                          <div className="flex items-center gap-3 min-w-0 bg-transparent">
                            <div className="p-2 rounded bg-white/5">
                              <FileText className="w-4 h-4 text-neon-blue" />
                            </div>
                            <div className="flex flex-col text-left min-w-0 bg-transparent">
                              <span className="text-white font-bold truncate">{file.name}</span>
                              <span className="text-[9px] text-slate-500 mt-0.5">{file.folder} &bull; {file.size} &bull; Uploaded {file.uploadedAt}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-transparent shrink-0">
                            <button
                              onClick={() => setPreviewFile(file)}
                              className="p-1.5 rounded-lg border-0 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href="#"
                              onClick={(e) => { e.preventDefault(); alert(`Downloading ${file.name}...`); }}
                              className="p-1.5 rounded-lg border-0 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={async () => {
                                try {
                                  await ApiClient.delete(`/vault/${file.id}`);
                                  setVaultFiles(prev => prev.filter(f => f.id !== file.id));
                                  alert('Document deleted from Career Vault successfully.');
                                } catch (err) {
                                  console.error('Failed to delete document from backend vault:', err);
                                  alert('Failed to delete document. Please try again.');
                                }
                              }}
                              className="p-1.5 rounded-lg border-0 bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                </div>

              </div>

              {/* Preview Document Overlay Glass Modal */}
              {previewFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-md">
                  <div className="w-full max-w-lg glass-card rounded-2xl border border-white/15 p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div className="flex flex-col text-left bg-transparent">
                        <span className="text-xs font-bold text-white">{previewFile.name}</span>
                        <span className="text-[9px] text-slate-500 uppercase font-mono mt-0.5">{previewFile.folder} preview</span>
                      </div>
                      <button
                        onClick={() => setPreviewFile(null)}
                        className="p-1 text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Simulated document layout */}
                    <div className="p-5 bg-navy-dark/60 rounded-xl border border-white/5 h-64 overflow-y-auto text-left text-[10px] text-slate-400 font-sans leading-relaxed select-none">
                      <div className="text-center font-bold text-white border-b border-slate-700 pb-2 mb-3 uppercase">
                        {profile.name} Document
                      </div>
                      <p className="mb-2"><strong>Verification Hash:</strong> cp_verify_f19ba6d4b8e2</p>
                      <p className="mb-2">This is a secure preview of the uploaded certificate file. Under our Operating System, all vault items undergo layout formatting audits before storage indexing.</p>
                      <p className="mb-2">Registered credentials automatically feed verification updates to the Career Readiness metric.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 6: AI MENTOR (Coach modes) */}
          {dashboardTab === 'mentor' && (
            <div className="flex flex-col gap-5 max-w-4xl mx-auto h-[calc(100vh-130px)] text-left">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1.5">AI Mentorship Engine</h2>
                <p className="text-xs text-slate-400">Initialize specialist modes to target specific calibration modules.</p>
              </div>

              {/* Mode Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-transparent text-[10px] font-bold uppercase shrink-0">
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
                      onClick={() => changeMentorMode(mode.id as any)}
                      className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${active
                          ? 'border-neon-cyan bg-neon-cyan/5 text-white'
                          : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                        }`}
                    >
                      {mode.icon}
                      <span className="truncate">{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mentorship Conversation chat box */}
              <div className="flex-1 glass-card border border-white/5 rounded-3xl p-4 flex flex-col justify-between overflow-hidden min-h-0">

                {/* Chat header */}
                <div className="flex items-center gap-2 border-b border-white/5 pb-3 bg-transparent shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-neon-blue" />
                  </div>
                  <div className="flex flex-col bg-transparent">
                    <span className="text-xs font-bold text-white capitalize">{mentorMode} Expert Advisor</span>
                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">Ready for Calibration</span>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 pr-1 text-xs bg-transparent">
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 max-w-[85%] bg-transparent ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                        }`}
                    >
                      {msg.sender === 'mentor' && (
                        <div className="w-6.5 h-6.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                          <Bot className="w-3.5 h-3.5 text-neon-blue" />
                        </div>
                      )}
                      <div
                        className={`flex flex-col rounded-2xl p-3 leading-relaxed border ${msg.sender === 'user'
                            ? 'bg-neon-blue/10 border-neon-blue/20 text-slate-100 rounded-tr-none'
                            : 'bg-navy-dark/60 border-white/5 text-slate-200 rounded-tl-none'
                          }`}
                      >
                        <span>{msg.text}</span>
                        <span className="text-[8px] text-slate-500 mt-1 block font-mono">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-start gap-2.5 self-start max-w-[85%] bg-transparent">
                      <div className="w-6.5 h-6.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-neon-blue" />
                      </div>
                      <div className="flex gap-1 items-center bg-navy-dark/60 border border-white/5 rounded-2xl p-3.5">
                        <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-typing-dot"></span>
                        <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-typing-dot" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-typing-dot" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question prompts at bottom */}
                <div className="flex flex-wrap gap-1.5 py-2.5 border-t border-white/5 bg-transparent shrink-0">
                  {[
                    { text: 'Analyze market salary average', prompt: 'Tell me the average entry-level salary and growth forecast.' },
                    { text: 'Start mock technical challenge', prompt: 'Ask me a technical interview question for my stack.' },
                    { text: 'Explain cloud microservices', prompt: 'Explain the core difference between Docker containers and virtual machines.' }
                  ].map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendChatMessage(`[${mentorMode.toUpperCase()} COACH] ` + sug.prompt)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-neon-blue/15 hover:text-white border border-white/5 hover:border-neon-blue/30 text-[9px] text-slate-400 font-bold transition-all cursor-pointer"
                    >
                      {sug.text}
                    </button>
                  ))}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2 border-t border-white/5 pt-3 mt-auto shrink-0 bg-transparent">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Ask your ${mentorMode} mentor...`}
                    className="flex-1 px-3 py-2.5 bg-navy-dark/50 border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-neon-blue/50 transition-all"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-neon-blue hover:bg-neon-cyan text-navy-bg font-extrabold transition-all border-0 cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>
            </div>
          )}

          {/* TAB 7: PROFESSIONAL PORTFOLIO PROFILE */}
          {dashboardTab === 'profile' && (
            <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1.5">Professional Portfolio</h2>
                <p className="text-xs text-slate-400">Review your portfolio completion meter and credentials summary.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left metrics column */}
                <div className="flex flex-col gap-6">
                  {/* Completion Meter */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-navy-dark/45 flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-transparent text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">Completion Index</span>
                      <span className="text-neon-cyan">{profile.profileCompletion || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-neon-blue to-neon-purple" style={{ width: `${profile.profileCompletion || 0}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal m-0 mt-1">Add another certificate to reach 100% profile strength.</p>
                  </div>

                  {/* Resume status widget */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-navy-dark/45 flex flex-col gap-2.5 text-xs text-left">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-white/5 pb-1">Resume Scans Index</span>
                    <div className="flex justify-between items-center bg-transparent">
                      <span className="text-slate-400 font-semibold">Active File:</span>
                      <span className="text-white font-bold max-w-[120px] truncate">{profile.resume.fileName || 'Pending'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-transparent">
                      <span className="text-slate-400 font-semibold">ATS Rating:</span>
                      <span className="text-emerald-400 font-bold">{profile.resume.atsScore || 0}%</span>
                    </div>
                  </div>

                  {/* Verified Certificates */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-navy-dark/45 flex flex-col gap-2 text-xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-white/5 pb-1 mb-1">Certifications ({coursesCompletedCount})</span>
                    {profile.certifications.map((c, i) => (
                      <div key={i} className="flex justify-between items-center bg-transparent py-0.5">
                        <span className="text-slate-300 font-semibold truncate max-w-[130px]">{c.courseName}</span>
                        <span className="text-[9px] text-neon-purple font-bold uppercase tracking-wider shrink-0">{c.provider}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right profile detail columns */}
                <div className="md:col-span-2 flex flex-col gap-6">
                  {/* Career parameters */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-navy-dark/45 flex flex-col gap-3 text-xs text-slate-400 leading-relaxed">
                    <h3 className="text-sm font-bold text-white m-0">About Me</h3>
                    <p className="m-0 text-[11px] leading-normal">{profile.aboutMe || 'Fill out onboarding description parameters to populate.'}</p>
                  </div>

                  {/* Education & Experience info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-transparent text-xs text-left">
                    <div className="p-5 rounded-2xl border border-white/5 bg-navy-dark/45 flex flex-col gap-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 bg-transparent">
                        <GraduationCap className="w-4 h-4 text-neon-blue" /> Education
                      </span>
                      <div className="flex flex-col bg-transparent mt-1 leading-normal">
                        <span className="text-white font-bold">{profile.education.degree || 'Bachelor degree'}</span>
                        <span className="text-slate-400 italic mt-0.5">{profile.education.collegeName || 'State University'}</span>
                        <span className="text-[10px] text-slate-500 mt-1">Class of {profile.education.graduationYear || '2026'} &bull; GPA: {profile.education.cgpa || '3.7'}</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/5 bg-navy-dark/45 flex flex-col gap-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 bg-transparent">
                        <Briefcase className="w-4 h-4 text-neon-purple" /> Experience
                      </span>
                      <div className="flex flex-col bg-transparent mt-1 leading-normal">
                        <span className="text-white font-bold">{profile.professionalDetails.jobTitle || 'Aspiring Professional'}</span>
                        <span className="text-slate-400 italic mt-0.5">{profile.professionalDetails.industry || 'Tech Industry'}</span>
                        <span className="text-[10px] text-slate-500 mt-1">{profile.professionalDetails.yearsOfExperience || '0'} Years Experience</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Assessment Matrix */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-navy-dark/45 text-left text-xs">
                    <div className="flex justify-between items-center mb-3 bg-transparent">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Skill Verification Matrix</span>
                      <span className="text-[9px] text-neon-cyan font-bold uppercase tracking-wider flex items-center gap-1 bg-transparent">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Verify below
                      </span>
                    </div>

                    {/* Skill verification table */}
                    <div className="flex flex-col gap-3 bg-transparent">
                      {profile.skills.map(skill => {
                        const scoreObj = skillRatings[skill] || { self: 3, verified: null };
                        return (
                          <div key={skill} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                            <div className="flex flex-col text-left bg-transparent">
                              <span className="text-white font-bold">{skill}</span>
                              <div className="flex items-center gap-2 mt-1 bg-transparent text-[10px] text-slate-500">
                                <span>Self: <strong>{scoreObj.self}/5</strong></span>
                                <span>&bull;</span>
                                <span>Verified: <strong className={scoreObj.verified ? 'text-neon-cyan' : 'text-slate-600'}>{scoreObj.verified ? `${scoreObj.verified}/5` : 'Pending'}</strong></span>
                              </div>
                            </div>

                            <button
                              onClick={() => triggerSkillChallenge(skill)}
                              className="px-3 py-1.5 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue hover:text-white rounded-lg text-[10px] font-bold transition-all border border-neon-blue/20 cursor-pointer"
                            >
                              Verify
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

              {/* Active Skill Challenge Dialog Overlay */}
              {activeChallengeSkill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-md text-xs text-slate-300">
                  <div className="w-full max-w-lg glass-card rounded-2xl border border-white/15 p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div className="flex flex-col text-left bg-transparent">
                        <span className="text-xs font-bold text-white">{activeChallengeSkill} Skill Challenge</span>
                        <span className="text-[9px] text-slate-500 uppercase font-mono mt-0.5">AI Calibration Evaluator</span>
                      </div>
                      <button
                        onClick={() => setActiveChallengeSkill(null)}
                        className="p-1 text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="p-3 bg-white/5 border border-white/5 rounded-xl leading-normal text-slate-200 font-semibold">{challengeQuestion}</p>

                    <div className="flex flex-col gap-1 bg-transparent">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Write Your Response</label>
                      <textarea
                        value={challengeAnswer}
                        onChange={(e) => setChallengeAnswer(e.target.value)}
                        rows={4}
                        placeholder="Write a clear, concise technical explanation using syntax details..."
                        className="w-full px-3 py-2 bg-navy-dark/60 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-neon-blue/50 text-xs resize-none"
                      />
                    </div>

                    {challengeFeedback && (
                      <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl flex flex-col gap-2">
                        <div className="flex justify-between items-center bg-transparent font-bold">
                          <span className="text-emerald-400">Score Calibrated: {challengeFeedback.score}/5 Stars</span>
                        </div>
                        <p className="m-0 text-[11px] leading-relaxed text-slate-400">{challengeFeedback.comment}</p>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end border-t border-white/5 pt-3.5 bg-transparent">
                      <button
                        onClick={() => setActiveChallengeSkill(null)}
                        className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-0 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={submitSkillChallenge}
                        disabled={evaluatingChallenge || !challengeAnswer.trim()}
                        className="px-4 py-2 rounded-lg bg-neon-blue text-navy-bg font-extrabold border-0 cursor-pointer disabled:opacity-50"
                      >
                        {evaluatingChallenge ? 'Evaluating...' : 'Submit answer'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 8: SETTINGS VIEW */}
          {dashboardTab === 'settings' && (
            <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1.5">Settings Calibration</h2>
                <p className="text-xs text-slate-400">Modify study timelines, salaries, expected setting variables, and reset cache data.</p>
              </div>

              <div className="p-6 border border-white/5 bg-navy-dark/30 rounded-3xl flex flex-col gap-5 text-xs text-left">
                <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2.5">Commitment Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-transparent">
                  <div className="flex flex-col gap-1.5 bg-transparent">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => updateProfile({ name: e.target.value })}
                      placeholder="Alex Pioneer"
                      className="px-4 py-3 bg-navy-dark/60 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-neon-blue/60"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 bg-transparent">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Selected Goal Target</label>
                    <input
                      type="text"
                      value={profile.selectedCareer}
                      onChange={(e) => updateProfile({ selectedCareer: e.target.value })}
                      placeholder="e.g. Machine Learning Engineer"
                      className="px-4 py-3 bg-navy-dark/60 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-neon-blue/60"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5 bg-transparent">
                  <span className="text-[10px] text-slate-500">Cache saved in backend SQL database service.</span>
                  <button
                    onClick={() => alert('Settings successfully updated!')}
                    className="px-5 py-2.5 rounded-xl bg-neon-blue text-navy-bg font-extrabold border-0 cursor-pointer hover:scale-102 transition-transform shadow shadow-neon-blue/10"
                  >
                    Apply Configurations
                  </button>
                </div>
              </div>
            </div>
          )}

          {isDemo && (
            <footer className="mt-8 pt-4 border-t border-white/5 text-center bg-transparent">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Temporary Session &bull; No data is permanently stored &bull; <button onClick={() => { logout(); resetApp(); }} className="text-amber-400 hover:text-amber-300 font-extrabold cursor-pointer bg-transparent border-0 underline inline">Create Account</button> to save progress.
              </span>
            </footer>
          )}
        </main>
      </div>

      {/* Intelligent Global Search overlay component */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
