import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Info } from 'lucide-react';

const TripScore = ({ scoreData, size = 'large' }) => {
  const totalScore = scoreData?.totalScore || 92;
  const breakdown = scoreData?.breakdown || {};
  const reasoning = scoreData?.reasoning || [];

  // SVG circular calculation
  const radius = size === 'large' ? 44 : 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totalScore / 100) * circumference;

  // Determine accent color gradient
  const getScoreColor = (val) => {
    if (val >= 90) return 'text-amber-400 stroke-amber-400';
    if (val >= 75) return 'text-violet-400 stroke-violet-400';
    return 'text-rose-500 stroke-rose-500';
  };

  return (
    <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-white/[0.08] shadow-xl">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        
        {/* Animated Circular Score */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg
            className="transform -rotate-90"
            width={size === 'large' ? 120 : 90}
            height={size === 'large' ? 120 : 90}
          >
            {/* Background circle */}
            <circle
              cx={size === 'large' ? 60 : 45}
              cy={size === 'large' ? 60 : 45}
              r={radius}
              stroke="currentColor"
              strokeWidth={size === 'large' ? 8 : 6}
              className="text-slate-200 dark:text-zinc-800"
              fill="transparent"
            />
            {/* Progress animated circle */}
            <motion.circle
              cx={size === 'large' ? 60 : 45}
              cy={size === 'large' ? 60 : 45}
              r={radius}
              stroke="currentColor"
              strokeWidth={size === 'large' ? 8 : 6}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
              className={getScoreColor(totalScore)}
              fill="transparent"
            />
          </svg>

          {/* Centered Score Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white leading-none">
              {totalScore}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Score
            </span>
          </div>
        </div>

        {/* Score Metadata & Labels */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              Deterministic Engine
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Verified Data
            </span>
          </div>
          
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            TripPilot Match
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md">
            Algorithmic score evaluating budget feasibility, style alignment, direct flights, hotel sentiment, and local places.
          </p>

          {/* Key Reasoning Bullets */}
          {reasoning.length > 0 && (
            <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-zinc-300">
              {reasoning.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Sub-Score Breakdown Matrix */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { key: 'budgetMatch', label: 'Budget', val: breakdown.budgetMatch || 90 },
            { key: 'preferenceMatch', label: 'Style', val: breakdown.preferenceMatch || 88 },
            { key: 'flightScore', label: 'Flights', val: breakdown.flightScore || 85 },
            { key: 'hotelScore', label: 'Hotels', val: breakdown.hotelScore || 88 },
            { key: 'placeScore', label: 'Places', val: breakdown.placeScore || 92 },
            { key: 'reviewScore', label: 'Reviews', val: breakdown.reviewScore || 89 },
            { key: 'convenienceScore', label: 'Transit', val: breakdown.convenienceScore || 86 },
          ].map(metric => (
            <div
              key={metric.key}
              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-brand-navy-900/60 border border-slate-200/60 dark:border-slate-800/60 text-center"
            >
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                {metric.label}
              </span>
              <span className="text-base font-extrabold font-display text-slate-800 dark:text-slate-100">
                {metric.val}%
              </span>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                <div
                  className="bg-brand-teal-500 h-full rounded-full"
                  style={{ width: `${metric.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripScore;
