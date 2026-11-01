import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ApiClient } from '../api/client';
import {
  Bot,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  UploadCloud,
  FileText,
  BookmarkCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const {
    profile,
    updateProfile,
    updateNestedProfile,
    setPage,
    generateSkillsForCareer: getSkillsApi,
    runResumeAnalysis,
    generateRoadmap
  } = useApp();

  // Local step state:
  // 1: Chat Introduction & Bio (About me + Name)
  // 2: Extraction & Selection (Verify Extracted details + Pick Career)
  // 3: Missing Details & Commitment (Commitment numbers + settings)
  // 4: Resume Scan Experience (Drag/drop + ATS Calibration)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mobileTab, setMobileTab] = useState<'chat' | 'config'>('chat');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: "Hello! I am CareerPilot AI, your intelligent career mentor. To construct your high-precision career roadmap, tell me about yourself: your core interests, whether you are a Student or a Working Professional (with your role/title), any internships completed, and your hands-on work experience!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedCareers, setSuggestedCareers] = useState<any[]>([]);
  const [expandedCareer, setExpandedCareer] = useState<string | null>(null);
  const [atsScoring, setAtsScoring] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [resumeProgress, setResumeProgress] = useState(0);
  const [interviewConfidence, setInterviewConfidence] = useState<number>(0);

  // File parsing stages state:
  const [resumeStage, setResumeStage] = useState<
    'idle' | 'uploading' | 'reading' | 'ats' | 'skills' | 'gaps' | 'done'
  >('idle');
  const hoursPerDay = parseInt(profile.timeAvailability.hoursPerDay) || 3;
  const daysPerWeek = parseInt(profile.timeAvailability.daysPerWeek) || 5;
  const targetMonths = parseInt(profile.timeAvailability.targetMonths) || 6;
  const totalWeeks = targetMonths * 4.3;
  const weeklyHours = hoursPerDay * daysPerWeek;
  const totalHours = Math.round(weeklyHours * totalWeeks);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load chat history and suggestions from backend on mount
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const state = await ApiClient.get<{
          messages: Array<{ id: string; sender: 'user' | 'mentor'; text: string; timestamp: string }>;
          conversationProgress: number;
          extractedProfile: any;
          confidence: number;
        }>('/v1/onboarding/state');

        if (state.messages && state.messages.length > 0) {
          setMessages(state.messages.map(m => ({
            sender: m.sender === 'user' ? 'user' : 'ai',
            text: m.text
          })));

          if (state.extractedProfile?.careerGoal) {
            setSuggestedCareers([{
              careerName: state.extractedProfile.careerGoal,
              shortDescription: '',
              whyItMatches: '',
              requiredSkills: [],
              missingSkills: [],
              estimatedSalary: { min: 0, max: 0, currency: '$' },
              growthTrend: 'Stable',
              difficulty: 'Medium',
              estimatedTimeToReadyMonths: 0
            }]);
          }
        }
        
        if (state.confidence !== undefined) {
          const rawConf = state.confidence;
          setInterviewConfidence(rawConf > 1 ? rawConf : Math.round(rawConf * 100));
        } else {
          // Calculate completeness percentage as temporary fallback
          const rawConf = state.conversationProgress || 0;
          setInterviewConfidence(rawConf);
        }
      } catch (err) {
        console.error('Failed to load onboarding state:', err);
      }
    };

    loadOnboardingState();
  }, []);

  // Client-side smart profile extractor is now replaced by real backend AI extraction.

  // A utility function to create a delay between automatic retries
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent execution if inputText is empty or if it is already processing
    if (!inputText.trim() || isProcessing) return;

    const userText = inputText;
    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsTyping(true);
    setIsProcessing(true); // Automatically locks execution and disables double submit

    let retries = 3;       // Maximum number of retries before alerting the user
    let delayTime = 2000;  // Initial wait time of 2 seconds before the first retry

    while (retries > 0) {
      try {
        const response = await ApiClient.post<{
          assistantMessage: string;
          extractedProfile: any;
          updatedFields: string[];
          careerRecommendations: any[];
          nextQuestion: string;
          confidence: number;
          conversationProgress: number;
        }>('/v1/onboarding/chat', { message: userText });

        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          { sender: 'ai', text: response.assistantMessage }
        ]);

        if (response.extractedProfile) {
          const ext = response.extractedProfile;
          updateProfile({
            name: ext.name || profile.name,
            aboutMe: userText,
            skills: ext.skills && ext.skills.length > 0 ? ext.skills : profile.skills,
            selectedCareer: ext.careerGoal || profile.selectedCareer
          });

          updateNestedProfile('education', {
            degree: ext.education || profile.education.degree,
            collegeName: ext.college || profile.education.collegeName,
            graduationYear: ext.currentYear || profile.education.graduationYear
          });
        }

        if (response.confidence !== undefined) {
          const rawConf = response.confidence;
          setInterviewConfidence(rawConf > 1 ? rawConf : Math.round(rawConf * 100));
        } else {
          const rawConf = response.conversationProgress || 0;
          setInterviewConfidence(rawConf);
        }

        if (response.careerRecommendations && response.careerRecommendations.length > 0) {
          setSuggestedCareers(response.careerRecommendations);
          setStep(2);
          setMobileTab('config');
        } else if (response.conversationProgress >= 50) {
          setStep(2);
          setMobileTab('config');
        }

        // If successful, break out of the retry loop completely
        break;

      } catch (error: any) {
        retries--;

        // Catch temporary 500 Server Busy states and perform exponential backoff retries
        if (retries > 0 && error.toString().includes("500")) {
          console.warn(`AI Server busy. Retrying in ${delayTime / 1000} seconds... (${retries} attempts left)`);
          await sleep(delayTime);
          delayTime *= 2; // Doubles the wait time for the next cycle (2s -> 4s -> 8s)
        } else {
          // If out of retries or a different error code hits, stop trying and notify the user
          console.error('Onboarding chat failed after retries:', error);
          setIsTyping(false);
          alert("The AI helper is temporarily busy handling requests. Please try clicking send again in a moment.");
          break;
        }
      } finally {
        // Ensure processing flags reset only when the loop terminates
        if (retries === 0 || !isTyping) {
          setIsProcessing(false);
        }
      }
    }
  };

  const handleSelectCareer = async (career: string) => {
    if (!career || career.trim() === '') {
      alert('Warning: Career title is required to select a career track.');
      return;
    }
    updateProfile({ selectedCareer: career });
    setIsTyping(true);

    try {
      const skills = await getSkillsApi(career);
      updateProfile({ skills });

      // Persist selection to backend onboarding profile
      await ApiClient.patch('/v1/onboarding/profile', { careerGoal: career, skills });

      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `Perfect! You've locked in ${career} as your target role. I've populated your profile with the recommended technical stack. Let's configure your study commitment details to construct your learning roadmap.`
          }
        ]);
        setStep(3);
        setMobileTab('config');
      }, 1200);

    } catch (e) {
      console.error(e);
      setIsTyping(false);
    }
  };

  const handleConfirmCommitment = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "Excellent commitment profile! Now, to tailor your learning modules accurately, let's analyze your current resume. You can drag and drop your PDF here, or let me generate an ATS template for you."
        }
      ]);
      setStep(4);
      setMobileTab('config');
    }, 1000);
  };

  // Simulate Multi-Stage Resume Scanning EXPERIENCE
  const startResumeScan = async (fileName: string) => {
    setAtsScoring(true);
    setResumeStage('uploading');
    setResumeProgress(15);

    // 1. Uploading
    await new Promise(r => setTimeout(r, 600));
    setResumeProgress(35);
    setResumeStage('reading');

    // 2. Reading
    await new Promise(r => setTimeout(r, 700));
    setResumeProgress(60);
    setResumeStage('ats');

    // 3. ATS Analysis
    await new Promise(r => setTimeout(r, 650));
    setResumeProgress(80);
    setResumeStage('skills');

    // 4. Skills extraction
    await new Promise(r => setTimeout(r, 500));
    setResumeProgress(95);
    setResumeStage('gaps');

    // 5. Gap analysis & call backend API
    try {
      await runResumeAnalysis('upload', fileName);
    } catch (e) {
      console.error(e);
    }

    setResumeProgress(100);
    setResumeStage('done');
    setResumeUploaded(true);
    setUploadedFileName(fileName);
    setAtsScoring(false);

    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: `ATS Analysis complete! Your resume scored ${profile.resume.atsScore || 74}% alignment. I've highlighted keyword recommendations. Let's spin up your personalized Career cockpit now!`
      }
    ]);
  };

  const handleGenerateTemplate = async () => {
    setAtsScoring(true);
    setResumeStage('ats');
    setResumeProgress(50);

    try {
      await runResumeAnalysis('generate', 'Generated_Profile_Resume.pdf');
    } catch (e) {
      console.error(e);
    }

    setResumeProgress(100);
    setResumeStage('done');
    setResumeUploaded(true);
    setUploadedFileName('Generated_Profile_Resume.pdf');
    setAtsScoring(false);

    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: "I have generated an ATS-optimized draft resume matching your education and extracted skills! Let's enter your Career Operating System."
      }
    ]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const text = evt.target?.result as string || 'Mock Resume Text Content';
        try {
          await ApiClient.post('/resume/upload', { textContent: text, fileName: file.name });
        } catch (err) {
          console.error('Failed to upload resume to backend:', err);
        }
        startResumeScan(file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const text = evt.target?.result as string || 'Mock Resume Text Content';
        try {
          await ApiClient.post('/resume/upload', { textContent: text, fileName: file.name });
        } catch (err) {
          console.error('Failed to upload resume to backend:', err);
        }
        startResumeScan(file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleFinalizeOnboarding = async () => {
    setIsProcessing(true);
    try {
      await ApiClient.patch('/v1/onboarding/profile', { onboardingCompleted: true });
      await generateRoadmap();
    } catch (err) {
      console.error(err);
    }
    setIsProcessing(false);
    setPage('dashboard');
  };

  // Progress metrics helpers:
  const getEstimatedRemaining = () => {
    if (step === 1) return '3 mins';
    if (step === 2) return '2 mins';
    if (step === 3) return '1 min';
    return '30 secs';
  };

  const getProfileCompleteness = () => {
    let score = 0;
    const missing: string[] = [];
    
    if (profile.name && profile.name !== 'Alex Pioneer') {
      score += 15;
    } else {
      missing.push('Name');
    }
    
    if (profile.aboutMe && profile.aboutMe.trim() !== '') {
      score += 20;
    } else {
      missing.push('About Me');
    }
    
    if (profile.education?.degree) {
      score += 15;
    } else {
      missing.push('Degree');
    }
    
    if (profile.education?.collegeName) {
      score += 15;
    } else {
      missing.push('College');
    }
    
    if (profile.skills && profile.skills.length > 0) {
      score += 20;
    } else {
      missing.push('Skills');
    }
    
    if (profile.selectedCareer) {
      score += 15;
    } else {
      missing.push('Target Career');
    }

    return { score: Math.min(100, score), missing };
  };

  const getCompletedSteps = () => {
    const list = [];
    if (step > 1) list.push('Bio Scanner');
    if (step > 2) list.push('Career Selection');
    if (step > 3) list.push('Commitment Config');
    return list;
  };

  return (
    <div className="h-screen max-h-[100dvh] bg-ink-black text-vanilla-custard flex flex-col md:flex-row overflow-hidden relative">
      {/* MOBILE SEGMENT SWITCHER (< md) */}
      <div className="flex md:hidden border-b border-pearl-aqua/15 bg-ink-black/95 p-2 gap-2 shrink-0 z-30">
        <button
          type="button"
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
            mobileTab === 'chat'
              ? 'bg-dark-teal/40 border-pearl-aqua/50 text-pearl-aqua shadow'
              : 'bg-transparent border-transparent text-pearl-aqua/60 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Mentor Chat</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('config')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all relative ${
            mobileTab === 'config'
              ? 'bg-golden-orange/20 border-golden-orange/50 text-golden-orange shadow'
              : 'bg-transparent border-transparent text-pearl-aqua/60 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Setup Step {step}/4</span>
          {step > 1 && (
            <span className="w-2 h-2 rounded-full bg-golden-orange animate-pulse"></span>
          )}
        </button>
      </div>
      {/* Glow backgrounds */}
      <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-neon-blue/4 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-neon-purple/4 blur-[100px] pointer-events-none"></div>

      {/* LEFT PANEL: The AI conversational chatbot */}
      <div className={`w-full md:flex-1 flex flex-col border-r border-pearl-aqua/10 h-full relative z-10 ${mobileTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>

        {/* Onboarding Header */}
        <header className="px-6 py-4.5 border-b border-white/5 flex justify-between items-center backdrop-blur-md bg-navy-dark/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center shadow shadow-neon-blue/20">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-extrabold text-xs tracking-tight text-white">CareerPilot AI</span>
              <span className="text-[8px] font-bold text-neon-cyan uppercase tracking-wider">Conversational Setup</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold bg-white/5 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Est. Remaining: {getEstimatedRemaining()}</span>
          </div>
        </header>

        {/* Chat Message Workspace */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4.5 scrollbar-thin">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center shrink-0 shadow shadow-neon-blue/10">
                  <Bot className="w-4 h-4 text-neon-blue" />
                </div>
              )}
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed text-left border ${msg.sender === 'user'
                    ? 'bg-neon-blue/10 border-neon-blue/20 text-slate-100 rounded-tr-none'
                    : 'bg-navy-dark/60 border-white/5 text-slate-200 rounded-tl-none'
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-3 self-start max-w-[85%]">
              <div className="w-8 h-8 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-neon-blue animate-pulse" />
              </div>
              <div className="flex gap-1.5 items-center bg-navy-dark/60 border border-white/5 rounded-2xl p-4">
                <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-typing-dot"></span>
                <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-typing-dot" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-typing-dot" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input prompt - only enabled on step 1 */}
        <div className="p-4 border-t border-white/5 bg-navy-dark/30 shrink-0">
          {step === 1 ? (
            <form onSubmit={handleSendPrompt} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your background, experience or education details..."
                className="flex-1 px-4 py-3 bg-navy-dark/50 border border-white/10 focus:border-neon-blue/50 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="px-5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple hover:scale-102 hover:shadow hover:shadow-neon-blue/10 text-white font-bold transition-all border-0 cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold px-2 py-1.5 uppercase tracking-wider bg-transparent">
              <span>Conversational checkpoint active</span>
              <button
                type="button"
                onClick={() => setMobileTab('config')}
                className="text-golden-orange hover:text-white underline cursor-pointer bg-transparent border-0 font-bold"
              >
                Proceed to Step {step} Setup &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Dynamic configuration dashboard */}
      <div className={`w-full md:w-[480px] lg:w-[540px] flex flex-col bg-ink-black/40 h-full relative z-10 border-l border-pearl-aqua/10 ${mobileTab === 'config' ? 'flex' : 'hidden md:flex'}`}>

        {/* Step Progress indicators */}
        <div className="p-6 border-b border-white/5 flex flex-col gap-3">
          <div className="flex justify-between items-center bg-transparent">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Calibration Setup</span>
            <span className="text-xs text-neon-blue font-bold">Step {step} of 4</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-full flex-1 rounded-sm transition-all duration-500 ${s <= step ? 'bg-gradient-to-r from-neon-blue to-neon-purple' : 'bg-white/5'
                  }`}
              />
            ))}
          </div>

          {/* List of completed items */}
          {getCompletedSteps().length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1.5 bg-transparent">
              {getCompletedSteps().map(item => (
                <div key={item} className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content workspace based on steps */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-start">

          {/* STEP 1: Bio Input instructions */}
          {step === 1 && (
            <div className="flex flex-col gap-5 text-left">
              <div className="flex flex-col gap-1 bg-transparent">
                <span className="text-[10px] text-neon-blue font-bold uppercase tracking-wider">Onboarding Interview</span>
                <h2 className="text-lg font-bold text-white tracking-tight m-0">Configure Your Career Profile</h2>
                <p className="text-xs text-slate-400 leading-relaxed my-1">
                  Describe yourself inside the AI conversation on the left. Tell us your major, languages you code in, career aspirations, and where you want to work.
                </p>
              </div>

              {/* Live Auto-Extracted Credentials Card */}
              <div className="p-4 rounded-2xl border border-white/10 bg-navy-dark/40 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Parsed Credentials</span>
                  <span className="text-[10px] text-neon-blue font-bold uppercase tracking-wider">Completeness: {getProfileCompleteness().score}%</span>
                </div>
                
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-300" style={{ width: `${getProfileCompleteness().score}%` }}></div>
                </div>

                {getProfileCompleteness().missing.length > 0 && (
                  <div className="text-[9px] text-amber-400 font-bold bg-transparent">
                    Missing: {getProfileCompleteness().missing.join(', ')}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-transparent text-xs">
                  <div className="flex flex-col bg-transparent">
                    <span className="text-slate-500 text-[9px] uppercase font-bold">Extracted Degree</span>
                    <span className="text-white font-semibold mt-0.5 truncate">{profile.education.degree || 'Waiting...'}</span>
                  </div>
                  <div className="flex flex-col bg-transparent">
                    <span className="text-slate-500 text-[9px] uppercase font-bold">Extracted College</span>
                    <span className="text-white font-semibold mt-0.5 truncate">{profile.education.collegeName || 'Waiting...'}</span>
                  </div>
                  <div className="flex flex-col bg-transparent">
                    <span className="text-slate-500 text-[9px] uppercase font-bold">Target Career Goal</span>
                    <span className="text-white font-semibold mt-0.5 truncate">{profile.selectedCareer || 'Waiting...'}</span>
                  </div>
                  <div className="flex flex-col bg-transparent">
                    <span className="text-slate-500 text-[9px] uppercase font-bold">Parsed Skills</span>
                    <span className="text-neon-blue font-bold mt-0.5 truncate">{profile.skills.length > 0 ? profile.skills.join(', ') : 'Waiting...'}</span>
                  </div>
                </div>
              </div>

              {/* Sample Templates */}
              <div className="w-full flex flex-col gap-2.5 mt-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Or select a quick profile template:</span>
                {[
                  "I'm a sophomore CS student at Stanford. I know Python and Git, and target a Machine Learning Engineer job paying $120k.",
                  "I graduated in Graphic Design from RISD. I build assets in Figma, and want to land a Remote UI/UX Product Designer role.",
                  "I have 2 years of experience as a software developer, using React and Node.js. Looking for a hybrid Software Developer role."
                ].map((txt, i) => (
                  <button
                     key={i}
                     onClick={() => { setInputText(txt); }}
                     className="p-3 text-left rounded-xl border border-white/5 bg-white/5 hover:border-neon-blue/30 text-[11px] text-slate-300 leading-normal transition-all cursor-pointer"
                  >
                    "{txt}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Career Matches & Extracted Profile calibration */}
          {step === 2 && (
            <div className="flex flex-col gap-5 text-left">
              <div className="flex flex-col gap-1 bg-transparent">
                <span className="text-[10px] text-neon-cyan font-bold uppercase tracking-wider">Calibration Matrix</span>
                <h3 className="text-lg font-bold text-white m-0 tracking-tight">Select Career & Review Profile</h3>
              </div>

              {/* Extracted Profile Details Cards */}
              <div className="p-4 rounded-2xl border border-white/10 bg-navy-dark/40 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Auto-Extracted Credentials</span>
                  <span className="text-[10px] text-neon-blue font-bold uppercase tracking-wider">Completeness: {getProfileCompleteness().score}%</span>
                </div>
                
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-300" style={{ width: `${getProfileCompleteness().score}%` }}></div>
                </div>

                {getProfileCompleteness().missing.length > 0 && (
                  <div className="text-[9px] text-amber-400 font-bold bg-transparent">
                    Missing: {getProfileCompleteness().missing.join(', ')}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-transparent text-xs">
                  <div className="flex flex-col bg-transparent">
                    <span className="text-slate-500 text-[9px] uppercase font-bold">Extracted Degree</span>
                    <span className="text-white font-semibold mt-0.5 truncate">{profile.education.degree || 'Waiting...'}</span>
                  </div>
                  <div className="flex flex-col bg-transparent">
                    <span className="text-slate-500 text-[9px] uppercase font-bold">Extracted College</span>
                    <span className="text-white font-semibold mt-0.5 truncate">{profile.education.collegeName || 'Waiting...'}</span>
                  </div>
                  <div className="flex flex-col bg-transparent">
                    <span className="text-slate-500 text-[9px] uppercase font-bold">Current status</span>
                    <span className="text-white font-semibold mt-0.5">{profile.status || 'Graduate'}</span>
                  </div>
                  <div className="flex flex-col bg-transparent">
                    <span className="text-slate-500 text-[9px] uppercase font-bold">Parsed Skills</span>
                    <span className="text-neon-blue font-bold mt-0.5 truncate">{profile.skills.length > 0 ? profile.skills.join(', ') : 'Waiting...'}</span>
                  </div>
                </div>
              </div>

              {/* Career Selection Section */}
              <div className="flex flex-col gap-3 bg-transparent">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Select Your Specific Career Path</span>
                {interviewConfidence < 80 ? (
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-xs leading-normal">
                    ⚠️ The AI is still analyzing your background details. Recommendation confidence is at <strong>{interviewConfidence || 0}%</strong>. Please continue chatting on the left panel until confidence is &ge; <strong>80%</strong> to unlock career matches.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 bg-transparent">
                    {suggestedCareers.map(career => {
                      const active = profile.selectedCareer === career.careerName;

                      const formatSalary = (sal: any) => {
                        if (!sal || sal.min === undefined) return '';
                        const formatNum = (num: number) => {
                          if (num >= 1000) {
                            return `${Math.round(num / 1000)}k`;
                          }
                          if (num > 0 && num < 1000) {
                            return `${num}k`;
                          }
                          return num.toString();
                        };
                        const sym = sal.currency && sal.currency !== 'USD' ? sal.currency : '$';
                        return `${sym}${formatNum(sal.min)} - ${sym}${formatNum(sal.max)}`;
                      };

                      const salaryText = formatSalary(career.estimatedSalary);
                      const subtitleText = salaryText
                        ? `${salaryText} • ${career.growthTrend || 'Stable growth'}`
                        : (career.growthTrend || 'Stable growth');

                      return (
                        <div
                          key={career.careerName}
                          onClick={() => handleSelectCareer(career.careerName)}
                          className={`p-4 rounded-xl border text-left flex flex-col justify-start transition-all cursor-pointer ${active
                              ? 'border-neon-cyan bg-neon-cyan/5 text-white'
                              : 'border-white/5 bg-navy-dark/20 hover:border-white/15 text-slate-300'
                            }`}
                        >
                          <div className="w-full flex justify-between items-center bg-transparent">
                            <div className="flex flex-col text-left bg-transparent">
                              <span className="text-xs font-bold">{career.careerName}</span>
                              <span className="text-[10px] text-slate-500 mt-0.5">{subtitleText}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-transparent">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedCareer(prev => prev === career.careerName ? null : career.careerName);
                                }}
                                className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-cyan/50 text-[9px] font-bold text-neon-cyan transition-all cursor-pointer"
                              >
                                {expandedCareer === career.careerName ? 'Show less' : 'Learn more'}
                              </button>
                              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${active ? 'text-neon-cyan translate-x-1' : 'text-slate-500'}`} />
                            </div>
                          </div>

                          {expandedCareer === career.careerName && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="w-full mt-3 p-4 rounded-lg bg-navy-dark/80 border border-white/5 text-[11px] text-slate-300 flex flex-col gap-3"
                            >
                              {career.shortDescription && (
                                <div>
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Description</span>
                                  <p className="m-0 mt-0.5 leading-relaxed text-slate-350">{career.shortDescription}</p>
                                </div>
                              )}

                              {career.whyItMatches && (
                                <div>
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Why It Matches</span>
                                  <p className="m-0 mt-0.5 leading-relaxed text-slate-350">{career.whyItMatches}</p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-3 bg-transparent">
                                <div className="bg-transparent">
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Difficulty</span>
                                  <span className="font-semibold text-slate-200 mt-0.5 block">{career.difficulty || 'Medium'}</span>
                                </div>
                                <div className="bg-transparent">
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Time to Ready</span>
                                  <span className="font-semibold text-slate-200 mt-0.5 block">{career.estimatedTimeToReadyMonths ? `${career.estimatedTimeToReadyMonths} months` : 'N/A'}</span>
                                </div>
                              </div>

                              {career.requiredSkills && career.requiredSkills.length > 0 && (
                                <div>
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Required Skills</span>
                                  <div className="flex flex-wrap gap-1.5 mt-1 bg-transparent">
                                    {career.requiredSkills.map((sk: string) => (
                                      <span key={sk} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-semibold text-slate-300">
                                        {sk}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {career.missingSkills && career.missingSkills.length > 0 && (
                                <div>
                                  <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block">Missing Skills</span>
                                  <div className="flex flex-wrap gap-1.5 mt-1 bg-transparent">
                                    {career.missingSkills.map((sk: string) => (
                                      <span key={sk} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-semibold text-amber-300">
                                        {sk}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Commitment Calibration & Missing Details */}
          {step === 3 && (
            <div className="flex flex-col gap-5 text-left">
              <div className="flex flex-col gap-1 bg-transparent">
                <span className="text-[10px] text-neon-purple font-bold uppercase tracking-wider">Calibration Matrix</span>
                <h3 className="text-lg font-bold text-white m-0 tracking-tight">Time Commitment & Details</h3>
              </div>

              {/* Commitment Config */}
              <div className="p-5 border border-white/10 bg-navy-dark/30 rounded-2xl flex flex-col gap-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-transparent">
                  <div className="flex flex-col gap-1.5 bg-transparent">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Expected Salary ($ / Year)</label>
                    <input
                      type="text"
                      value={profile.expectedSalary}
                      onChange={(e) => updateProfile({ expectedSalary: e.target.value })}
                      placeholder="e.g. 95,000"
                      className="px-4 py-3 bg-navy-dark/60 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-neon-blue/60 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 bg-transparent">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Target Country</label>
                    <input
                      type="text"
                      value={profile.country}
                      onChange={(e) => updateProfile({ country: e.target.value })}
                      placeholder="e.g. United States"
                      className="px-4 py-3 bg-navy-dark/60 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-neon-blue/60 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 bg-transparent">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Hours per Day</label>
                    <select
                      value={profile.timeAvailability.hoursPerDay}
                      onChange={(e) => updateNestedProfile('timeAvailability', { hoursPerDay: e.target.value })}
                      className="px-4 py-3 bg-navy-dark/60 border border-white/10 rounded-xl text-slate-200 focus:outline-none text-sm"
                    >
                      {['2', '3', '4', '6', '8'].map(h => (
                        <option key={h} value={h} className="bg-navy-dark">{h} Hours / Day</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 bg-transparent">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Days per Week</label>
                    <select
                      value={profile.timeAvailability.daysPerWeek}
                      onChange={(e) => updateNestedProfile('timeAvailability', { daysPerWeek: e.target.value })}
                      className="px-4 py-3 bg-navy-dark/60 border border-white/10 rounded-xl text-slate-200 focus:outline-none text-sm"
                    >
                      {['4', '5', '6', '7'].map(d => (
                        <option key={d} value={d} className="bg-navy-dark">{d} Days / Week</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 bg-transparent mt-2 border-t border-white/5 pt-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Commitment Diagnostics</span>
                  <div className="flex justify-between items-center text-xs bg-transparent">
                    <span className="text-slate-400">Total study allocation:</span>
                    <span className="text-neon-cyan font-bold">{totalHours} Hours</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmCommitment}
                  className="py-3 bg-neon-purple text-white hover:scale-102 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 mt-3"
                >
                  Confirm Commitment & Next <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            </div>
          )}

          {/* STEP 4: ATS Resume scan experience */}
          {step === 4 && (
            <div className="flex flex-col gap-5 text-left">
              <div className="flex flex-col gap-1 bg-transparent">
                <span className="text-[10px] text-neon-pink font-bold uppercase tracking-wider">Calibration Matrix</span>
                <h3 className="text-lg font-bold text-white m-0 tracking-tight">Resume Optimization Screen</h3>
              </div>

              {!resumeUploaded && !atsScoring && (
                <div className="flex flex-col gap-4">
                  {/* Drop zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDropFile}
                    className="p-8 border-2 border-dashed border-white/10 hover:border-neon-blue/30 bg-navy-dark/30 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer relative"
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-10 h-10 text-slate-500 animate-pulse" />
                    <div className="flex flex-col gap-1 bg-transparent">
                      <span className="text-xs font-bold text-white">Drag & Drop Resume PDF</span>
                      <span className="text-[9px] text-slate-500">Supports PDF, DOCX up to 5MB</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-500 font-bold uppercase">Or generate template</div>

                  <button
                    onClick={handleGenerateTemplate}
                    className="py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-neon-blue/30 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-neon-blue" /> Generate Custom Template
                  </button>
                </div>
              )}

              {/* Analyzing Loader stages */}
              {atsScoring && (
                <div className="p-6 border border-white/10 bg-navy-dark/30 rounded-2xl flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-transparent">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">ATS Scanners Active</span>
                    <span className="text-xs font-bold text-neon-blue">{resumeProgress}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-500" style={{ width: `${resumeProgress}%` }}></div>
                  </div>

                  {/* Scanning Checklist steps */}
                  <div className="flex flex-col gap-2.5 mt-2 bg-transparent text-xs">
                    {[
                      { key: 'uploading', label: 'Uploading Resume Document' },
                      { key: 'reading', label: 'Reading Document Syntax' },
                      { key: 'ats', label: 'Running ATS Layout Compliance' },
                      { key: 'skills', label: 'Extracting Keywords & Competencies' },
                      { key: 'gaps', label: 'Conducting Skill Gap Analysis' }
                    ].map((st) => {
                      const stages = ['idle', 'uploading', 'reading', 'ats', 'skills', 'gaps', 'done'];
                      const currentIdx = stages.indexOf(resumeStage);
                      const stepIdx = stages.indexOf(st.key);
                      const isComplete = currentIdx > stepIdx;
                      const isActive = currentIdx === stepIdx;

                      return (
                        <div key={st.key} className="flex justify-between items-center bg-transparent py-0.5">
                          <span className={`${isComplete ? 'text-slate-400' : isActive ? 'text-neon-cyan font-bold' : 'text-slate-600'}`}>{st.label}</span>
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${isComplete ? 'bg-emerald-500/10 text-emerald-400' : isActive ? 'bg-neon-cyan/20 text-neon-cyan animate-pulse' : 'bg-white/5 text-transparent'
                            }`}>✓</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Complete results */}
              {resumeUploaded && !atsScoring && (
                <div className="flex flex-col gap-4">

                  {/* Scored Card */}
                  <div className="p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl flex justify-between items-center">
                    <div className="flex flex-col text-left bg-transparent">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ATS MATCH SCORE</span>
                      <span className="text-base font-extrabold text-white mt-1 truncate">{uploadedFileName}</span>
                    </div>
                    <span className="text-3xl font-black text-emerald-400">{profile.resume.atsScore}%</span>
                  </div>

                  {/* Recommendations */}
                  <div className="p-5 border border-white/10 bg-navy-dark/30 rounded-2xl flex flex-col gap-3">
                    <span className="text-xs font-bold text-white border-b border-white/5 pb-1">Parsed Audit Recommendations</span>
                    <div className="flex flex-col gap-2 bg-transparent text-xs">
                      <div className="flex gap-2 items-start bg-transparent">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></span>
                        <p className="text-slate-400 leading-normal m-0">Detected {profile.skills.length} target keywords aligned to {profile.selectedCareer}.</p>
                      </div>
                      <div className="flex gap-2 items-start bg-transparent">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5"></span>
                        <p className="text-slate-400 leading-normal m-0">Recommended: Include cloud certificates to increase compatibility.</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Finalize */}
                  <button
                    onClick={handleFinalizeOnboarding}
                    disabled={isProcessing}
                    className="py-4 bg-gradient-to-r from-neon-blue to-neon-purple hover:scale-102 text-white font-extrabold rounded-xl transition-all cursor-pointer border-0 shadow-lg shadow-neon-blue/15 mt-3 flex items-center justify-center gap-1.5"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <BookmarkCheck className="w-5 h-5" /> Activate Career Operating System
                      </>
                    )}
                  </button>

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
