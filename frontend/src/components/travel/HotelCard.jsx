import React from 'react';
import { Star, MapPin, Check, ExternalLink, Building, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const HotelCard = ({
  hotel,
  nights = 3,
  isSelected = false,
  onSelect,
  onViewOnMap = null
}) => {

  if (!hotel) return null;

  const {
    id,
    name = 'Hotel Stay',
    rating,
    reviews,
    price,
    pricePerNight,
    totalPrice,
    currency = 'INR',
    address = 'Central District',
    amenities = [],
    image,
    thumbnail,
    hotelClass,
    propertyType,
    bookingOptions = [],
    bookingUrl,
    source,
    isReal = true
  } = hotel;

  const handleBookClick = (e) => {
    e.stopPropagation();
    if (bookingUrl && /^https?:\/\//i.test(bookingUrl)) {
      window.open(bookingUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const isLive = source === 'serpapi' || isReal;
  const currentPrice = price || pricePerNight;
  const calculatedTotal = totalPrice || (currentPrice ? currentPrice * nights : null);
  const displayImage = thumbnail || image || null;
  const displayType = propertyType || hotelClass || 'Hotel';

  return (
    <div
      onClick={onSelect}
      className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-white dark:bg-[#12091F] border-amber-400 dark:border-amber-400 shadow-xl shadow-amber-500/15 ring-2 ring-amber-400/30'
          : 'glass-card border-slate-200 dark:border-white/[0.08] hover:border-violet-500/40 shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Hotel Thumbnail / Placeholder */}
        <div className="w-full sm:w-44 h-44 rounded-2xl overflow-hidden relative flex-shrink-0 bg-slate-100 dark:bg-brand-navy-800 flex items-center justify-center">
          {displayImage ? (
            <img
              src={displayImage}
              alt={name}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-3 text-slate-400">
              <Building className="w-8 h-8 mb-1 opacity-50" />
              <span className="text-[10px] font-medium">Hotel image unavailable</span>
            </div>
          )}
          
          {/* Hotel Class Badge */}
          {displayType && (
            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-brand-navy-950/85 backdrop-blur-md text-white text-[10px] font-bold tracking-wide shadow-md">
              {displayType}
            </div>
          )}

          {/* Live Data Badge */}
          <div className="absolute bottom-2 left-2">
            {isLive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE GOOGLE HOTELS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
                DEMO DATA
              </span>
            )}
          </div>
        </div>

        {/* Hotel Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-bold font-display text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                  {name}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-coral-500 flex-shrink-0" />
                  <span className="truncate max-w-sm">{address}</span>
                </div>
              </div>

              {/* Rating badge */}
              {rating ? (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
                  {reviews && <span className="text-[10px] text-slate-400 font-normal">({Number(reviews).toLocaleString()})</span>}
                </div>
              ) : (
                <div className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-brand-navy-800 text-[10px] text-slate-400 font-medium">
                  Unrated
                </div>
              )}
            </div>

            {/* Amenities tags */}
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {amenities.slice(0, 4).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-brand-navy-800/80 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                  >
                    <Check className="w-3 h-3 text-brand-teal-500" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Real Booking Options / Providers */}
            {bookingOptions.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-400">Available on:</span>
                <div className="flex flex-wrap gap-1">
                  {bookingOptions.slice(0, 3).map((opt, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-brand-navy-800 text-[10px] font-medium text-brand-teal-600 dark:text-brand-teal-400">
                      {opt.provider}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing & VIEW & BOOK Action Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-1">
                {currentPrice ? (
                  <>
                    <span className="text-base sm:text-lg font-extrabold font-display text-brand-teal-600 dark:text-brand-teal-400">
                      {formatCurrency(currentPrice, currency)}
                    </span>
                    <span className="text-xs text-slate-400">/ night</span>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">Price unavailable</span>
                )}
              </div>
              {calculatedTotal && (
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Est. Total: {formatCurrency(calculatedTotal, currency)} ({nights} nights)
                </span>
              )}
            </div>

            {/* Actions: View on Map & VIEW & BOOK */}
            <div className="flex items-center gap-2">
              {typeof onViewOnMap === 'function' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewOnMap(hotel);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-brand-navy-800 dark:hover:bg-brand-navy-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-brand-teal-500" />
                  <span>View on Map</span>
                </button>
              )}


              {bookingUrl ? (
                <button
                  type="button"
                  onClick={handleBookClick}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-brand-navy-950 shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                >
                  <span>VIEW & BOOK</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-brand-navy-800 text-slate-400 cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <span>Booking link unavailable</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HotelCard;
