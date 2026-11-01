import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Sparkles, 
  Cpu, 
  Map, 
  FileBadge, 
  FolderGit2, 
  FileText, 
  X,
  CornerDownLeft
} from 'lucide-react';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  category: 'Career' | 'Skill' | 'Roadmap' | 'Certificate' | 'Project' | 'Document';
  description?: string;
  actionTab: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const { profile, roadmap, setDashboardTab } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC and Arrow Key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(filteredResults.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredResults.length) % Math.max(filteredResults.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelect(filteredResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Compile all search resources
  const searchPool: SearchResult[] = [];

  // 1. Careers
  const careers = ['AI Engineer', 'Machine Learning Engineer', 'Software Developer', 'UI/UX Product Designer', 'Clinical Research Scientist', 'Civil Engineer', 'Mechanical Engineer'];
  careers.forEach(c => {
    searchPool.push({
      id: `career-${c}`,
      title: c,
      category: 'Career',
      description: 'Explore matching indices and compensation statistics.',
      actionTab: 'discovery'
    });
  });

  // 2. Skills
  const allSkills = Array.from(new Set([...profile.skills, 'Python', 'React', 'SQL', 'Git', 'TensorFlow', 'PyTorch', 'Figma', 'AutoCAD', 'Clinical Diagnosis']));
  allSkills.forEach(s => {
    searchPool.push({
      id: `skill-${s}`,
      title: s,
      category: 'Skill',
      description: profile.skills.includes(s) ? 'Verified Skill in your profile.' : 'Skill recommended for your target career.',
      actionTab: 'skills'
    });
  });

  // 3. Roadmaps
  roadmap.forEach((item, idx) => {
    searchPool.push({
      id: `roadmap-${item.id}`,
      title: item.title,
      category: 'Roadmap',
      description: `Milestone ${idx + 1} (${item.duration}) - Status: ${item.status}`,
      actionTab: 'roadmap'
    });
  });

  // 4. Certificates
  profile.certifications.forEach((c, idx) => {
    searchPool.push({
      id: `cert-${idx}`,
      title: c.courseName,
      category: 'Certificate',
      description: `Completed certificate issued by ${c.provider}.`,
      actionTab: 'courses'
    });
  });

  // 5. Projects
  searchPool.push({
    id: 'proj-portfolio',
    title: 'Personal Portfolio Website',
    category: 'Project',
    description: 'Beautiful responsive portfolio website.',
    actionTab: 'projects'
  });

  // 6. Vault Documents
  const vaultDocs = [
    { title: 'Resume_Updated_ATS.pdf', folder: 'Resume' },
    { title: 'Degree_Certificate_Final.pdf', folder: 'Academic Documents' },
    { title: 'Coursera_Deep_Learning.pdf', folder: 'Certificates' },
    { title: 'Offer_Letter_CareerPilot.pdf', folder: 'Offer Letters' }
  ];
  vaultDocs.forEach((doc, idx) => {
    searchPool.push({
      id: `doc-${idx}`,
      title: doc.title,
      category: 'Document',
      description: `Saved under Career Vault &rarr; ${doc.folder}`,
      actionTab: 'vault'
    });
  });

  // Filter pool based on query
  const filteredResults = query.trim() === '' 
    ? searchPool.slice(0, 5) // Show top 5 suggestions initially
    : searchPool.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(query.toLowerCase())) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (item: SearchResult) => {
    setDashboardTab(item.actionTab);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-3 sm:px-4 bg-ink-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-xl glass-card rounded-2xl border border-pearl-aqua/20 overflow-hidden shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[500px]"
      >
        {/* Search Input Area */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-navy-dark/40 relative">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search careers, skills, milestones, certificates..."
            className="w-full bg-transparent border-0 text-white placeholder-slate-500 focus:outline-none text-sm"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border-0 bg-transparent cursor-pointer ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 max-h-[380px] scrollbar-thin">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {query.trim() === '' ? 'Suggested Quick Search' : `Results (${filteredResults.length})`}
          </div>

          {filteredResults.length > 0 ? (
            filteredResults.map((item, idx) => {
              const isActive = idx === selectedIndex;
              let icon = <Sparkles className="w-4 h-4 text-neon-blue" />;
              
              if (item.category === 'Skill') icon = <Cpu className="w-4 h-4 text-neon-cyan" />;
              else if (item.category === 'Roadmap') icon = <Map className="w-4 h-4 text-neon-purple" />;
              else if (item.category === 'Certificate') icon = <FileBadge className="w-4 h-4 text-amber-400" />;
              else if (item.category === 'Project') icon = <FolderGit2 className="w-4 h-4 text-neon-pink" />;
              else if (item.category === 'Document') icon = <FileText className="w-4 h-4 text-emerald-400" />;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-all border border-transparent ${
                    isActive 
                      ? 'bg-neon-blue/15 border-neon-blue/30 text-white' 
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-neon-blue/20' : 'bg-white/5'}`}>
                      {icon}
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-xs font-bold truncate">{item.title}</span>
                      {item.description && (
                        <span className="text-[10px] text-slate-500 truncate mt-0.5" dangerouslySetInnerHTML={{ __html: item.description }}></span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400">
                      {item.category}
                    </span>
                    {isActive && (
                      <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching resources found for "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-navy-dark/60 border-t border-white/5 text-[9px] text-slate-500 hidden sm:flex justify-between items-center">
          <span>Navigate with <kbd className="bg-white/5 px-1 py-0.5 rounded">↑↓</kbd> and <kbd className="bg-white/5 px-1 py-0.5 rounded">Enter</kbd></span>
          <span>Press <kbd className="bg-white/5 px-1 py-0.5 rounded">esc</kbd> to exit</span>
        </div>
      </div>
    </div>
  );
};
