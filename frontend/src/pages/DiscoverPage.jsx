import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Compass,
  Search,
  MapPin,
  Sparkles,
  Utensils,
  Hotel,
  Coffee,
  ShoppingBag,
  ShoppingCart,
  Building2,
  Trees,
  HeartPulse,
  Plane,
  Train,
  Star,
  Navigation,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Eye,
  Layers,
  Clock
} from 'lucide-react';
import LeafletTripMap, { CATEGORY_CONFIG } from '../components/maps/LeafletTripMap';
import DestinationCard from '../components/destination/DestinationCard';
import EmptyState from '../components/common/EmptyState';
import { geocodeLocation } from '../services/maps/osmGeocodingService';
import { fetchNearbyPlaces } from '../services/maps/osmPlacesService';
import api from '../services/api';

const QUICK_DESTINATIONS = [
  'Hyderabad',
  'Goa',
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Paris',
  'Dubai',
  'Singapore',
  'London',
  'Tokyo'
];

const DISCOVER_CATEGORIES = [
  { id: 'all', label: 'All', icon: Layers, emoji: '📍' },
  { id: 'attraction', label: 'Attractions', icon: Star, emoji: '⭐' },
  { id: 'restaurant', label: 'Restaurants', icon: Utensils, emoji: '🍴' },
  { id: 'cafe', label: 'Cafes', icon: Coffee, emoji: '☕' },
  { id: 'mall', label: 'Shopping Malls', icon: Building2, emoji: '🏬' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, emoji: '🛍️' },
  { id: 'supermarket', label: 'Supermarkets', icon: ShoppingCart, emoji: '🛒' },
  { id: 'hotel', label: 'Hotels', icon: Hotel, emoji: '🏨' },
  { id: 'park', label: 'Parks', icon: Trees, emoji: '🌳' },
  { id: 'hospital', label: 'Hospitals', icon: HeartPulse, emoji: '🏥' },
  { id: 'airport', label: 'Airports', icon: Plane, emoji: '✈️' },
  { id: 'transportation', label: 'Transit', icon: Train, emoji: '🚆' }
];

