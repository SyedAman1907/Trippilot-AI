import React from 'react';
import { Star, MapPin, ExternalLink, Compass } from 'lucide-react';
import { CATEGORY_CONFIG } from '../../utils/geoUtils';

const PlaceCard = ({ place, onViewOnMap = null, onGetDirections = null }) => {
  if (!place) return null;

  const {
    name,
    address,
    rating,
    reviews,
    reviewsCount,
    category,
    categoryLabel,
    type,
    thumbnail,
    photoUrl,
    description,
    latitude,
    longitude
  } = place;

  const displayImage = thumbnail || photoUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
  const displayRating = rating || 4.5;
  const displayReviews = reviewsCount || reviews || 120;
  const rawCatKey = (type || category || 'attraction').toLowerCase();
  const catConfig = CATEGORY_CONFIG[rawCatKey] || CATEGORY_CONFIG.attraction;
  const displayCategory = categoryLabel || catConfig.label || type || category || 'Attraction';

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-md hover:shadow-2xl hover:border-violet-500/40 transition-all flex flex-col justify-between group">
      <div>
        <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-[#090611]">
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          {/* Top category badge */}
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[10px] font-bold border border-white/20 uppercase tracking-wider shadow-md flex items-center gap-1"
            style={{ backgroundColor: catConfig.color || '#7C3AED' }}
          >
            <span>{catConfig.emoji}</span>
            <span>{displayCategory}</span>
          </div>

          {/* Rating badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/10">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{typeof displayRating === 'number' ? displayRating.toFixed(1) : displayRating}</span>
            <span className="text-[10px] text-zinc-300 font-normal">({displayReviews})</span>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <h4 className="font-bold font-display text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
            {name}
          </h4>

          {address && (
            <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-start gap-1.5 line-clamp-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{address}</span>
            </p>
          )}

          {description && (
            <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
        {latitude && longitude ? (
          <button
            type="button"
            onClick={() => {
              if (typeof onViewOnMap === 'function') onViewOnMap(place);
            }}

            className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-violet-500/10 hover:bg-gradient-to-r hover:from-violet-600 hover:to-rose-600 text-violet-600 dark:text-violet-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>View on Map</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 italic">Coordinates unavailable</span>
        )}

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}${latitude && longitude ? `+${latitude},${longitude}` : ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
          title="Open in Google Maps"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export default PlaceCard;
