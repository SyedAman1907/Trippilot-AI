import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Calendar, Users, IndianRupee, Trash2, ArrowRight, Compass } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import { useTrip } from '../context/TripContext';
import { formatCurrency, formatDateRange } from '../utils/formatters';

const SavedTripsPage = () => {
  const navigate = useNavigate();
  const { savedTrips, fetchSavedTrips, removeSavedTrip, setCurrentTrip } = useTrip();

  useEffect(() => {
    fetchSavedTrips();
  }, []);

  const handleOpenTrip = (trip) => {
    setCurrentTrip(trip);
    navigate(`/trip/${trip.id || trip._id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-400 text-xs font-semibold mb-2">
          <Bookmark className="w-3.5 h-3.5" />
          <span>Personal Travel Vault</span>
        </div>
        <h2 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">
          Saved Trip Itineraries
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review, reopen, or manage your custom travel plans anytime.
        </p>
      </div>

      {savedTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTrips.map((trip, idx) => {
            const dest = trip.destination || 'Custom Trip';
            const cost = trip.budgetBreakdown?.estimatedTotal || trip.budget || 25000;
            const score = trip.score?.totalScore || 92;
            const days = trip.dates?.durationDays || 4;

            return (
              <div
                key={idx}
                className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-teal-500/15 text-brand-teal-600 dark:text-brand-teal-400">
                      {score}% Match
                    </span>
                    <button
                      onClick={() => removeSavedTrip(trip.id || trip._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Remove Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                    {dest}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {trip.origin ? `From ${trip.origin}` : 'Custom Origin'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-sky-400" />
                      {days} Days
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-brand-violet-500" />
                      {trip.travelers ? `${trip.travelers} ${trip.travelers === 1 ? 'Traveler' : 'Travelers'}` : 'Travelers'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Cost</span>
                    <span className="text-base font-bold font-display text-brand-teal-500">
                      {formatCurrency(cost)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenTrip(trip)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-navy-900 dark:bg-white text-white dark:text-brand-navy-950 font-bold text-xs hover:opacity-90 transition-opacity"
                  >
                    <span>Open Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Saved Trips Yet"
          message="When you discover or customize a trip you love, hit 'Save Trip' to keep it here!"
          actionText="Plan Your First Journey"
          onAction={() => navigate('/')}
        />
      )}
    </div>
  );
};

export default SavedTripsPage;
