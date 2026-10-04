import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Calendar,
  Users,
  IndianRupee,
  MapPin,
  Compass,
  X,
  Search,
  RefreshCw,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';

const POPULAR_SUGGESTIONS = [
  'Goa',
  'Hyderabad',
  'Paris',
  'Dubai',
  'Singapore',
  'Bangalore',
  'Tokyo',
  'London'
];

const RECENT_SEARCHES = [
  '4 days in Goa with beaches under ₹25,000',
  'Weekend luxury escape to Dubai for 2',
  '3 days culture and dining in Paris'
];

const HeroSearch = () => {
  const navigate = useNavigate();
  const { parseQuery, generateTrip, isGenerating } = useTrip();

  const [nlQuery, setNlQuery] = useState('4 days from Hyderabad under ₹25,000 for 2 people with beach and adventure');
  const [isStructuredMode, setIsStructuredMode] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Structured form inputs
  const [origin, setOrigin] = useState('Hyderabad');
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(4);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(25000);
  const [styles, setStyles] = useState(['beach', 'adventure']);

  const availableStyles = [
    { id: 'beach', label: '🏖 Beach' },
    { id: 'adventure', label: '🏄 Adventure' },
    { id: 'food', label: '🍜 Local Food' },
    { id: 'culture', label: '🏛 Culture & Forts' },
    { id: 'relaxation', label: '💆 Relaxation' },
    { id: 'nightlife', label: '🍸 Nightlife' }
  ];

  const toggleStyle = (styleId) => {
    setStyles(prev =>
      prev.includes(styleId) ? prev.filter(s => s !== styleId) : [...prev, styleId]
    );
  };

  const handleNaturalLanguageSubmit = async (e) => {
    e?.preventDefault();
    if (!nlQuery.trim() || loadingSearch) return;

    setLoadingSearch(true);
    try {
      // 1. AI Parsing
      const parsed = await parseQuery(nlQuery);

      // 2. Trip generation
      const trip = await generateTrip({
        origin: parsed.origin || 'Hyderabad',
        destination: parsed.destination || 'Goa',
        durationDays: parsed.duration || 4,
        travelers: parsed.travelers || 2,
        budget: parsed.budget || 25000,
        preferences: parsed.preferences?.length > 0 ? parsed.preferences : ['beach', 'adventure']
      });

      const tripId = trip?._id || trip?.id;
      if (tripId) {
        navigate(`/trip/${tripId}`);
      }
    } catch (err) {
      console.error('Trip generation error:', err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleStructuredSubmit = async (e) => {
    e?.preventDefault();
    if (loadingSearch) return;

    setLoadingSearch(true);
    try {
      const trip = await generateTrip({
        origin: origin || 'Hyderabad',
        destination: destination.trim() || 'Anywhere',
        durationDays: Number(durationDays),
        travelers: Number(travelers),
        budget: Number(budget),
        preferences: styles
      });

      const tripId = trip?._id || trip?.id;
      if (tripId) {
        navigate(`/trip/${tripId}`);
      }
    } catch (err) {
      console.error('Trip generation error:', err);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-between mb-2.5 px-2">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/80 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.07] backdrop-blur-md">
          <button
            type="button"
            onClick={() => setIsStructuredMode(false)}
            className={`px-3.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              !isStructuredMode
                ? 'bg-gradient-to-r from-violet-600 via-rose-600 to-amber-500 text-white shadow-md shadow-violet-600/25 font-black'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Natural Language</span>
          </button>
          <button
            type="button"
            onClick={() => setIsStructuredMode(true)}
            className={`px-3.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isStructuredMode
                ? 'bg-gradient-to-r from-violet-600 via-rose-600 to-amber-500 text-white shadow-md shadow-violet-600/25 font-black'
                : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-500 dark:text-amber-400 hidden sm:flex">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Real flights, stays & routes</span>
        </div>
      </div>

      {/* Large Floating Search Card */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-white/[0.09] transition-all hover:border-violet-500/40">
        {!isStructuredMode ? (
          /* Natural Language Search Input */
          <form onSubmit={handleNaturalLanguageSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Where are you going?</span>
                </span>
                {nlQuery && (
                  <button
                    type="button"
                    onClick={() => setNlQuery('')}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="relative flex items-center group">
                <input
                  type="text"
                  id="natural-language-travel-input"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  placeholder="e.g. 4 days from Hyderabad to Goa under ₹25,000 with beaches..."
                  className="w-full pl-5 pr-36 py-4 rounded-2xl bg-white dark:bg-[#090611] text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-semibold shadow-inner transition-all"
                />
                
                <button
                  type="submit"
                  disabled={loadingSearch || isGenerating}
                  id="discover-my-trip-btn"
                  className="absolute right-2 px-4 sm:px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-violet-600 via-rose-600 to-amber-500 hover:brightness-110 text-white shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                >
                  {loadingSearch || isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Planning...</span>
                    </>
                  ) : (
                    <>
                      <span>Explore with AI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Popular Suggestions & Recent Searches */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
                  <TrendingUp className="w-3 h-3 text-brand-teal-500" />
                  Popular:
                </span>
                {POPULAR_SUGGESTIONS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setNlQuery(`4 days trip to ${city} with top attractions and dining`)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-brand-teal-600 dark:hover:text-brand-teal-400 hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200/50 dark:border-white/[0.05] transition-colors whitespace-nowrap font-medium"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          /* Structured Filter Grid */
          <form onSubmit={handleStructuredSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Origin */}
              <div className="p-3 rounded-2xl bg-white dark:bg-brand-navy-900/90 border border-slate-200 dark:border-white/[0.08]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Origin (From)</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-teal-500" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="p-3 rounded-2xl bg-white dark:bg-brand-navy-900/90 border border-slate-200 dark:border-white/[0.08]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Destination (To)</label>
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-brand-sky-400" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Paris, Goa, Dubai"
                    className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="p-3 rounded-2xl bg-white dark:bg-brand-navy-900/90 border border-slate-200 dark:border-white/[0.08]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Duration</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent-warm" />
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value={3} className="dark:bg-brand-navy-900">3 Days (Weekend)</option>
                    <option value={4} className="dark:bg-brand-navy-900">4 Days (Standard)</option>
                    <option value={5} className="dark:bg-brand-navy-900">5 Days (Extended)</option>
                    <option value={7} className="dark:bg-brand-navy-900">7 Days (Week)</option>
                  </select>
                </div>
              </div>

              {/* Budget */}
              <div className="p-3 rounded-2xl bg-white dark:bg-brand-navy-900/90 border border-slate-200 dark:border-white/[0.08]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Budget (INR)</label>
                <div className="flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                  <input
                    type="number"
                    step="1000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Travel Style Badges & Submit */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-bold uppercase mr-1">Style:</span>
                {availableStyles.map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => toggleStyle(st.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      styles.includes(st.id)
                        ? 'bg-brand-teal-500 text-brand-navy-950 shadow-sm'
                        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loadingSearch || isGenerating}
                className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-violet-600 via-rose-600 to-amber-500 hover:brightness-110 text-white shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {loadingSearch || isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Planning...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Journey</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HeroSearch;
