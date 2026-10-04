import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Building2, MapPin, MessageSquareText, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTrip } from '../../context/TripContext';

const stepIcons = [
  Compass,
  Plane,
  Building2,
  MapPin,
  Sparkles
];

const LoadingJourney = () => {
  const { loadingStep, searchSteps } = useTrip();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy-950/80 backdrop-blur-md px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glowing background gradient blur */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-brand-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-brand-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-brand-teal-500/10 text-brand-teal-500 dark:text-brand-teal-400 mb-3 animate-bounce">
            <Plane className="w-8 h-8 rotate-[-25deg]" />
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            TripPilot is Crafting Your Journey
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyzing real travel routes, pricing, and live places...
          </p>
        </div>

        {/* Step Items */}
        <div className="space-y-3 relative z-10">
          {searchSteps.map((step, idx) => {
            const Icon = stepIcons[idx] || Sparkles;
            const isCompleted = idx < loadingStep;
            const isCurrent = idx === loadingStep;
            const isPending = idx > loadingStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                  isCurrent
                    ? 'bg-brand-teal-500/10 dark:bg-brand-teal-500/15 text-brand-teal-600 dark:text-brand-teal-300 font-semibold border border-brand-teal-500/30'
                    : isCompleted
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-600 opacity-60'
                }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-brand-teal-500" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse text-brand-teal-500' : ''}`} />
                  )}
                </div>
                <span className="flex-1">{step}</span>
                {isCurrent && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal-500"></span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-brand-teal-500 via-brand-sky-400 to-brand-violet-500 h-full rounded-full"
              initial={{ width: '5%' }}
              animate={{ width: `${Math.min(100, Math.round(((loadingStep + 1) / searchSteps.length) * 100))}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
            <span>Orchestrating live datasets</span>
            <span>{Math.min(100, Math.round(((loadingStep + 1) / searchSteps.length) * 100))}%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingJourney;
