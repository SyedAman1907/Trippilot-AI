import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Sparkles } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="p-4 rounded-3xl bg-violet-500/10 text-violet-400 mb-4 animate-bounce border border-violet-500/20">
        <Compass className="w-12 h-12 text-amber-400" />
      </div>
      <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
        404 • Destination Unknown
      </span>
      <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white mb-2">
        Lost in Navigation
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
        The coordinates or journey you're looking for don't exist in our flight plan.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
        >
          <Home className="w-4 h-4" />
          <span>Go Home</span>
        </Link>
        <Link
          to="/plan"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl btn-luxury-primary font-bold text-xs shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all text-white"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>✦ Plan a New Trip</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