export default function DiscoverPage() {
  // Destination & Geocoding State
  const [destinationInput, setDestinationInput] = useState('Hyderabad');
  const [activeDestination, setActiveDestination] = useState('Hyderabad');
  const [destinationGeo, setDestinationGeo] = useState({
    name: 'Hyderabad',
    lat: 17.3850,
    lng: 78.4867
  });

  // Places & Category State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placeError, setPlaceError] = useState('');
  const [selectedMapPlace, setSelectedMapPlace] = useState(null);

  // Search filter inside discovered list
  const [placeFilterQuery, setPlaceFilterQuery] = useState('');

  // Curated Destinations
  const [curatedDestinations, setCuratedDestinations] = useState([]);

  // Stale request guard
  const requestSeqRef = useRef(0);

  // 1. Geocode & Discover Destination
  const handleSelectDestination = useCallback(async (destName, categoryOverride = null) => {
    if (!destName || !destName.trim()) return;

    const query = destName.trim();
    const catToUse = categoryOverride || selectedCategory;
    const currentSeq = ++requestSeqRef.current;

    setActiveDestination(query);
    setLoadingPlaces(true);
    setPlaceError('');
    setSelectedMapPlace(null);
    setPlaces([]); // Clear stale markers immediately

    try {
      // Real OpenStreetMap Nominatim Geocoding
      const geo = await geocodeLocation(query);
      if (currentSeq !== requestSeqRef.current) return; // Stale request check

      if (geo && geo.lat && geo.lng) {
        setDestinationGeo({
          name: geo.name || query,
          displayName: geo.displayName,
          lat: geo.lat,
          lng: geo.lng,
          country: geo.country,
          state: geo.state
        });

        // Load dynamic nearby places using Overpass API
        const nearby = await fetchNearbyPlaces(geo.lat, geo.lng, catToUse, geo.name || query);
        if (currentSeq !== requestSeqRef.current) return;

        setPlaces(nearby);
      } else {
        setPlaceError(`Location "${query}" could not be found.`);
      }
    } catch (err) {
      if (currentSeq === requestSeqRef.current) {
        console.warn('[TripPilot] Geocoding/places error:', err.message);
        setPlaceError('Unable to load nearby places right now. Please try again.');
      }
    } finally {
      if (currentSeq === requestSeqRef.current) {
        setLoadingPlaces(false);
      }
    }
  }, [selectedCategory]);

  // Initial load
  useEffect(() => {
    handleSelectDestination(activeDestination);
  }, []);

  // Reload places when category changes for current destination
  useEffect(() => {
    if (destinationGeo?.lat && destinationGeo?.lng) {
      const currentSeq = ++requestSeqRef.current;
      const loadCategoryPlaces = async () => {
        setLoadingPlaces(true);
        setPlaceError('');
        try {
          const nearby = await fetchNearbyPlaces(
            destinationGeo.lat,
            destinationGeo.lng,
            selectedCategory,
            destinationGeo.name
          );
          if (currentSeq === requestSeqRef.current) {
            setPlaces(nearby);
          }
        } catch (err) {
          if (currentSeq === requestSeqRef.current) {
            console.warn('Error fetching category places:', err);
            setPlaceError('Unable to load places for this category.');
          }
        } finally {
          if (currentSeq === requestSeqRef.current) {
            setLoadingPlaces(false);
          }
        }
      };
      loadCategoryPlaces();
    }
  }, [selectedCategory, destinationGeo]);

  // Load curated inspiration destinations
  useEffect(() => {
    let isMounted = true;
    const fetchCurated = async () => {
      try {
        const res = await api.get('/explore');
        if (isMounted && res.success && res.data?.destinations) {
          setCuratedDestinations(res.data.destinations);
        }
      } catch (err) {
        if (isMounted) console.warn('Explore catalog notice:', err);
      }
    };
    fetchCurated();
    return () => { isMounted = false; };
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (destinationInput.trim()) {
      handleSelectDestination(destinationInput.trim());
    }
  };

  // View Place on Map Interaction
  const handleViewOnMap = (place) => {
    setSelectedMapPlace(place);
  };

  // Filtered Place list
  const displayPlaces = places.filter(p => {
    if (!placeFilterQuery.trim()) return true;
    const q = placeFilterQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.categoryLabel?.toLowerCase().includes(q)
    );
  });

  const activeCategoryObj = DISCOVER_CATEGORIES.find(c => c.id === selectedCategory) || DISCOVER_CATEGORIES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* 1. DISCOVER HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Around You</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
            AI-curated places worth experiencing.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Live OpenStreetMap coordinates, Overpass points of interest, and OSRM turn-by-turn routing around {destinationGeo?.name || activeDestination}.
          </p>
        </div>

        {/* Destination Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-brand-teal-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              placeholder="Search any destination (e.g. Paris, Dubai, Goa)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#090611] text-xs font-semibold border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loadingPlaces}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-rose-600 to-amber-500 hover:brightness-110 text-white font-black text-xs shadow-md shadow-rose-600/25 transition-all flex items-center gap-1.5 flex-shrink-0 disabled:opacity-60"
          >
            {loadingPlaces ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Discover</span>
          </button>
        </form>
      </div>

      {/* 2 & 3. DARK GLASS NAVIGATION CONTROL BAR (Row 1 Destinations + Row 2 Categories) */}
      <div className="local-nav-backdrop p-2 sm:p-3">
        <div className="dark-glass-nav-bar p-3 sm:p-4 space-y-2.5 sm:space-y-3">
          
          {/* ROW 1: DESTINATIONS */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex-shrink-0 flex items-center gap-1 mr-1 high-contrast-label">
              <MapPin className="w-3.5 h-3.5 text-[#FACC15]" />
              Popular:
            </span>
            {QUICK_DESTINATIONS.map(city => {
              const isActive = activeDestination.toLowerCase() === city.toLowerCase();
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setDestinationInput(city);
                    handleSelectDestination(city);
                  }}
                  className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs flex-shrink-0 flex items-center gap-1.5 transition-all ${
                    isActive ? 'destination-pill-active' : 'destination-pill-default'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isActive ? 'text-[#FACC15]' : 'text-white'}`} />
                  <span>{city}</span>
                </button>
              );
            })}
          </div>

          {/* ROW 2: CATEGORIES (8px-12px vertical spacing) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
            {DISCOVER_CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs flex-shrink-0 transition-all whitespace-nowrap ${
                    isSelected ? 'category-pill-active' : 'category-pill-default'
                  }`}
                >
                  <span className="text-sm">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* 4. DESKTOP SPLIT PANEL / MOBILE VIEW TOGGLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Panel: Discovered Places List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>{activeCategoryObj.label} in {destinationGeo?.name || activeDestination}</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {loadingPlaces ? 'Searching OpenStreetMap...' : `${displayPlaces.length} verified places found`}
              </p>
            </div>

            {/* Quick in-list search */}
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter places..."
                value={placeFilterQuery}
                onChange={(e) => setPlaceFilterQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-teal-500"
              />
            </div>
          </div>

          {/* Loading Skeletons */}
          {loadingPlaces && (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl glass-panel border border-slate-200/60 dark:border-white/[0.06] text-center space-y-2">
                <Compass className="w-6 h-6 text-brand-teal-500 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Discovering places nearby...
                </p>
                <span className="text-[10px] text-slate-400 block">
                  Querying OpenStreetMap {activeCategoryObj.label} via Overpass
                </span>
              </div>
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 rounded-3xl glass-panel border border-slate-200/40 dark:border-white/[0.04] animate-pulse space-y-2">
                  <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Error Notice */}
          {placeError && !loadingPlaces && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{placeError}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectDestination(activeDestination)}
                className="px-3 py-1.5 rounded-xl bg-red-500 text-white font-bold text-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Discovered Places Cards */}
          {!loadingPlaces && !placeError && (
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 no-scrollbar">
              {displayPlaces.length > 0 ? (
                displayPlaces.map((place) => {
                  const catConfig = CATEGORY_CONFIG[place.category] || CATEGORY_CONFIG.attraction;
                  const isSelected = selectedMapPlace?.id === place.id;
                  const displayCatLabel = place.categoryLabel || catConfig.label;

                  return (
                    <div
                      key={place.id}
                      className={`p-4 rounded-3xl glass-panel border transition-all flex flex-col justify-between space-y-3 group ${
                        isSelected
                          ? 'border-amber-400 dark:border-amber-400 shadow-xl shadow-amber-500/15 ring-2 ring-amber-400/30'
                          : 'border-slate-200/80 dark:border-white/[0.08] hover:border-violet-500/50 hover:shadow-lg'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span
                            className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold text-white flex items-center gap-1 shadow-sm"
                            style={{ backgroundColor: catConfig.color || '#7C3AED' }}
                          >
                            <span>{catConfig.emoji}</span>
                            <span>{displayCatLabel}</span>
                          </span>

                          {place.rating ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-500 dark:text-amber-400">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{place.rating}</span>
                              {place.reviews ? (
                                <span className="text-[10px] text-zinc-400 font-normal">({place.reviews})</span>
                              ) : null}
                            </span>
                          ) : null}
                        </div>

                        <h4 className="text-sm font-extrabold font-display text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors">
                          {place.name}
                        </h4>

                        {place.address ? (
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                            {place.address}
                          </p>
                        ) : null}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                          {place.distance ? (
                            <div className="flex items-center gap-1 text-violet-400 font-semibold">
                              <Navigation className="w-3 h-3" />
                              <span>{place.distance} from center</span>
                            </div>
                          ) : null}

                          {place.openingHours && place.openingHours !== 'Standard Operating Hours' ? (
                            <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                              <Clock className="w-3 h-3" />
                              <span className="truncate max-w-[140px]">{place.openingHours}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => handleViewOnMap(place)}
                          className="flex-1 py-1.5 rounded-xl bg-violet-500/10 hover:bg-gradient-to-r hover:from-violet-600 hover:to-rose-600 text-violet-600 dark:text-violet-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View on Map</span>
                        </button>

                        {(place.website || place.bookingUrl) ? (
                          <a
                            href={place.website || place.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Website / Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  title={`No ${activeCategoryObj.label.toLowerCase()} found nearby`}
                  message="Try expanding the search area or explore all places."
                  actionText="Show All Places"
                  onAction={() => {
                    setSelectedCategory('all');
                    setPlaceFilterQuery('');
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Right Side Panel: Interactive Leaflet Map with Floating Glass Controls */}
        <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/[0.08] sticky top-24">
          <LeafletTripMap
            destinationName={destinationGeo?.name || activeDestination}
            center={{ lat: destinationGeo.lat, lng: destinationGeo.lng }}
            places={places}
            selectedPlace={selectedMapPlace}
            onSelectPlace={(p) => setSelectedMapPlace(p)}
            height="min(78vh, 680px)"
            showDirectionsBar={true}
            showCategoryFilters={true}
            showSearchBox={true}
          />
        </div>

      </div>

      {/* 5. FEATURED GLOBAL DESTINATIONS CATALOG */}
      {curatedDestinations.length > 0 && (
        <div className="pt-10 border-t border-slate-200/80 dark:border-white/[0.08] space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-teal-600 dark:text-brand-teal-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inspiration</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
              Featured Global Destinations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse curated itineraries, average budgets, and flight access
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {curatedDestinations.map((dest, idx) => (
              <DestinationCard key={idx} destination={dest} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
