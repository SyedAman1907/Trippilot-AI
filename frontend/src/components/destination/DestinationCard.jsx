import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Sparkles, MapPin } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { createSlug } from '../../utils/slugUtils';

const DestinationCard = ({ destination, onSelect }) => {
  const navigate = useNavigate();

  const {
    id = 'dest_goa',
    name = 'Goa',
    country = 'India',
    state = 'Goa',
    tagline = 'Sun-kissed beaches, Portuguese heritage & coastal cuisine',
    heroImage = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    tags = ['beach', 'explore', 'popular'],
    baseFlightCost = 3200,
    baseHotelPerNight = 2800,
    estimatedCost = 23500,
    initialMatchScore = 94,
    rating = 4.8,
    source,
    isReal = true
  } = destination;

  const isLive = source === 'serpapi' || isReal;

  const handleClick = () => {
    if (onSelect) {
      onSelect(destination);
    } else {
      navigate(`/destination/${createSlug(name)}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer rounded-3xl bg-white dark:bg-brand-navy-900/90 border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-lg hover:shadow-2xl hover:border-brand-teal-500/50 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between relative"
    >
      {/* Destination Image Hero */}
      <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-brand-navy-800">
        <img
          src={heroImage}
          alt={name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Layered Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-950/95 via-brand-navy-950/30 to-transparent group-hover:from-brand-navy-950/98 transition-all" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
          {/* Star Rating Badge */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-navy-950/80 backdrop-blur-md text-white border border-white/10 text-xs font-bold shadow-lg">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{rating || 4.8}</span>
          </div>

          {isLive && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-black uppercase tracking-wide shadow-md backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-brand-teal-500/20 to-brand-sky-400/20 backdrop-blur-md text-brand-teal-400 dark:text-brand-teal-300 border border-brand-teal-500/30 text-xs font-black shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal-400" />
          <span>{initialMatchScore || 92}% Match</span>
        </div>

        {/* Location Name & Tagline */}
        <div className="absolute bottom-3.5 left-4 right-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-teal-400 dark:text-brand-teal-300 uppercase tracking-wider mb-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{country || state || 'Global Destination'}</span>
          </div>
          <h4 className="font-extrabold font-display text-2xl text-white tracking-tight">
            {name}
          </h4>
          <span className="text-[11px] font-medium text-slate-300/90 block mt-0.5">
            AI-curated destination
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {tagline}
          </p>

          {/* Style Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-[11px] font-semibold text-slate-600 dark:text-slate-300 capitalize border border-slate-200/50 dark:border-white/[0.05]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing Metrics & Call to Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 block tracking-wider">
              Est. Trip Budget
            </span>
            <span className="text-lg font-black font-display text-brand-teal-600 dark:text-brand-teal-400">
              {formatCurrency(estimatedCost)}
            </span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 group-hover:bg-gradient-to-r group-hover:from-brand-teal-500 group-hover:to-brand-sky-400 group-hover:text-brand-navy-950 font-bold text-xs transition-all">
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
