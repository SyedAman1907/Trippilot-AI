import React, { useState } from 'react';
import { Compass, Sparkles, Building, Info, ShieldCheck, CheckCircle2, DollarSign, Globe, Clock, Bus } from 'lucide-react';

export default function DestinationIntelligence({ destinationData, destinationName = 'Destination' }) {
  const [activeTab, setActiveTab] = useState('first_time');

  if (!destinationData) return null;

  const {
    tagline,
    overview,
    bestTimeToVisit,
    bestAreasToStay = [],
    localCustoms = [],
    practicalInfo = {},
    firstTimeVisitorGuide = {}
  } = destinationData;

  const tabs = [
    { id: 'first_time', label: '✨ First-Time Visitor Guide', icon: Sparkles },
    { id: 'overview', label: 'Overview & Seasons', icon: Compass },
    { id: 'areas', label: 'Where to Stay', icon: Building },
    { id: 'practical', label: 'Practical Info & Customs', icon: Info }
  ];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-luxury-light-primary dark:text-luxury-dark-primary uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-4 h-4" />
              Destination Intelligence
            </span>
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
            {destinationName}: Insider Briefing
          </h3>
          {tagline && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
              "{tagline}"
            </p>
          )}
        </div>

        <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 w-fit">
          Verified Guide
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'btn-luxury-primary text-white shadow-md shadow-violet-500/20 scale-105'
                  : 'bg-white/80 dark:bg-luxury-dark-surface text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: First-Time Visitor Guide */}
      {activeTab === 'first_time' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 via-rose-500/5 to-amber-500/5 border border-violet-500/20">
            <h4 className="text-sm font-bold text-violet-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              First-Timer Essential Checklist
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Visiting {destinationName} for the first time? Here is everything you must see, taste, and experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Must-See Highlights */}
            {firstTimeVisitorGuide.mustSeeHighlights && (
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-luxury-dark-elevated/70 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs font-bold uppercase tracking-wider text-luxury-light-primary dark:text-luxury-dark-primary block mb-2.5">
                  5 Must-See Highlights
                </span>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {firstTimeVisitorGuide.mustSeeHighlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Must-Try Foods & Unmissable Experiences */}
            <div className="space-y-4">
              {firstTimeVisitorGuide.mustTryFoods && (
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-luxury-dark-elevated/70 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-luxury-light-accent dark:text-luxury-dark-accent block mb-2">
                    3 Must-Try Culinary Dishes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {firstTimeVisitorGuide.mustTryFoods.map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl text-xs bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 font-medium"
                      >
                        🍲 {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {firstTimeVisitorGuide.goldenTip && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
                    🌟 Golden Insider Tip
                  </span>
                  <p className="text-xs text-amber-900 dark:text-amber-200 italic leading-relaxed">
                    "{firstTimeVisitorGuide.goldenTip}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Overview & Seasons */}
      {activeTab === 'overview' && (
        <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            {overview}
          </p>

          {bestTimeToVisit && (
            <div className="p-4 rounded-2xl bg-luxury-light-secondary dark:bg-luxury-dark-secondary border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
              <Clock className="w-5 h-5 text-luxury-light-ocean dark:text-luxury-dark-ocean flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Best Time to Visit</span>
                <span>{bestTimeToVisit}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Where to Stay */}
      {activeTab === 'areas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bestAreasToStay.map((area, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/80 dark:bg-luxury-dark-elevated/70 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5"
            >
              <h5 className="font-bold font-display text-sm text-slate-900 dark:text-white">
                {area.area}
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-luxury-light-primary dark:text-luxury-dark-primary">Vibe:</span> {area.vibe}
              </p>
              {area.recommendedFor && (
                <span className="inline-block text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  Recommended for: {area.recommendedFor}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Practical Info & Customs */}
      {activeTab === 'practical' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {practicalInfo.language && (
              <div className="p-3 rounded-2xl bg-white/80 dark:bg-luxury-dark-elevated/70 border border-slate-200/50 dark:border-slate-700/50">
                <Globe className="w-4 h-4 text-teal-500 mb-1" />
                <span className="text-[10px] font-semibold text-slate-400 block">Language</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{practicalInfo.language}</span>
              </div>
            )}

            {practicalInfo.currency && (
              <div className="p-3 rounded-2xl bg-white/80 dark:bg-luxury-dark-elevated/70 border border-slate-200/50 dark:border-slate-700/50">
                <DollarSign className="w-4 h-4 text-emerald-500 mb-1" />
                <span className="text-[10px] font-semibold text-slate-400 block">Currency</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{practicalInfo.currency}</span>
              </div>
            )}

            {practicalInfo.transport && (
              <div className="p-3 rounded-2xl bg-white/80 dark:bg-luxury-dark-elevated/70 border border-slate-200/50 dark:border-slate-700/50">
                <Bus className="w-4 h-4 text-indigo-500 mb-1" />
                <span className="text-[10px] font-semibold text-slate-400 block">Getting Around</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{practicalInfo.transport}</span>
              </div>
            )}
          </div>

          {/* Local Customs */}
          {localCustoms.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-luxury-dark-elevated/70 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Local Customs & Etiquette
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {localCustoms.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-luxury-light-primary dark:text-luxury-dark-primary flex-shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
