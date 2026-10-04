import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Compass, Bug, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useTrip } from '../../context/TripContext';

export default function RouteDebugger() {
  const location = useLocation();
  const params = useParams();
  const { currentTrip } = useTrip();
  const [minimized, setMinimized] = useState(true);

  // Only render in development mode
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return null;

  const tripId = params.tripId || currentTrip?._id || currentTrip?.id || null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-teal-400 border border-teal-500/30 text-[10px] font-mono shadow-2xl backdrop-blur-md hover:bg-slate-800 transition-all"
        >
          <Bug className="w-3 h-3 text-teal-400" />
          <span>Route: {location.pathname}</span>
        </button>
      ) : (
        <div className="w-80 p-4 rounded-2xl bg-slate-950/95 text-slate-200 border border-teal-500/40 shadow-2xl backdrop-blur-xl text-xs font-mono space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-teal-400 font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>TripPilot Route Debugger</span>
            </div>
            <button
              onClick={() => setMinimized(true)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Path:</span>
              <span className="font-bold text-teal-300 truncate max-w-[180px]">{location.pathname}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Trip ID:</span>
              <span className="text-slate-200 truncate max-w-[180px]">{tripId || 'None'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Router:</span>
              <span className="text-emerald-400">BrowserRouter</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Trip Loaded:</span>
              <span className={currentTrip ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {currentTrip ? 'YES ✓' : 'NO ✕'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
