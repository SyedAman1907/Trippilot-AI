import React from 'react';
import { Plane, Clock, ArrowRight, ShieldCheck, ExternalLink, Leaf } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const FlightCard = ({ flight, isSelected = true }) => {
  if (!flight) return null;

  const {
    airline = 'IndiGo',
    flightNumber = '6E-512',
    departure = { time: '08:15 AM', airport: 'HYD', date: '' },
    arrival = { time: '09:40 AM', airport: 'GOI', date: '' },
    duration = '1h 25m',
    stops = 0,
    price = 3250,
    currency = 'INR',
    bookingUrl = 'https://www.google.com/travel/flights',
    carbonEmissions = '62 kg'
  } = flight;

  return (
    <div className={`p-4 md:p-5 rounded-3xl border transition-all ${
      isSelected
        ? 'glass-card border-rose-500/50 shadow-lg shadow-rose-600/10 ring-1 ring-rose-500/30'
        : 'glass-card border-slate-200 dark:border-white/[0.08]'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.08] pb-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-sm">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {airline}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-brand-navy-800 text-slate-500 dark:text-slate-400 font-mono">
                {flightNumber}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {stops === 0 ? 'Non-stop Direct Flight' : `${stops} Stop Flight`}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-slate-400 block">Per Traveler</span>
          <span className="text-lg font-bold font-display text-slate-900 dark:text-white">
            {formatCurrency(price, currency)}
          </span>
        </div>
      </div>

      {/* Flight Timing Matrix */}
      <div className="flex items-center justify-between py-2">
        <div>
          <span className="text-lg font-extrabold font-display text-slate-900 dark:text-white block">
            {departure.time || '08:00 AM'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {departure.airport || 'Origin'}
          </span>
        </div>

        <div className="flex-1 px-4 flex flex-col items-center">
          <span className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration}
          </span>
          <div className="w-full flex items-center gap-1">
            <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
            <Plane className="w-4 h-4 text-brand-teal-500 rotate-90 flex-shrink-0" />
            <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
          <span className="text-[10px] text-brand-teal-500 font-bold mt-1">
            {stops === 0 ? 'Direct' : `${stops} Stop`}
          </span>
        </div>

        <div className="text-right">
          <span className="text-lg font-extrabold font-display text-slate-900 dark:text-white block">
            {arrival.time || '10:15 AM'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {arrival.airport || 'Destination'}
          </span>
        </div>
      </div>

      {/* Footer Features */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Leaf className="w-3.5 h-3.5 text-emerald-500" />
          <span>Carbon emissions: {carbonEmissions}</span>
        </div>

        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal-600 dark:text-brand-teal-400 hover:underline"
        >
          <span>Search provider</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default FlightCard;
