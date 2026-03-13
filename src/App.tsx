/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Documentation } from './pages/Documentation';
import { Changelog } from './pages/Changelog';
import { Settings } from './pages/Settings';
import { Legal, PrivacyPolicyContent, TermsOfServiceContent } from './pages/Legal';
import { Support } from './pages/Support';

const Header = ({ navigate }: { navigate: (page: string) => void }) => (
  <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('dashboard')}>
      <div className="flex size-8 items-center justify-center rounded bg-primary text-black">
        <span className="material-symbols-outlined text-[20px] font-bold">bolt</span>
      </div>
      <h2 className="text-slate-100 text-lg font-semibold tracking-tight">DevPilot</h2>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center gap-6 mr-6">
        <button onClick={() => navigate('documentation')} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Documentation</button>
        <button onClick={() => navigate('changelog')} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Changelog</button>
      </div>
      <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
        <span className="material-symbols-outlined">notifications</span>
      </button>
      <button onClick={() => navigate('settings')} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
        <span className="material-symbols-outlined">settings</span>
      </button>
      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-orange-200 border border-white/10 cursor-pointer" onClick={() => navigate('settings')}></div>
    </div>
  </header>
);

const Hero = () => (
  <div className="flex flex-col items-center text-center mb-10">
    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8">
      What should we automate next?
    </h1>
    <div className="w-full max-w-2xl bg-surface border border-border-subtle rounded-xl shadow-2xl focus-within:border-primary/50 transition-all p-1">
      <div className="flex flex-col md:flex-row items-center gap-1">
        <div className="flex-1 flex items-center px-4 py-3 min-w-0 w-full">
          <span className="material-symbols-outlined text-slate-400 mr-3">search</span>
          <input 
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-base w-full text-slate-100 placeholder:text-slate-500" 
            placeholder="Ask a question with /plan" 
            type="text"
          />
        </div>
        <div className="flex items-center gap-1 p-1 w-full md:w-auto overflow-x-auto whitespace-nowrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-sm">folder</span>
            DevPilot
            <span className="material-symbols-outlined text-xs">expand_more</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-sm">fork_right</span>
            main
            <span className="material-symbols-outlined text-xs">expand_more</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-sm">bolt</span>
            1x
            <span className="material-symbols-outlined text-xs">expand_more</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const Tabs = () => (
  <div className="flex items-center border-b border-border-subtle mb-8 gap-8">
    <button className="pb-4 text-sm font-semibold text-primary border-b-2 border-primary">Tasks</button>
    <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors">Code reviews</button>
    <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors">Archive</button>
  </div>
);

interface TaskProps {
  id?: string;
  key?: React.Key;
  title: string;
  status: string;
  time: string;
  branch: string;
  additions: number;
  deletions: number;
  group?: string;
  onClick?: () => void;
}

const TaskItem = ({ title, status, time, branch, additions, deletions, onClick }: TaskProps) => {
  let statusClasses = "";
  if (status === "MERGED") {
    statusClasses = "bg-purple-500/10 text-purple-400 border-purple-500/20";
  } else if (status === "RUNNING") {
    statusClasses = "bg-primary/10 text-primary border-primary/20";
  } else if (status === "CLOSED") {
    statusClasses = "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }

  return (
    <div onClick={onClick} className="group flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-surface-dark/50 hover:scale-[1.01] hover:shadow-lg hover:z-10 relative transition-all duration-200 border-t border-border-subtle first:border-t-0 cursor-pointer">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-100 group-hover:text-primary transition-colors">{title}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${statusClasses}`}>
            {status}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span>
            {time}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">fork_right</span>
            {branch}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-emerald-500 font-bold">+{additions}</span>
          <span className="text-rose-500 font-bold">-{deletions}</span>
        </div>
        <span className="material-symbols-outlined text-slate-600 group-hover:text-slate-300 transition-colors">chevron_right</span>
      </div>
    </div>
  );
};

const TaskList = ({ onSelectTask }: { onSelectTask: (id: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const allTasks = [
    { id: '1', title: "Fix layout for top matches on mobile", status: "MERGED", time: "2h ago", branch: "DevPilot/main", additions: 52, deletions: 9, group: "Last 7 Days" },
    { id: '2', title: "Refactor authentication middleware", status: "RUNNING", time: "5h ago", branch: "DevPilot/auth-fix", additions: 124, deletions: 31, group: "Last 7 Days" },
    { id: '3', title: "Update dependency: tailwindcss v3.4", status: "MERGED", time: "3d ago", branch: "DevPilot/main", additions: 12, deletions: 12, group: "Last 7 Days" },
    { id: '4', title: "Implement Redis caching for API endpoints", status: "CLOSED", time: "Oct 12, 2023", branch: "DevPilot/cache-layer", additions: 284, deletions: 0, group: "Older" },
    { id: '5', title: "Hotfix: SSL Certificate renewal automation", status: "MERGED", time: "Sep 28, 2023", branch: "DevPilot/main", additions: 45, deletions: 2, group: "Older" },
  ];

  const filteredTasks = allTasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    task.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentTasks = filteredTasks.filter(t => t.group === "Last 7 Days");
  const olderTasks = filteredTasks.filter(t => t.group === "Older");

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
        <input 
          type="text" 
          placeholder="Filter tasks by title or branch..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface/30 border border-border-subtle rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
        />
      </div>

      <div className="space-y-12">
        {recentTasks.length > 0 && (
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.2em] text-slate-500 mb-4 uppercase">Last 7 Days</h3>
            <div className="space-y-px rounded-xl overflow-hidden border border-border-subtle bg-surface/30">
              {recentTasks.map(task => (
                <TaskItem key={task.id} {...task} onClick={() => onSelectTask(task.id)} />
              ))}
            </div>
          </div>
        )}

        {olderTasks.length > 0 && (
          <div>
            <h3 className="text-[11px] font-bold tracking-[0.2em] text-slate-500 mb-4 uppercase">Older</h3>
            <div className="space-y-px rounded-xl overflow-hidden border border-border-subtle bg-surface/30">
              {olderTasks.map(task => (
                <TaskItem key={task.id} {...task} onClick={() => onSelectTask(task.id)} />
              ))}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No tasks found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

const Footer = ({ navigate }: { navigate: (page: string) => void }) => (
  <div className="mt-20 py-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
    <p className="text-xs text-slate-600">© 2026 DevPilot Automation Platform</p>
    <div className="flex gap-6">
      <button onClick={() => navigate('privacy')} className="text-xs text-slate-500 hover:text-primary transition-colors">Privacy Policy</button>
      <button onClick={() => navigate('terms')} className="text-xs text-slate-500 hover:text-primary transition-colors">Terms of Service</button>
      <button onClick={() => navigate('support')} className="text-xs text-slate-500 hover:text-primary transition-colors">Support</button>
    </div>
  </div>
);

const FloatingIndicator = () => (
  <div className="fixed bottom-6 right-6 hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-subtle rounded-full text-[10px] font-bold text-slate-500 tracking-wider">
    <span className="px-1.5 py-0.5 bg-white/5 rounded">⌘</span>
    <span className="px-1.5 py-0.5 bg-white/5 rounded">K</span>
    <span>TO SEARCH</span>
  </div>
);

const TaskDetail = ({ onBack }: { onBack: () => void }) => {
  const [isAgentOpen, setIsAgentOpen] = useState(true);
  const [isBrowserOpen, setIsBrowserOpen] = useState(true);
  const [isCodeOpen, setIsCodeOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-dark text-slate-100 font-display selection:bg-primary/30">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border-dark px-6 py-3 bg-background-dark">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-slate-400 cursor-pointer hover:text-slate-300" onClick={onBack}>
            <span className="material-symbols-outlined text-primary text-xl mr-2">rocket_launch</span>
            <span>Project-X</span>
            <span>/</span>
            <span>Tasks</span>
            <span>/</span>
            <span className="font-semibold text-white">#842</span>
          </div>
          <h1 className="text-base font-bold text-white ml-2">Fix layout for top matches</h1>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-bold tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Running
          </div>
          <div className="h-4 w-px bg-border-dark mx-2"></div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">account_tree</span>
              <span>fix/top-matches-layout</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-dark border border-border-dark text-sm font-semibold hover:bg-surface-dark/80 transition-colors">
            <span className="material-symbols-outlined text-primary text-lg">visibility</span>
            <span>View PR</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-background-dark text-sm font-bold hover:bg-primary/90 transition-colors">
            <span>Approve & Commit</span>
          </button>
          <div className="size-8 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center overflow-hidden">
             <div className="size-full bg-gradient-to-tr from-primary to-orange-200"></div>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: AI Chat */}
        <aside className={`${isAgentOpen ? 'w-80' : 'w-12'} border-r border-border-dark flex flex-col bg-background-dark transition-all duration-300`}>
          <div 
            className="p-4 border-b border-border-dark flex items-center justify-between cursor-pointer hover:bg-surface-dark/50"
            onClick={() => setIsAgentOpen(!isAgentOpen)}
          >
            {isAgentOpen ? (
              <>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Agent Intelligence</span>
                <span className="material-symbols-outlined text-slate-500 text-sm">keyboard_double_arrow_left</span>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full py-3">
                <span className="material-symbols-outlined text-slate-500 text-sm">keyboard_double_arrow_right</span>
                <span className="material-symbols-outlined text-slate-400 text-sm">smart_toy</span>
              </div>
            )}
          </div>
          
          {isAgentOpen && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Message 1 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded bg-primary/20 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">smart_toy</span>
                    </div>
                    <span className="text-xs font-bold">DevPilot</span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-dark border border-border-dark text-sm leading-relaxed text-slate-300">
                    I've detected a layout overflow in the Top Matches list on viewport widths below 375px.
                  </div>
                </div>
                {/* Message 2 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded bg-primary/20 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">smart_toy</span>
                    </div>
                    <span className="text-xs font-bold">DevPilot</span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-dark border border-border-dark text-sm leading-relaxed text-slate-300">
                    Proposing a button-style trigger to save space and shifting to a horizontal scroll layout for cards.
                  </div>
                </div>
                {/* Status Update */}
                <div className="flex items-center gap-3 py-2 px-1">
                  <span className="material-symbols-outlined text-primary animate-pulse">sync</span>
                  <span className="text-xs text-slate-400">Modifying <code className="bg-surface-dark px-1 py-0.5 rounded">MomentsGrid.tsx</code>...</span>
                </div>
              </div>
              <div className="p-4 border-t border-border-dark">
                <div className="relative">
                  <input className="w-full bg-surface-dark border border-border-dark rounded-lg py-2 pl-3 pr-10 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder="Ask the agent..." type="text" />
                  <button className="absolute right-2 top-1.5 text-slate-500 hover:text-primary">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* Center Content Area: Desktop Browser Simulator */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <section className={`${isBrowserOpen ? 'flex-[1.5]' : 'w-12 flex-none'} flex flex-col border-r border-border-dark bg-[#1c140c] transition-all duration-300`}>
            <div 
              className="p-3 flex items-center justify-between border-b border-border-dark bg-background-dark cursor-pointer hover:bg-surface-dark/50"
              onClick={() => setIsBrowserOpen(!isBrowserOpen)}
            >
              {isBrowserOpen ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">desktop_windows</span>
                    <span className="text-xs font-medium text-slate-400">Desktop Browser (1280x800)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="size-2.5 rounded-full bg-red-500/50"></div>
                      <div className="size-2.5 rounded-full bg-yellow-500/50"></div>
                      <div className="size-2.5 rounded-full bg-green-500/50"></div>
                    </div>
                    <span className="material-symbols-outlined text-slate-500 text-sm">keyboard_double_arrow_left</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                  <span className="material-symbols-outlined text-slate-500 text-sm">keyboard_double_arrow_right</span>
                  <span className="material-symbols-outlined text-slate-400 text-sm">desktop_windows</span>
                </div>
              )}
            </div>
            
            {isBrowserOpen && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="bg-surface-dark/40 px-4 py-2 border-b border-border-dark flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="material-symbols-outlined text-sm cursor-pointer hover:text-white">arrow_back</span>
                    <span className="material-symbols-outlined text-sm cursor-pointer hover:text-white">arrow_forward</span>
                    <span className="material-symbols-outlined text-sm cursor-pointer hover:text-white">refresh</span>
                  </div>
                  <div className="flex-1 bg-background-dark/80 rounded px-3 py-1 flex items-center gap-2 border border-border-dark/50">
                    <span className="material-symbols-outlined text-xs text-slate-600">lock</span>
                    <span className="text-[10px] text-slate-400 font-mono">localhost:3000/dashboard/matches</span>
                  </div>
                </div>
                <div className="flex-1 bg-background-dark p-8 overflow-auto relative">
                  {/* Simulated Desktop Web App Content */}
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                      <div className="h-8 w-48 bg-surface-dark rounded"></div>
                      <div className="flex gap-2">
                        <div className="h-8 w-8 bg-surface-dark rounded-full"></div>
                        <div className="h-8 w-24 bg-surface-dark rounded"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                      {/* Target element for overflow detection */}
                      <div className="aspect-video bg-surface-dark rounded-xl border-2 border-primary/50 relative">
                        {/* Gemini Vision Overlay Indicator */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="size-20 rounded-full border border-primary animate-ping opacity-20"></div>
                          <div className="size-14 rounded-full border-2 border-primary/40"></div>
                          <div className="size-4 rounded-full bg-primary/80"></div>
                        </div>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background-dark text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-10">
                          OVERFLOW DETECTED
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 h-3 bg-red-500/20 rounded"></div>
                      </div>
                      <div className="aspect-video bg-surface-dark/50 rounded-xl"></div>
                      <div className="aspect-video bg-surface-dark/50 rounded-xl"></div>
                      <div className="aspect-video bg-surface-dark/50 rounded-xl"></div>
                      <div className="aspect-video bg-surface-dark/50 rounded-xl"></div>
                      <div className="aspect-video bg-surface-dark/50 rounded-xl"></div>
                      <div className="aspect-video bg-surface-dark/50 rounded-xl"></div>
                      <div className="aspect-video bg-surface-dark/50 rounded-xl"></div>
                    </div>
                    <div className="mt-12 space-y-4">
                      <div className="h-4 w-1/3 bg-surface-dark/50 rounded"></div>
                      <div className="h-4 w-full bg-surface-dark/30 rounded"></div>
                      <div className="h-4 w-full bg-surface-dark/30 rounded"></div>
                      <div className="h-4 w-2/3 bg-surface-dark/30 rounded"></div>
                    </div>
                  </div>
                  {/* AI Insight Overlay */}
                  <div className="absolute bottom-6 left-6 max-w-sm bg-primary/10 border border-primary/30 backdrop-blur-md p-4 rounded-lg shadow-2xl z-20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary text-base">visibility</span>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">Vision Analysis</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Element <code className="text-primary bg-primary/5 px-1 rounded">.card-header</code> is clipping outside its parent container in the <code className="text-slate-200">MomentsGrid</code> component at 1280px width.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Code & Diff Panel */}
          <section className={`${isCodeOpen ? 'flex-1' : 'w-12 flex-none'} flex flex-col bg-background-dark transition-all duration-300`}>
            <div 
              className="flex border-b border-border-dark bg-surface-dark/20 cursor-pointer hover:bg-surface-dark/40"
              onClick={() => setIsCodeOpen(!isCodeOpen)}
            >
              {isCodeOpen ? (
                <>
                  <button className="px-6 py-3 text-sm font-bold border-b-2 border-primary text-white">Diff</button>
                  <button className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-white">Logs</button>
                  <button className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-white">Terminal</button>
                  <div className="flex-1 flex justify-end items-center pr-4">
                    <span className="material-symbols-outlined text-slate-500 text-sm">keyboard_double_arrow_right</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full py-3">
                  <span className="material-symbols-outlined text-slate-500 text-sm">keyboard_double_arrow_left</span>
                  <span className="material-symbols-outlined text-slate-400 text-sm">code</span>
                </div>
              )}
            </div>
            
            {isCodeOpen && (
              <>
                <div className="flex-1 overflow-auto p-4 code-font text-xs">
                  <div className="flex items-center gap-2 mb-4 text-slate-500">
                    <span className="material-symbols-outlined text-sm">description</span>
                    <span>components/home/MomentsGrid.tsx</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex hover:bg-white/5 transition-colors group">
                      <span className="w-12 text-right pr-4 text-slate-600 select-none">12</span>
                      <span className="text-slate-300 pl-2">  return (</span>
                    </div>
                    <div className="flex hover:bg-white/5 transition-colors group">
                      <span className="w-12 text-right pr-4 text-slate-600 select-none">13</span>
                      <span className="text-slate-300 pl-2">    &lt;div className="grid grid-cols-2"&gt;</span>
                    </div>
                    <div className="flex bg-red-900/20 border-l-2 border-red-500">
                      <span className="w-12 text-right pr-4 text-red-500/50 select-none">- 14</span>
                      <span className="text-red-200 pl-2 font-medium">      &lt;div className="flex flex-wrap gap-4"&gt;</span>
                    </div>
                    <div className="flex bg-primary/20 border-l-2 border-primary">
                      <span className="w-12 text-right pr-4 text-primary/50 select-none">+ 14</span>
                      <span className="text-slate-100 pl-2 font-medium">      &lt;div className="flex overflow-x-auto gap-4 scrollbar-hide"&gt;</span>
                    </div>
                    <div className="flex hover:bg-white/5 transition-colors group">
                      <span className="w-12 text-right pr-4 text-slate-600 select-none">15</span>
                      <span className="text-slate-300 pl-2">        {'{matches.map(match => ('}</span>
                    </div>
                    <div className="flex hover:bg-white/5 transition-colors group">
                      <span className="w-12 text-right pr-4 text-slate-600 select-none">16</span>
                      <span className="text-slate-300 pl-2">          &lt;MatchCard key={'{match.id}'} data={'{match}'} /&gt;</span>
                    </div>
                    <div className="flex hover:bg-white/5 transition-colors group">
                      <span className="w-12 text-right pr-4 text-slate-600 select-none">17</span>
                      <span className="text-slate-300 pl-2">        {'))}'}</span>
                    </div>
                    <div className="flex hover:bg-white/5 transition-colors group">
                      <span className="w-12 text-right pr-4 text-slate-600 select-none">18</span>
                      <span className="text-slate-300 pl-2">      &lt;/div&gt;</span>
                    </div>
                    <div className="flex bg-primary/20 border-l-2 border-primary">
                      <span className="w-12 text-right pr-4 text-primary/50 select-none">+ 19</span>
                      <span className="text-slate-100 pl-2 font-medium">      &lt;ScrollIndicator active={'{hasScroll}'} /&gt;</span>
                    </div>
                    <div className="flex hover:bg-white/5 transition-colors group">
                      <span className="w-12 text-right pr-4 text-slate-600 select-none">20</span>
                      <span className="text-slate-300 pl-2">    &lt;/div&gt;</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-border-dark flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <div className="flex gap-4">
                    <span>UTF-8</span>
                    <span>TypeScript JSX</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-500">2 insertions(+)</span>
                    <span className="text-red-500">1 deletion(-)</span>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Footer / Global Progress Bar */}
      <footer className="h-1 bg-surface-dark w-full overflow-hidden">
        <div className="h-full bg-primary w-[65%] transition-all duration-1000 ease-in-out"></div>
      </footer>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const navigate = (page: string, taskId?: string) => {
    setCurrentPage(page);
    if (taskId) setSelectedTask(taskId);
  };

  if (currentPage === 'task_detail') {
    return <TaskDetail onBack={() => navigate('dashboard')} />;
  }

  if (currentPage === 'documentation') {
    return <Documentation onBack={() => navigate('dashboard')} />;
  }

  if (currentPage === 'changelog') {
    return <Changelog onBack={() => navigate('dashboard')} />;
  }

  if (currentPage === 'settings') {
    return <Settings onBack={() => navigate('dashboard')} />;
  }

  if (currentPage === 'privacy') {
    return <Legal title="Privacy Policy" lastUpdated="March 11, 2026" content={PrivacyPolicyContent} onBack={() => navigate('dashboard')} />;
  }

  if (currentPage === 'terms') {
    return <Legal title="Terms of Service" lastUpdated="March 11, 2026" content={TermsOfServiceContent} onBack={() => navigate('dashboard')} />;
  }

  if (currentPage === 'support') {
    return <Support onBack={() => navigate('dashboard')} />;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark text-slate-100 font-display">
      <Header navigate={navigate} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <Hero />
        <Tabs />
        <TaskList onSelectTask={(id) => navigate('task_detail', id)} />
        <Footer navigate={navigate} />
      </main>
      <FloatingIndicator />
    </div>
  );
}
