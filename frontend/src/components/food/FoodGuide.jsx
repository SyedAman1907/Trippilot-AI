import React, { useState } from 'react';
import { Utensils, Star, MapPin, ExternalLink, Flame, Clock, Sparkles } from 'lucide-react';

export default function FoodGuide({ foodDishes = [], destination = '', onViewOnMap = null }) {
  const [selectedDishIndex, setSelectedDishIndex] = useState(0);

  if (!foodDishes || foodDishes.length === 0) return null;

  const currentDish = foodDishes[selectedDishIndex] || foodDishes[0];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-luxury-light-accent dark:text-luxury-dark-accent uppercase tracking-wider flex items-center gap-1">
              <Utensils className="w-4 h-4" />
              Culinary Intelligence
            </span>
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
            Taste the Destination: Famous Local Dishes
          </h3>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          {foodDishes.length} regional specialties curated for {destination}
        </span>
      </div>

      {/* Dish Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {foodDishes.map((dish, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDishIndex(idx)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedDishIndex === idx
                ? 'bg-luxury-light-accent text-white shadow-md shadow-luxury-light-accent/20 scale-105'
                : 'bg-white/80 dark:bg-luxury-dark-elevated/70 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{dish.name.split('(')[0]}</span>
            <span className="text-[10px] opacity-80">· {dish.bestMeal}</span>
          </button>
        ))}
      </div>

      {/* Featured Dish Detail Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 rounded-2xl bg-gradient-to-r from-luxury-light-secondary to-white dark:from-luxury-dark-secondary dark:to-luxury-dark-surface border border-slate-200/60 dark:border-slate-800">
        {/* Dish Image */}
        <div className="lg:col-span-4 relative h-52 lg:h-auto rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <img
            src={currentDish.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'}
            alt={currentDish.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase">
            {currentDish.cuisine}
          </div>
        </div>

        {/* Dish Details */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                {currentDish.dietary}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <Flame className="w-3 h-3" />
                {currentDish.spiceLevel}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Clock className="w-3 h-3" />
                Best for {currentDish.bestMeal}
              </span>
            </div>

            <h4 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {currentDish.name}
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {currentDish.description}
            </p>

            {/* Ingredients Tags */}
            {currentDish.ingredients && currentDish.ingredients.length > 0 && (
              <div className="mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Typical Ingredients
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentDish.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-white/80 dark:bg-luxury-dark-elevated text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Real Restaurants serving this dish */}
      {currentDish.recommendedRestaurants && currentDish.recommendedRestaurants.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-luxury-light-accent dark:text-luxury-dark-accent" />
              Where to Try {currentDish.name.split('(')[0]}
            </span>
            <span className="text-[10px] text-slate-400">Verified dining spots</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentDish.recommendedRestaurants.map((restaurant, rIdx) => (
              <div
                key={rIdx}
                className="p-3.5 rounded-2xl bg-white/80 dark:bg-luxury-dark-elevated/70 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 hover:border-luxury-light-accent/40 transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {restaurant.name}
                    </h5>
                    {restaurant.rating && (
                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {restaurant.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    <MapPin className="w-3 h-3 inline mr-1 text-slate-400" />
                    {restaurant.address}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {typeof onViewOnMap === 'function' && (restaurant.latitude || restaurant.lat) && (
                    <button
                      type="button"
                      onClick={() => onViewOnMap(restaurant)}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
                    >
                      View on Map
                    </button>
                  )}

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + destination)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl bg-luxury-light-accent/10 hover:bg-luxury-light-accent/20 text-luxury-light-accent dark:text-luxury-dark-accent transition-all"
                    title="View Restaurant"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
