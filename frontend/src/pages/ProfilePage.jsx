import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Settings, Bookmark, History, Sparkles, Check, ArrowRight, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { formatCurrency } from '../utils/formatters';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updatePreferences } = useAuth();
  const { savedTrips, currentTrip } = useTrip();

  const [travelStyles, setTravelStyles] = useState(
    user?.preferences?.travelStyle || ['beach', 'adventure', 'food']
  );
  const [hotelPref, setHotelPref] = useState(user?.preferences?.hotelPreference || 'boutique');
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'INR');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Dynamic greeting based on current local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const allStyles = [
    'beach', 'adventure', 'culture', 'food', 'nature', 'nightlife', 'relaxation', 'luxury'
  ];

  const toggleStyle = (st) => {
    setTravelStyles(prev =>
      prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]
    );
  };

  const handleSavePreferences = async () => {
    try {
      await updatePreferences({
        travelStyle: travelStyles,
        hotelPreference: hotelPref,
        currency
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const userName = user?.name || 'Traveler';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Dynamic Header Greeting (Prompt Section 37) */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-violet-500 to-brand-teal-500 text-white flex items-center justify-center font-display font-extrabold text-2xl shadow-lg shadow-brand-teal-500/20">
            {userName.charAt(0)}
          </div>
          <div>
            <span className="text-xs font-bold text-brand-teal-500 uppercase tracking-wider">
              Traveler Profile & Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
              {getGreeting()}, {userName.split(' ')[0]}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.email || 'demo@trippilot.ai'} • Verified TripPilot Account
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-brand-navy-900 border border-slate-200/80 dark:border-slate-800 text-center min-w-[100px]">
            <span className="text-xl font-extrabold font-display text-brand-teal-500 block">
              {savedTrips.length}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">Saved Trips</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-brand-navy-900 border border-slate-200/80 dark:border-slate-800 text-center min-w-[100px]">
            <span className="text-xl font-extrabold font-display text-brand-sky-400 block">
              {travelStyles.length}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">Active Styles</span>
          </div>
        </div>
      </div>

      {/* Grid: Active Trip & Travel Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Trip / Continue Planning (Section 37) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                Continue Planning
              </h3>
              <span className="text-xs text-brand-teal-500 font-semibold">In Progress</span>
            </div>

            {currentTrip ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-navy-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold font-display text-base text-slate-900 dark:text-white">
                      {currentTrip.destination}
                    </h4>
                    <p className="text-xs text-slate-400">
                      From {currentTrip.origin} • {currentTrip.dates?.durationDays} Days
                    </p>
                  </div>
                  <span className="text-xs font-bold text-brand-teal-500 bg-brand-teal-500/10 px-2 py-0.5 rounded-full">
                    {currentTrip.score?.totalScore}% Match
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    Est: {formatCurrency(currentTrip.budgetBreakdown?.estimatedTotal || currentTrip.budget)}
                  </span>
                  <Link
                    to={`/trip/${currentTrip.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-teal-500 hover:underline"
                  >
                    <span>Resume Trip</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 mb-3">No trip currently in progress.</p>
                <Link
                  to="/"
                  className="px-4 py-2 rounded-xl bg-brand-teal-500 text-brand-navy-950 font-bold text-xs shadow-md shadow-brand-teal-500/20"
                >
                  Create a Plan
                </Link>
              </div>
            )}
          </div>

          {/* Recent Searches Replay (Section 51) */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-brand-teal-500" />
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                Recent Searches
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Hyderabad to Goa • 4 days • Beach + Adventure', query: '4 days from Hyderabad under 25000 with beach' },
                { label: 'Hyderabad to Jaipur • 3 days • Culture', query: '3 days from Hyderabad to Jaipur under 20000' }
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-brand-navy-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                >
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                  <Link
                    to={`/`}
                    className="text-brand-teal-500 hover:underline font-bold"
                  >
                    Repeat
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Travel Preferences Customizer (Section 50) */}
        <div className="lg:col-span-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Settings className="w-4 h-4 text-brand-violet-500" />
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                  Traveler Preferences
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                These preferences directly influence your deterministic TripPilot Match score calculations.
              </p>
            </div>

            {/* Travel Style Badges */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Preferred Travel Styles
              </label>
              <div className="flex flex-wrap gap-2">
                {allStyles.map(st => (
                  <button
                    key={st}
                    onClick={() => toggleStyle(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                      travelStyles.includes(st)
                        ? 'bg-brand-teal-500 text-brand-navy-950 font-bold shadow-sm'
                        : 'bg-slate-100 dark:bg-brand-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {st} {travelStyles.includes(st) && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Accommodation Tier */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Accommodation Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['budget', 'boutique', 'luxury'].map(tier => (
                  <button
                    key={tier}
                    onClick={() => setHotelPref(tier)}
                    className={`p-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                      hotelPref === tier
                        ? 'bg-brand-teal-500/10 border-brand-teal-500 text-brand-teal-600 dark:text-brand-teal-400'
                        : 'bg-white dark:bg-brand-navy-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Preferences updated successfully!
                </span>
              ) : <div />}

              <button
                onClick={handleSavePreferences}
                className="px-5 py-2.5 rounded-xl bg-brand-navy-900 dark:bg-white text-white dark:text-brand-navy-950 font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
