import React, { useMemo } from 'react';
import { MapPin, Utensils, Compass, Navigation, Star, ExternalLink } from 'lucide-react';
import { calculateDistance, formatDistance } from '../../utils/geoUtils';

export default function NearbyPlacesList({
  referencePlace,
  places = [],
  onSelectPlace,
  onGetDirections
}) {
  // Calculate distances and sort
  const nearbyPlaces = useMemo(() => {
    if (!referencePlace?.latitude || !referencePlace?.longitude) {
      return [];
    }
    return places
      .filter(p => p && p.latitude && p.longitude && p.id !== referencePlace.id)
      .map(p => {
        const distKm = calculateDistance(
          referencePlace.latitude,
          referencePlace.longitude,
          p.latitude,
          p.longitude
        );
        return {
          ...p,
          distanceKm: distKm,
          distanceFormatted: formatDistance(distKm)
        };
      })
      .filter(p => p.distanceKm !== null && p.distanceKm <= 25) // within 25km
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6);
  }, [referencePlace, places]);

  if (!referencePlace || !referencePlace.latitude || !referencePlace.longitude) {
    return null;
  }

  if (nearbyPlaces.length === 0) return null;

  return (
    <div className="mt-6 p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Nearby around {referencePlace.name}</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real distance calculated from verified coordinates
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          {nearbyPlaces.length} locations
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {nearbyPlaces.map(place => (
          <div
            key={place.id}
            className="group p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {place.name}
                </span>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-md whitespace-nowrap">
                  {place.distanceFormatted}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="capitalize">{place.category || 'Attraction'}</span>
                {place.rating && (
                  <span className="flex items-center gap-0.5 font-bold text-amber-500">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{place.rating}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={() => onSelectPlace && onSelectPlace(place)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 shadow-sm transition-all"
              >
                View on Map
              </button>
              {onGetDirections && (
                <button
                  onClick={() => onGetDirections(place)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all"
                  title="Directions"
                >
                  <Navigation className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
