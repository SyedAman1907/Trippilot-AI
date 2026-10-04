import React from 'react';
import { Sparkles, Check, Clock, IndianRupee, Star, Plane, Building2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CompareTable = ({ destinations = [] }) => {
  if (!destinations || destinations.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto">
      <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden min-w-[700px]">
        {/* Table Header with Destination Preview Cards */}
        <div className="grid grid-cols-4 bg-slate-100/70 dark:bg-brand-navy-900/80 border-b border-slate-200 dark:border-slate-800 p-4 font-display">
          <div className="flex items-center text-sm font-bold text-slate-500 dark:text-slate-400">
            Factual Comparison Matrix
          </div>
          {destinations.map((dest, idx) => (
            <div key={idx} className="px-3 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden mb-2 shadow-md">
                <img src={dest.heroImage} alt={dest.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">{dest.name}</h4>
              <span className="text-[11px] text-slate-400">{dest.state}</span>
            </div>
          ))}
        </div>

        {/* Row 1: TripPilot Match */}
        <div className="grid grid-cols-4 p-4 border-b border-slate-100 dark:border-slate-800/60 items-center">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-teal-500" />
            <span>TripPilot Match</span>
          </div>
          {destinations.map((dest, idx) => (
            <div key={idx} className="text-center font-bold text-base text-brand-teal-500">
              {dest.initialMatchScore || 92}%
            </div>
          ))}
        </div>

        {/* Row 2: Estimated Total Cost */}
        <div className="grid grid-cols-4 p-4 border-b border-slate-100 dark:border-slate-800/60 items-center bg-slate-50/50 dark:bg-brand-navy-950/30">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-emerald-500" />
            <span>Estimated Cost (4 Days)</span>
          </div>
          {destinations.map((dest, idx) => (
            <div key={idx} className="text-center font-bold text-base text-slate-900 dark:text-white">
              {formatCurrency(dest.estimatedCost || 24000)}
            </div>
          ))}
        </div>

        {/* Row 3: Flight Cost */}
        <div className="grid grid-cols-4 p-4 border-b border-slate-100 dark:border-slate-800/60 items-center">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Plane className="w-4 h-4 text-brand-sky-400" />
            <span>Flight (One Way)</span>
          </div>
          {destinations.map((dest, idx) => (
            <div key={idx} className="text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
              {formatCurrency(dest.baseFlightCost)}
            </div>
          ))}
        </div>

        {/* Row 4: Hotel Rate */}
        <div className="grid grid-cols-4 p-4 border-b border-slate-100 dark:border-slate-800/60 items-center bg-slate-50/50 dark:bg-brand-navy-950/30">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-brand-violet-500" />
            <span>Boutique Hotel / Night</span>
          </div>
          {destinations.map((dest, idx) => (
            <div key={idx} className="text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
              {formatCurrency(dest.baseHotelPerNight)}
            </div>
          ))}
        </div>

        {/* Row 5: Flight Duration */}
        <div className="grid grid-cols-4 p-4 border-b border-slate-100 dark:border-slate-800/60 items-center">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Flight Duration</span>
          </div>
          {destinations.map((dest, idx) => (
            <div key={idx} className="text-center text-xs text-slate-600 dark:text-slate-400">
              {dest.name === 'Goa' ? '1h 25m (Direct)' : dest.name === 'Jaipur' ? '2h 10m (Direct)' : '1h 45m (Direct)'}
            </div>
          ))}
        </div>

        {/* Row 6: Weather & Season */}
        <div className="grid grid-cols-4 p-4 items-center bg-slate-50/50 dark:bg-brand-navy-950/30">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Weather & Prime Season
          </div>
          {destinations.map((dest, idx) => (
            <div key={idx} className="text-center text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold block">{dest.weather?.temperature || '28°C'}</span>
              <span className="text-[11px] text-slate-400">{dest.weather?.bestSeason || 'Oct – Mar'}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CompareTable;
