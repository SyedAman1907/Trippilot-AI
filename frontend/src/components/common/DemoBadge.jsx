import React from 'react';
import { Sparkles, Database } from 'lucide-react';
import { useTrip } from '../../context/TripContext';

const DemoBadge = () => {
  const { isDemoMode } = useTrip();

  if (!isDemoMode) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Live SerpApi & Gemini Active</span>
      </div>
    );
  }

  return (
    <div
      title="Running in controlled fallback mode with high-fidelity travel data. Connect SERPAPI_KEY in backend/.env for live Google Travel queries."
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 cursor-help"
    >
      <Database className="w-3.5 h-3.5 animate-pulse" />
      <span>Demo data — connect SerpApi for live travel results</span>
    </div>
  );
};

export default DemoBadge;
