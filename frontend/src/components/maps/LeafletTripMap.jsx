import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
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
  Sparkles,
  Search,
  X,
  Star,
  Clock,
  Car,
  Bus,
  Footprints,
  Bike,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Locate,
  Map as MapIcon,
  AlertCircle
} from 'lucide-react';
import { normalizeMapPlace, getPlaceCoordinates, CATEGORY_CONFIG } from '../../utils/geoUtils';
import { calculateRoute } from '../../services/maps/osrmRoutingService';
import { useTheme } from '../../context/ThemeContext';

const CATEGORY_ICONS = {
  all: Layers,
  attraction: Star,
  tourist_place: MapPin,
  restaurant: Utensils,
  cafe: Coffee,
  mall: Building2,
  shopping: ShoppingBag,
  supermarket: ShoppingCart,
  hotel: Hotel,
  park: Trees,
  hospital: HeartPulse,
  airport: Plane,
  transportation: Train,
  itinerary: Sparkles
};

const TRAVEL_MODES = [
  { id: 'DRIVING', label: 'Driving', icon: Car },
  { id: 'TRANSIT', label: 'Transit', icon: Bus },
  { id: 'WALKING', label: 'Walking', icon: Footprints },
  { id: 'BICYCLING', label: 'Cycling', icon: Bike }
];

