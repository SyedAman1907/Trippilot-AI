import React from 'react';
import { Star, MapPin, Clock, Plus, Tag } from 'lucide-react';

const PlaceCard = ({ place, onAddToTrip = null, onViewOnMap = null }) => {
  if (!place) return null;


  const {
    name = 'Attraction',
    category = 'attraction',
    rating = 4.5,
    reviews = 1200,
    address = 'Central Area',
    thumbnail = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    description = 'Scenic landmark with cultural significance.',
    visitDuration = '2 hours',
    priceLevel = '₹₹'
  } = place;

  return (
    <div className="group rounded-2xl bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="relative h-40 overflow-hidden">
        <img
          src={thumbnail}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-brand-navy-950/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
          {category}
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/90 dark:bg-brand-navy-900/90 text-amber-500 text-xs font-bold">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{rating}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between">
        <div>
          <h4 className="font-bold font-display text-sm text-slate-900 dark:text-white line-clamp-1">
            {name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {description}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{visitDuration}</span>
            <span className="mx-1">•</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">{priceLevel}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {typeof onViewOnMap === 'function' && (place.latitude || place.lat) && (
              <button
                type="button"
                onClick={() => onViewOnMap(place)}
                className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-600 hover:text-white transition-colors"
                title="View on Map"
              >
                <MapPin className="w-4 h-4" />
              </button>
            )}

            {onAddToTrip && (
              <button
                onClick={() => onAddToTrip(place)}
                className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                title="Add to Itinerary"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
