import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/useAuth';
import { 
  Compass, 
  Map, 
  FileText, 
  Award, 
  Calendar, 
  Activity, 
  ArrowRight, 
  BrainCircuit, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setPage } = useApp();
  const { startDemoSession } = useAuth();

  const handleTryDemo = () => {
    startDemoSession();
    setPage('dashboard');
  };

  const features = [
    {
      icon: <Compass className="w-6 h-6 text-neon-blue" />,
      title: 'Career Discovery',
      description: 'Find your true calling through interests, preferences, and salary targets powered by AI.'
    },
    {
      icon: <Map className="w-6 h-6 text-neon-purple" />,
      title: 'Roadmap Generator',
      description: 'Get a personalized step-by-step learning timeline calibrated to your weekly availability.'
    },
    {
      icon: <FileText className="w-6 h-6 text-neon-pink" />,
      title: 'Resume Analyzer',
      description: 'Get instant ATS scoring, strengths, weaknesses, and a list of missing skills to optimize.'
    },
    {
      icon: <Award className="w-6 h-6 text-neon-cyan" />,
      title: 'Interview Preparation',
      description: 'Practice with mock interview questions generated specifically for your target career.'
    },
    {
      icon: <Calendar className="w-6 h-6 text-neon-blue" />,
      title: 'Weekly Planner',
      description: 'Stay on track with structured study goals, specific hours per day, and status monitoring.'
    },
    {
      icon: <Activity className="w-6 h-6 text-neon-purple" />,
      title: 'Progress Tracking',
      description: 'Visualize your streak, completed certifications, projects, and next milestone alerts.'
    }
  ];

  return (
    <div className="min-height-screen bg-navy-bg bg-grid-pattern relative flex flex-col justify-between overflow-x-hidden">
      {/* Background Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-neon-blue/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-neon-purple/10 blur-[150px] pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center shadow-lg shadow-neon-blue/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-neon-blue bg-clip-text text-transparent">
            CareerPilot <span className="text-neon-cyan">AI</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleTryDemo}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/30 text-emerald-400 hover:text-white hover:bg-emerald-500/10 transition-all cursor-pointer"
          >
            ✨ Try Demo
          </button>
          <button 
            onClick={() => setPage('login')} 
            className="px-5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Sign In
          </button>
          <button 
            onClick={() => setPage('onboarding')} 
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/20 hover:shadow-neon-purple/30 hover:scale-105 transition-all"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        <div className="flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-white/10 text-xs font-semibold text-neon-cyan w-fit tracking-wide animate-pulse-glow">
            <Sparkles className="w-3.5 h-3.5" />
            NEXT-GEN CAREER TRANSFORMATION
          </div>
          
          <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-white m-0">
            Navigate Your Future with <br />
            <span className="bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple bg-clip-text text-transparent text-glow-blue">
              CareerPilot AI
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 font-normal leading-relaxed max-w-lg m-0">
            Your Personal AI Career Mentor. We help students and professionals discover high-paying jobs, build custom study roadmaps, optimize resumes, and master mock interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <button 
              onClick={() => setPage('onboarding')} 
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-neon-blue to-neon-purple text-white flex items-center justify-center gap-2 shadow-xl shadow-neon-blue/15 hover:shadow-neon-purple/25 hover:scale-105 transition-all cursor-pointer group"
            >
              Start Free Mentor Flow
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setPage('login')} 
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold glass-card border border-white/10 text-white flex items-center justify-center gap-2 hover:bg-white/10 hover:border-neon-cyan/40 transition-all cursor-pointer"
            >
              Sign In to Dashboard
            </button>
            <div className="flex flex-col items-center w-full sm:w-auto">
              <button 
                onClick={handleTryDemo} 
                className="w-full px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/15 hover:shadow-teal-500/25 hover:scale-105 transition-all cursor-pointer border border-emerald-400/20 active:scale-[0.98]"
              >
                ✨ Try Demo
              </button>
              <span className="text-[10px] text-emerald-400 mt-1.5 font-medium tracking-wide uppercase">No registration required</span>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6 border-t border-white/5 pt-6">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">98%</span>
              <span className="text-xs text-slate-500">ATS Optimization Rate</span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">10K+</span>
              <span className="text-xs text-slate-500">Roadmaps Generated</span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">4.9/5</span>
              <span className="text-xs text-slate-500">Mentor Rating</span>
            </div>
          </div>
        </div>

        {/* AI Assistant Illustration */}
        <div className="flex justify-center items-center relative lg:pl-10">
          <div className="absolute w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-neon-blue/20 to-neon-purple/20 blur-[60px] animate-spin-slow"></div>
          
          {/* Glassmorphic SVG Illustration */}
          <div className="relative glass-card border-white/10 w-full max-w-[450px] h-[450px] rounded-3xl flex items-center justify-center shadow-2xl p-6 overflow-hidden animate-float">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-2xl"></div>

            <svg viewBox="0 0 400 400" className="w-full h-full max-w-[320px] max-h-[320px]" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer Glow Ring */}
              <circle cx="200" cy="200" r="140" stroke="url(#cyanPurpleGrad)" strokeWidth="2" strokeDasharray="5 5" opacity="0.3" />
              
              {/* Mid Ring */}
              <circle cx="200" cy="200" r="110" stroke="url(#blueGrad)" strokeWidth="1.5" opacity="0.4" />
              
              {/* Outer Orbit Dots */}
              <circle cx="200" cy="60" r="6" fill="#00f0ff" className="animate-pulse" />
              <circle cx="90" cy="200" r="4" fill="#bc34fa" />
              <circle cx="310" cy="200" r="5" fill="#00f5ff" />
              <circle cx="200" cy="340" r="6" fill="#ff007f" />
              
              {/* Brain Circuit Pathways */}
              <path d="M150 160C150 140 180 130 200 130C220 130 250 140 250 160C250 180 220 200 200 200C180 200 150 220 150 240C150 260 180 270 200 270" stroke="url(#cyanPurpleGrad)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
              <path d="M200 130V270" stroke="#00f5ff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              
              {/* Glowing Center Hub */}
              <g filter="url(#glow)">
                <circle cx="200" cy="200" r="45" fill="#0A0E1A" stroke="url(#cyanPurpleGrad)" strokeWidth="3" />
                <circle cx="200" cy="200" r="30" fill="url(#coreGrad)" opacity="0.8" />
                <circle cx="200" cy="200" r="15" fill="#ffffff" className="animate-pulse" />
              </g>
              
              {/* Floating tech nodes */}
              <circle cx="150" cy="160" r="8" fill="#0A0E1A" stroke="#00f0ff" strokeWidth="2" />
              <circle cx="250" cy="160" r="8" fill="#0A0E1A" stroke="#bc34fa" strokeWidth="2" />
              <circle cx="150" cy="240" r="8" fill="#0A0E1A" stroke="#bc34fa" strokeWidth="2" />
              
              <defs>
                <linearGradient id="cyanPurpleGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#bc34fa" />
                </linearGradient>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#00f5ff" />
                </linearGradient>
                <linearGradient id="coreGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#bc34fa" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
            </svg>

            {/* Float Card Stats Overlay */}
            <div className="absolute bottom-6 right-6 glass-card border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-xl text-left scale-90 sm:scale-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">MOCK INTERVIEW SCORER</span>
                <span className="text-xs font-bold text-emerald-400">92% AI Readiness Score</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid Section */}
      <section className="bg-navy-dark border-t border-white/5 py-20 px-6 md:px-12 z-10 relative">
        <div className="max-w-7xl mx-auto text-center flex flex-col gap-12">
          <div className="flex flex-col gap-3 max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white m-0">
              Supercharge Your Professional Journey
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed m-0">
              Everything you need to pilot your career from discovery to preparation and real-time planning, built with advanced AI modules.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass-card glass-card-hover p-6 rounded-2xl text-left flex flex-col gap-4 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-display font-semibold text-lg text-white m-0">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed m-0">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 md:px-12 text-center text-slate-500 text-xs z-10 bg-navy-bg">
        <p className="m-0">&copy; {new Date().getFullYear()} CareerPilot AI. Powered by Advanced Agentic Mentorship. All rights reserved.</p>
      </footer>
    </div>
  );
};
