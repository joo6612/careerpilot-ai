import React from 'react';
import { useApp } from '../context/AppContext';
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

  const features = [
    {
      icon: <Compass className="w-6 h-6 text-dark-cyan" />,
      title: 'Career Description Hub',
      description: 'Discover target careers matched to your actual tech skills, live vacancies, and curated learning guides.'
    },
    {
      icon: <Map className="w-6 h-6 text-golden-orange" />,
      title: 'Auto-Unlocking Roadmaps',
      description: 'Progress through chronological milestones that auto-unlock with actionable hands-on projects.'
    },
    {
      icon: <FileText className="w-6 h-6 text-pearl-aqua" />,
      title: 'Resume ATS Scanner',
      description: 'Instant ATS scoring, keyword gap analysis, and multi-format export to DOCX, HTML, and JSON.'
    },
    {
      icon: <Award className="w-6 h-6 text-burnt-caramel" />,
      title: 'AI Mentorship & TTS',
      description: 'Interactive specialist coaching with real-time speech synthesis read-aloud support.'
    },
    {
      icon: <Calendar className="w-6 h-6 text-dark-cyan" />,
      title: 'Time Commitment Calibration',
      description: 'Tailored study hours per day, customized target salary expectations, and geographic settings.'
    },
    {
      icon: <Activity className="w-6 h-6 text-pearl-aqua" />,
      title: 'Career Vault Document Store',
      description: 'AI auto-categorization for resumes, certificates, and academic documents with verified preview.'
    }
  ];

  return (
    <div className="min-h-screen bg-ink-black bg-grid-pattern relative flex flex-col justify-between overflow-x-hidden text-vanilla-custard">
      {/* Background Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-dark-cyan/15 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-golden-orange/15 blur-[150px] pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass-card border-b border-pearl-aqua/10 py-3 sm:py-4 px-4 sm:px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setPage('landing')}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-dark-cyan via-pearl-aqua to-golden-orange flex items-center justify-center shadow-lg shadow-dark-cyan/20">
            <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-ink-black" />
          </div>
          <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-white">
            CareerPilot <span className="text-pearl-aqua">AI</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setPage('login')} 
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-vanilla-custard hover:text-white hover:bg-dark-teal/30 transition-all border border-pearl-aqua/20 cursor-pointer"
          >
            Sign In
          </button>
          <button 
            onClick={() => setPage('login')} 
            className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-dark-cyan via-golden-orange to-burnt-caramel text-ink-black shadow-lg shadow-dark-cyan/20 hover:scale-105 transition-all cursor-pointer border-0"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center z-10">
        <div className="flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-pearl-aqua/20 text-xs font-bold text-pearl-aqua w-fit tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-golden-orange" />
            AI-POWERED CAREER OPERATING SYSTEM
          </div>
          
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-white m-0">
            Navigate Your Future with <br />
            <span className="bg-gradient-to-r from-dark-cyan via-pearl-aqua to-golden-orange bg-clip-text text-transparent">
              CareerPilot AI
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-vanilla-custard/90 font-normal leading-relaxed max-w-lg m-0">
            Your Personal AI Career Operating System. Discover high-demand engineering tracks, build tailored milestone roadmaps, verify ATS resumes, and accelerate your professional readiness.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <button 
              onClick={() => setPage('login')} 
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm bg-gradient-to-r from-dark-cyan via-golden-orange to-burnt-caramel text-ink-black flex items-center justify-center gap-2 shadow-xl shadow-dark-cyan/20 hover:scale-105 transition-all cursor-pointer group border-0"
            >
              Start Free Assessment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setPage('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm glass-card border border-pearl-aqua/30 text-vanilla-custard hover:text-white hover:bg-dark-teal/40 transition-all cursor-pointer"
            >
              Sign In to Account
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-xs text-pearl-aqua/80">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-pearl-aqua" />
              <span>Strict Firebase Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-golden-orange" />
              <span>Gemini Multi-Tier Routing</span>
            </div>
          </div>
        </div>

        {/* Hero Preview Card */}
        <div className="relative flex justify-center items-center">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 border border-pearl-aqua/20 shadow-2xl relative text-left">
            <div className="flex justify-between items-center border-b border-pearl-aqua/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rusty-spice"></span>
                <span className="w-3 h-3 rounded-full bg-golden-orange"></span>
                <span className="w-3 h-3 rounded-full bg-pearl-aqua"></span>
              </div>
              <span className="text-[10px] font-mono text-pearl-aqua/70">careerpilot-os v2.4</span>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-dark-teal/20 border border-pearl-aqua/15">
                <span className="text-[9px] text-golden-orange font-bold uppercase block">Calibrated Goal</span>
                <span className="text-sm font-extrabold text-white mt-0.5 block">AI / Machine Learning Engineer</span>
                <span className="text-[10px] text-pearl-aqua mt-1 block">14,800+ Active Roles • +28% YoY Growth</span>
              </div>

              <div className="p-4 rounded-2xl bg-ink-black/60 border border-pearl-aqua/15 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-pearl-aqua font-bold uppercase">ATS Verification</span>
                  <span className="text-xs font-bold text-white block mt-0.5">Resume Score: 84%</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-pearl-aqua/20 text-pearl-aqua font-black text-xs">PASSED</span>
              </div>

              <div className="p-4 rounded-2xl bg-dark-teal/30 border border-pearl-aqua/15">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-vanilla-custard font-bold uppercase">Roadmap Progress</span>
                  <span className="text-xs font-extrabold text-golden-orange">Stage 2 Unlocked</span>
                </div>
                <div className="h-1.5 w-full bg-ink-black/80 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-dark-cyan to-golden-orange w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 sm:py-16 z-10 w-full">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Full-Stack Career Acceleration</h2>
          <p className="text-xs text-pearl-aqua/80 mt-1">Everything you need to master modern technical tracks from day one.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="glass-card p-6 rounded-2xl border border-pearl-aqua/15 hover:border-dark-cyan transition-all flex flex-col gap-3 group"
            >
              <div className="w-12 h-12 rounded-xl bg-dark-teal/40 flex items-center justify-center shrink-0 border border-pearl-aqua/20">
                {feat.icon}
              </div>
              <h3 className="font-display font-extrabold text-base text-white group-hover:text-pearl-aqua transition-colors m-0">
                {feat.title}
              </h3>
              <p className="text-xs text-vanilla-custard/80 leading-relaxed m-0">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pearl-aqua/10 py-6 px-6 md:px-12 text-center text-xs text-pearl-aqua/60 z-10">
        © 2026 CareerPilot AI Operating System. Strict Authentication & Multi-Model Gemini Orchestration.
      </footer>
    </div>
  );
};

export default LandingPage;
