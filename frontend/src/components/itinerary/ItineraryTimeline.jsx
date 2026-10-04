import React, { useState } from 'react';
import { Clock, MapPin, Navigation, IndianRupee, Sparkles, CheckCircle, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const ItineraryTimeline = ({ itinerary = [], onViewOnMap = null }) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  if (!itinerary || itinerary.length === 0) return null;

  const currentDay = itinerary[activeDayIndex] || itinerary[0];

  return (
    <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.08] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider">
              Geospatial Route Optimized
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              Haversine Clustered
            </span>
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Day-by-Day Journey Schedule
          </h3>
        </div>

        {/* Day Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-[#090611] border border-slate-200 dark:border-white/[0.08]">
          {itinerary.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setActiveDayIndex(idx)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeDayIndex === idx
                  ? 'bg-gradient-to-r from-violet-600 via-rose-600 to-amber-500 text-white shadow-md shadow-violet-600/30 font-black scale-105'
                  : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Day {day.day || idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Day Theme Banner (Section 16) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#170A2B] to-[#350A1E] text-white mb-6 border border-violet-500/30 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            {currentDay.theme || 'Exploration & Scenery'}
          </span>
          <h4 className="font-display font-bold text-base sm:text-lg text-white">
            {currentDay.title || `Day ${activeDayIndex + 1}`}
          </h4>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-300 bg-white/10 px-3 py-1 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>{currentDay.activities?.length || 3} stops planned</span>
        </div>
      </div>

      {/* Chronological Timeline (Violet -> Red -> Gold line) */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-violet-600 before:via-rose-600 before:to-amber-500">
        {currentDay.activities?.map((act, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#050505] bg-gradient-to-br from-violet-600 to-amber-400 group-hover:scale-125 transition-transform shadow-sm" />

            {/* Activity Card */}
            <div className="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-white/[0.08] hover:border-violet-500/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    {act.time}
                  </span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    {act.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {act.estimatedDuration}
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(act.estimatedCost)}
                  </span>
                </div>
              </div>

              <h5 className="font-bold font-display text-base text-slate-900 dark:text-white">
                {act.place}
              </h5>
              <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1">
                {act.description}
              </p>

              {/* Transit Details between stops */}
              {act.distanceFromPrevious && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-rose-500" />
                    <span>{act.distanceFromPrevious} from previous location</span>
                    <span>•</span>
                    <span>{act.travelTime}</span>
                  </div>

                  {typeof onViewOnMap === 'function' && (act.latitude || act.lat) && (
                    <button
                      type="button"
                      onClick={() => onViewOnMap({
                        name: act.place,
                        latitude: act.latitude || act.lat,
                        longitude: act.longitude || act.lng,
                        category: 'itinerary',
                        description: act.description
                      })}
                      className="text-amber-500 dark:text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 ml-2 transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>View on Map</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryTimeline;