// Create Custom Premium SVG DivIcon for Leaflet
function createCustomPinIcon(category = 'attraction', isSelected = false, labelText = null) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.attraction;
  const color = config.color || '#16C79A';
  const emoji = labelText ? String(labelText) : (config.emoji || '📍');
  const size = isSelected ? 44 : 36;

  return L.divIcon({
    className: 'category-map-pin',
    html: `
      <div class="category-pin-wrapper" style="width: ${size}px; height: ${size}px; position: relative;">
        <div style="
          background: ${color};
          width: 100%;
          height: 100%;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(0,0,0,0.35), 0 0 ${isSelected ? '14px ' + color : '6px rgba(0,0,0,0.2)'};
          border: ${isSelected ? '3px solid #FFFFFF' : '2px solid #FFFFFF'};
        ">
          <div style="
            transform: rotate(45deg);
            font-size: ${labelText ? '12px' : '15px'};
            font-weight: 800;
            color: #FFFFFF;
            line-height: 1;
            text-shadow: 0 1px 2px rgba(0,0,0,0.4);
          ">${emoji}</div>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4]
  });
}

// Controller component to handle panning, zooming, and bound fitting safely
function MapController({ center, bounds, focusPoint, zoom = 12 }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // 1. If a single focus point is selected, pan & zoom to 15
    if (focusPoint && typeof focusPoint.lat === 'number' && typeof focusPoint.lng === 'number') {
      map.flyTo([focusPoint.lat, focusPoint.lng], 15, {
        animate: true,
        duration: 1.2
      });
      return;
    }

    // 2. If route or multi-point bounds exist, fit bounds with padding
    if (bounds && bounds.length > 1) {
      try {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14,
          animate: true
        });
      } catch (e) {
        if (center) map.setView([center.lat, center.lng], zoom);
      }
      return;
    }

    // 3. Center point fallback
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, bounds, focusPoint, zoom, map]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {}
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function LeafletTripMap({
  center = null,
  zoom = 12,
  destinationName = '',
  originName = '',
  places = [],
  hotels = [],
  attractions = [],
  restaurants = [],
  airports = [],
  itineraryStops = [],
  selectedPlace = null,
  initialRoute = null,
  onSelectPlace = null,
  onViewDirections = null,
  showDirectionsBar = true,
  showCategoryFilters = true,
  showSearchBox = true,
  className = '',
  height = 'min(70vh, 650px)'
}) {
  const { isDark } = useTheme();
  const markerRefs = useRef(new Map());

  // UI States
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedPlace, setFocusedPlace] = useState(null);

  // Directions Mode States
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [originInput, setOriginInput] = useState(originName || '');
  const [destinationInput, setDestinationInput] = useState(destinationName || '');
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [activeRoute, setActiveRoute] = useState(initialRoute);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);

  // Sync external destination / origin names
  useEffect(() => {
    if (destinationName) {
      setDestinationInput(prev => prev || destinationName);
    }
    if (originName) {
      setOriginInput(prev => prev || originName);
    }
  }, [destinationName, originName]);

  // Sync external selectedPlace prop
  useEffect(() => {
    if (selectedPlace) {
      const normalized = normalizeMapPlace(selectedPlace);
      if (normalized?.latitude && normalized?.longitude) {
        setFocusedPlace({
          ...normalized,
          lat: normalized.latitude,
          lng: normalized.longitude
        });

        // Open popup if marker ref exists
        const marker = markerRefs.current.get(normalized.id);
        if (marker) {
          setTimeout(() => marker.openPopup(), 400);
        }
      }
    }
  }, [selectedPlace]);

  // Consolidate & normalize all input places
  const allPlaces = useMemo(() => {
    const list = [];
    const seenIds = new Set();

    const addPlace = (p, cat = 'attraction') => {
      const norm = normalizeMapPlace(p, cat);
      if (norm?.latitude && norm?.longitude) {
        const key = `${norm.latitude.toFixed(4)}_${norm.longitude.toFixed(4)}_${norm.name}`;
        if (!seenIds.has(key)) {
          seenIds.add(key);
          list.push(norm);
        }
      }
    };

    (places || []).forEach(p => addPlace(p, p.category || 'attraction'));
    (attractions || []).forEach(a => addPlace(a, 'attraction'));
    (restaurants || []).forEach(r => addPlace(r, 'restaurant'));
    (hotels || []).forEach(h => addPlace(h, 'hotel'));
    (airports || []).forEach(ap => addPlace(ap, 'airport'));
    (itineraryStops || []).forEach((stop, idx) => {
      const norm = normalizeMapPlace(stop, 'itinerary');
      if (norm?.latitude && norm?.longitude) {
        norm.stopIndex = idx + 1;
        norm.category = 'itinerary';
        list.push(norm);
      }
    });

    return list;
  }, [places, attractions, restaurants, hotels, airports, itineraryStops]);

  // Filter places based on activeCategory and searchQuery
  const filteredPlaces = useMemo(() => {
    return allPlaces.filter(p => {
      // 1. Category Filter
      if (activeCategory !== 'all') {
        const cat = p.category?.toLowerCase() || '';
        const target = activeCategory.toLowerCase();
        if (target === 'tourist_place' && (cat === 'attraction' || cat === 'tourist_place')) {
          // match
        } else if (target === 'attraction' && (cat === 'attraction' || cat === 'tourist_place')) {
          // match
        } else if (target === 'shopping' && (cat === 'shopping' || cat === 'mall' || cat === 'supermarket')) {
          // match general shopping
        } else if (cat !== target) {
          return false;
        }
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchAddress = p.address?.toLowerCase().includes(q);
        const matchCategory = p.category?.toLowerCase().includes(q) || p.categoryLabel?.toLowerCase().includes(q);
        if (!matchName && !matchAddress && !matchCategory) {
          return false;
        }
      }

      return true;
    });
  }, [allPlaces, activeCategory, searchQuery]);

  // Compute Default Map Center & Multi-point Bounds
  const { computedCenter, computedBounds } = useMemo(() => {
    // If a route is active, calculate bounds from route coordinates
    if (activeRoute?.coordinates?.length > 1) {
      return {
        computedCenter: {
          lat: activeRoute.coordinates[0][0],
          lng: activeRoute.coordinates[0][1]
        },
        computedBounds: activeRoute.coordinates
      };
    }

    // Coordinates from center prop
    const rawCenterCoords = getPlaceCoordinates(center);
    if (rawCenterCoords) {
      const points = filteredPlaces.map(p => [p.latitude, p.longitude]);
      return {
        computedCenter: rawCenterCoords,
        computedBounds: points.length > 1 ? points : null
      };
    }

    // Coordinates from filtered places
    const validPoints = filteredPlaces.map(p => [p.latitude, p.longitude]);
    if (validPoints.length > 0) {
      const avgLat = validPoints.reduce((sum, pt) => sum + pt[0], 0) / validPoints.length;
      const avgLng = validPoints.reduce((sum, pt) => sum + pt[1], 0) / validPoints.length;
      return {
        computedCenter: { lat: avgLat, lng: avgLng },
        computedBounds: validPoints.length > 1 ? validPoints : null
      };
    }

    // Default global coordinate (Fallback, e.g. Central Delhi / Equator reference, overridden dynamically)
    return {
      computedCenter: { lat: 28.6139, lng: 77.2090 },
      computedBounds: null
    };
  }, [center, filteredPlaces, activeRoute]);

  // Calculate Route Action
  const handleCalculateRoute = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    const start = originInput.trim();
    const end = destinationInput.trim() || destinationName;

    if (!start || !end) {
      setRouteError('Please enter both origin and destination.');
      return;
    }

    setIsCalculatingRoute(true);
    setRouteError('');

    try {
      const result = await calculateRoute(start, end, travelMode);
      setActiveRoute(result);
      setIsDirectionsOpen(true);
      setFocusedPlace(null);
      if (onViewDirections) onViewDirections(result);
    } catch (err) {
      console.warn('[TripPilot] Route error:', err.message);
      setRouteError(err.message || 'Unable to calculate route. Please verify city names.');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Trigger Directions from Selected Place
  const handleDirectToPlace = (targetPlace) => {
    if (!targetPlace) return;
    const destStr = targetPlace.name || `${targetPlace.latitude},${targetPlace.longitude}`;
    setDestinationInput(destStr);
    setIsDirectionsOpen(true);

    if (originInput.trim()) {
      handleCalculateRoute();
    }
  };

  // Swap Start and End Locations
  const handleSwapLocations = () => {
    const temp = originInput;
    setOriginInput(destinationInput);
    setDestinationInput(temp);
  };

  // Handle marker selection
  const handleMarkerClick = (place) => {
    setFocusedPlace({
      ...place,
      lat: place.latitude,
      lng: place.longitude
    });
    if (onSelectPlace) {
      onSelectPlace(place.originalData || place);
    }
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 ${className}`}
      style={{ height, minHeight: '480px' }}
    >
      {/* 1. TOP BAR: CATEGORY FILTERS & CONTROLS */}
      {showCategoryFilters && (
        <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl border border-slate-200/80 dark:border-slate-700/80 pointer-events-auto overflow-x-auto max-w-full no-scrollbar">
            {Object.entries(CATEGORY_CONFIG).map(([catKey, config]) => {
              const Icon = CATEGORY_ICONS[catKey] || Layers;
              const isSelected = activeCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => {
                    setActiveCategory(catKey);
                    setFocusedPlace(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? `${config.bg || 'bg-brand-teal-500'} text-white shadow-md scale-105`
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {Icon ? <Icon className="w-3.5 h-3.5" /> : <span>{config.emoji || '📍'}</span>}
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>

            {/* Right Action Buttons: Floating Glass Controls */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {/* My Location Geolocation Button */}
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setFocusedPlace({
                          id: 'user_location',
                          name: 'My Location',
                          category: 'transportation',
                          latitude: pos.coords.latitude,
                          longitude: pos.coords.longitude,
                          lat: pos.coords.latitude,
                          lng: pos.coords.longitude
                        });
                      },
                      (err) => console.warn('Geolocation error:', err)
                    );
                  }
                }}
                title="My Location"
                className="p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-md border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-brand-teal-500 hover:bg-slate-100 transition-all"
              >
                <Locate className="w-3.5 h-3.5" />
              </button>

              {/* Map Style Selector */}
              <button
                type="button"
                onClick={() => {
                  // Toggle category or refresh view
                  if (computedCenter) {
                    setFocusedPlace(null);
                  }
                }}
                title="Reset Map View"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-md border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
              >
                <MapIcon className="w-3.5 h-3.5 text-brand-sky-400" />
                <span>Map View</span>
              </button>

              {showDirectionsBar && (
                <button
                  type="button"
                  onClick={() => setIsDirectionsOpen(!isDirectionsOpen)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-lg backdrop-blur-md transition-all border ${
                    isDirectionsOpen
                      ? 'bg-brand-teal-500 text-slate-950 border-brand-teal-400 font-extrabold shadow-brand-teal-500/20'
                      : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5 text-brand-teal-500" />
                  <span>{isDirectionsOpen ? 'Close' : 'Directions'}</span>
                </button>
              )}

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{filteredPlaces.length} Spots</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. IN-MAP SEARCH BOX */}
        {showSearchBox && (
          <div className="absolute top-20 left-4 z-[500] w-72 max-w-[calc(100%-2rem)] pointer-events-auto">
            <div className="relative shadow-lg rounded-2xl">
              <input
                type="text"
                placeholder="Search this area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 transition-all shadow-md"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. DIRECTIONS DRAWER / OVERLAY PANEL WITH TIMELINE NAVIGATION */}
        <AnimatePresence>
          {isDirectionsOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.96 }}
              className="absolute top-20 left-4 z-[550] w-96 max-w-[calc(100%-2rem)] bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl border border-slate-200/90 dark:border-slate-700/90 space-y-4 max-h-[calc(100%-6rem)] overflow-y-auto no-scrollbar"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-400 flex items-center justify-center">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Turn-by-Turn Navigation
                    </h4>
                    <p className="text-[10px] text-slate-400">OSRM real-time driving & transit path</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDirectionsOpen(false)}
                  className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Travel Mode Pills */}
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
                {TRAVEL_MODES.map(mode => {
                  const Icon = mode.icon;
                  const isSelected = travelMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTravelMode(mode.id)}
                      className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 text-brand-teal-600 dark:text-brand-teal-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mb-0.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Origin & Destination Inputs with Swap */}
              <form onSubmit={handleCalculateRoute} className="space-y-2.5">
                <div className="relative flex items-center gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="relative">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute left-3 top-3 border-2 border-white dark:border-slate-900 shadow-sm" />
                      <input
                        type="text"
                        placeholder="Start Location (e.g. Hyderabad, Paris)..."
                        value={originInput}
                        onChange={(e) => setOriginInput(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
                      />
                    </div>

                    <div className="relative">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute left-3 top-3 border-2 border-white dark:border-slate-900 shadow-sm" />
                      <input
                        type="text"
                        placeholder="Destination (e.g. Goa, Dubai)..."
                        value={destinationInput}
                        onChange={(e) => setDestinationInput(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
                      />
                    </div>
                  </div>

                  {/* Swap Button */}
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    title="Swap Origin & Destination"
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-teal-500/10 hover:text-brand-teal-500 flex items-center justify-center text-slate-500 transition-colors flex-shrink-0"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Calculate Route Button */}
                <button
                  type="submit"
                  disabled={isCalculatingRoute}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-teal-500 to-brand-sky-400 hover:brightness-110 text-brand-navy-950 font-black text-xs shadow-md shadow-brand-teal-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isCalculatingRoute ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Calculating OSRM Route...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Calculate Route</span>
                    </>
                  )}
                </button>
              </form>

              {/* Error notice */}
              {routeError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{routeError}</span>
                </div>
              )}

              {/* Active Route Summary & Timeline Navigation */}
              {activeRoute && activeRoute.success && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-brand-teal-500/10 border border-brand-teal-500/20">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-brand-teal-600 dark:text-brand-teal-400 block">
                        Distance
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {activeRoute.distance}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold uppercase text-brand-teal-600 dark:text-brand-teal-400 block">
                        Estimated Duration
                      </span>
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {activeRoute.duration}
                      </span>
                    </div>
                  </div>

                  {/* Route Timeline (Start -> Route Steps -> Destination) */}
                  <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-teal-500/30">
                    {/* Origin Pin */}
                    <div className="relative flex items-center gap-2 text-xs">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -left-5" />
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        Start: {activeRoute.origin?.name || originInput}
                      </span>
                    </div>

                    {/* Intermediate Steps / Highway Notice */}
                    <div className="relative flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-sky-400 absolute -left-[18px]" />
                      <span>{activeRoute.isAirRoute ? 'Direct Transit Corridor' : 'Highway & Main Route Segments'}</span>
                    </div>

                    {/* Destination Pin */}
                    <div className="relative flex items-center gap-2 text-xs">
                      <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 absolute -left-5" />
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        Destination: {activeRoute.destination?.name || destinationInput}
                      </span>
                    </div>
                  </div>

                  {/* Turn-by-Turn Steps Toggle */}
                  {activeRoute.steps && activeRoute.steps.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsStepsExpanded(!isStepsExpanded)}
                        className="w-full flex items-center justify-between py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand-teal-500"
                      >
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-brand-teal-500" />
                          <span>Turn-by-Turn Instructions ({activeRoute.steps.length})</span>
                        </span>
                        {isStepsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isStepsExpanded && (
                        <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                          {activeRoute.steps.map((step, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] flex items-start gap-2"
                            >
                              <span className="w-5 h-5 rounded-full bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <p className="text-slate-800 dark:text-slate-200 font-semibold">{step.instruction}</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                  <span>{step.distance}</span>
                                  <span>•</span>
                                  <span>{step.duration}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      {/* 4. MAIN LEAFLET MAP CONTAINER */}
      <MapContainer
        center={[computedCenter.lat, computedCenter.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* Safe Map Controller for recentering, zooming, and bound fitting */}
        <MapController
          center={computedCenter}
          bounds={computedBounds}
          focusPoint={focusedPlace}
          zoom={zoom}
        />

        {/* 100% Free OpenStreetMap Tile Layer with Proper Attribution */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Route Polyline */}
        {activeRoute && activeRoute.coordinates && activeRoute.coordinates.length > 0 && (
          <Polyline
            positions={activeRoute.coordinates}
            pathOptions={{
              color: isDark ? '#38BDF8' : '#4F46E5',
              weight: 5,
              opacity: 0.9,
              dashArray: activeRoute.isAirRoute ? '8, 8' : undefined,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        )}

        {/* Route Origin Marker */}
        {activeRoute && activeRoute.origin && (
          <Marker
            position={[activeRoute.origin.lat, activeRoute.origin.lng]}
            icon={createCustomPinIcon('transportation', true, 'A')}
          >
            <Popup>
              <div className="p-3 min-w-[200px]">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Route Origin
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                  {activeRoute.origin.name}
                </h4>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Destination Marker */}
        {activeRoute && activeRoute.destination && (
          <Marker
            position={[activeRoute.destination.lat, activeRoute.destination.lng]}
            icon={createCustomPinIcon('attraction', true, 'B')}
          >
            <Popup>
              <div className="p-3 min-w-[200px]">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                  Route Destination
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                  {activeRoute.destination.name}
                </h4>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dynamic Category Place Markers */}
        {filteredPlaces.map((place) => {
          if (!place || typeof place.latitude !== 'number' || typeof place.longitude !== 'number' || isNaN(place.latitude) || isNaN(place.longitude)) {
            return null;
          }
          const isSelected = focusedPlace?.id === place.id;
          const stopLabel = place.stopIndex ? String(place.stopIndex) : null;
          const icon = createCustomPinIcon(place.category, isSelected, stopLabel);

          return (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={icon}
              ref={(ref) => {
                if (ref) markerRefs.current.set(place.id, ref);
                else markerRefs.current.delete(place.id);
              }}
              eventHandlers={{
                click: () => handleMarkerClick(place)
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-4 min-w-[230px] max-w-[290px] space-y-2.5">
                  {/* Category Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white shadow-sm"
                      style={{ backgroundColor: CATEGORY_CONFIG[place.category]?.color || '#6366F1' }}
                    >
                      {place.categoryLabel || CATEGORY_CONFIG[place.category]?.label || place.category}
                    </span>
                    {place.rating ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{place.rating}</span>
                        {place.reviewCount ? (
                          <span className="text-[10px] text-slate-400 font-normal">({place.reviewCount})</span>
                        ) : null}
                      </span>
                    ) : null}
                  </div>

                  {/* Place Title */}
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {place.name}
                  </h4>

                  {/* Address */}
                  {place.address ? (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {place.address}
                    </p>
                  ) : null}

                  {/* Meta (Price / Distance / Hours) */}
                  <div className="flex flex-col gap-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    {place.distance ? (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-brand-teal-500" />
                          <span>{place.distance} away</span>
                        </span>
                        {place.priceFormatted ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {place.priceFormatted}
                          </span>
                        ) : null}
                      </div>
                    ) : place.priceFormatted ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {place.priceFormatted}
                      </span>
                    ) : null}

                    {place.openingHours && place.openingHours !== 'Standard Operating Hours' ? (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{place.openingHours}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDirectToPlace(place)}
                      className="flex-1 py-1.5 rounded-xl bg-brand-teal-500 hover:bg-brand-teal-600 text-brand-navy-950 font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm transition-colors"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Directions</span>
                    </button>

                    {(place.bookingUrl || place.website) ? (
                      <a
                        href={place.bookingUrl || place.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export { CATEGORY_CONFIG };
