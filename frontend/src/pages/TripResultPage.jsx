import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  Columns3,
  Check,
  Calendar,
  Users,
  IndianRupee,
  MapPin,
  Navigation,
  Route,
  Sparkles,
  Compass,
  Utensils,
  Layers,
  Plane,
  Building2,
  CloudSun,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import TripScore from '../components/score/TripScore';
import BudgetBreakdown from '../components/budget/BudgetBreakdown';
import ItineraryTimeline from '../components/itinerary/ItineraryTimeline';
import FlightCard from '../components/travel/FlightCard';
import HotelCard from '../components/travel/HotelCard';
import PlaceCard from '../components/destination/PlaceCard';
import MapView from '../components/map/MapView';
import WeatherCard from '../components/weather/WeatherCard';
import FoodGuide from '../components/food/FoodGuide';
import DestinationIntelligence from '../components/destination/DestinationIntelligence';
import ReviewSummary from '../components/destination/ReviewSummary';
import WhatIfPanel from '../components/itinerary/WhatIfPanel';
import AIChat from '../components/itinerary/AIChat';
import { useTrip } from '../context/TripContext';
import { formatCurrency, formatDateRange } from '../utils/formatters';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'hotels', label: 'Hotels', icon: Building2 },
  { id: 'places', label: 'Places', icon: MapPin },
  { id: 'food', label: 'Food Guide', icon: Utensils },
  { id: 'weather', label: 'Weather', icon: CloudSun },
  { id: 'map', label: 'Interactive Map', icon: Compass },
  { id: 'itinerary', label: 'Itinerary', icon: Calendar },
  { id: 'budget', label: 'Budget Matrix', icon: DollarSign }
];

const PLACE_CATEGORIES = [
  'All',
  'Must See',
  'Beaches',
  'Nature',
  'History',
  'Culture',
  'Shopping',
  'Food'
];

const TripResultPage = () => {
  const { tripId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTrip, getTripById, saveCurrentTrip } = useTrip();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(!currentTrip || (currentTrip.id !== tripId && currentTrip._id !== tripId));
  const [fetchError, setFetchError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedPlaceCategory, setSelectedPlaceCategory] = useState('All');
  const [highlightedMapPlace, setHighlightedMapPlace] = useState(null);

  // Sync subroute tab if URL ends in /flights, /hotels, /itinerary
  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/flights')) setActiveTab('flights');
    else if (path.endsWith('/hotels')) setActiveTab('hotels');
    else if (path.endsWith('/itinerary')) setActiveTab('itinerary');
  }, [location.pathname]);

  // Load trip by ID if not in memory (supports direct navigation and page refresh)
  const loadTripData = async () => {
    if (!tripId || tripId === 'undefined' || tripId === 'null') {
      setFetchError({ type: 'NOT_FOUND', message: 'No valid trip ID provided.' });
      setLoading(false);
      return;
    }

    if (currentTrip && (currentTrip.id === tripId || currentTrip._id === tripId)) {
      setLoading(false);
      setFetchError(null);
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      await getTripById(tripId);
      setLoading(false);
    } catch (err) {
      console.warn('[TripPilot] Trip load error:', err);
      if (err.code === 'TRIP_NOT_FOUND' || err.message?.includes('not found') || err.response?.status === 404) {
        setFetchError({
          type: 'NOT_FOUND',
          message: 'This trip may have been deleted or the link may be invalid.'
        });
      } else {
        setFetchError({
          type: 'API_ERROR',
          message: err.message || 'Unable to retrieve trip details from travel servers.'
        });
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="relative mb-2">
          <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-amber-400 animate-spin" />
          <Compass className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight hero-gradient-text">
            ✦ Loading Journey Intelligence...
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Retrieving live itinerary, verified rates, routes, and recommendations.
          </p>
        </div>
      </div>
    );
  }

  // 2. TRIP NOT FOUND STATE (Differentiated from generic 404)
  if (fetchError?.type === 'NOT_FOUND' || (!currentTrip && !loading)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest block">
              Trip Notice
            </span>
            <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">
              Trip Not Found
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {fetchError?.message || 'We could not find this specific journey in our flight records.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/trips"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-brand-navy-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-all text-center"
            >
              ← My Saved Trips
            </Link>
            <Link
              to="/plan"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold btn-luxury-primary shadow-lg text-center"
            >
              ✦ Plan a New Trip
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. API FAILURE STATE (Differentiated from 404)
  if (fetchError?.type === 'API_ERROR') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-widest block">
              Connection Notice
            </span>
            <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">
              Travel Data Unavailable
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {fetchError.message || 'We could not connect to the travel database to retrieve this trip.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={loadTripData}
              className="px-6 py-2.5 rounded-xl text-xs font-bold btn-luxury-primary shadow-lg flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    destination = 'Goa',
    origin = 'Hyderabad',
    dates = { durationDays: 4, departure: '', return: '' },
    travelers = 2,
    budget = 25000,
    score,
    budgetBreakdown,
    flights,
    hotel,
    directions,
    places = [],
    weather,
    foodIntelligence = [],
    destinationIntelligence,
    reviews,
    itinerary = [],
    isDemoData
  } = currentTrip;

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await saveCurrentTrip();
      setIsSaved(true);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleViewOnMap = (item) => {
    setHighlightedMapPlace(item);
    setActiveTab('map');
    const mapEl = document.getElementById('interactive-map-section');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredPlaces = places.filter(p => {
    if (selectedPlaceCategory === 'All') return true;
    return (
      p.category?.toLowerCase().includes(selectedPlaceCategory.toLowerCase()) ||
      p.name?.toLowerCase().includes(selectedPlaceCategory.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/plan"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Planning</span>
        </Link>

        {isDemoData && (
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Demo Sandbox Data
          </span>
        )}
      </div>

      {/* 1. HERO JOURNEY BANNER */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 bg-white dark:bg-luxury-dark-surface border border-slate-200/80 dark:border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                TripPilot Intelligence
              </span>
              <span className="text-xs text-slate-400">
                {origin} → {destination}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight">
              {destination}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {dates.durationDays} Days • {formatDateRange(dates.departure, dates.return)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-violet-400" />
                {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
              </span>
              <span>•</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Budget: {formatCurrency(budget)}
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/compare"
              className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Columns3 className="w-4 h-4" />
              <span>Compare</span>
            </Link>

            <button
              onClick={handleSave}
              disabled={isSaved || saveLoading}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                isSaved
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md'
                  : 'btn-luxury-primary shadow-lg hover:scale-105 active:scale-95'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'Trip Saved' : saveLoading ? 'Saving...' : 'Save Trip'}</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isTabActive
                    ? 'btn-luxury-primary text-white shadow-md shadow-violet-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DECISION ENGINE: SCORE & BUDGET MATRIX */}
      {(activeTab === 'overview' || activeTab === 'budget') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <TripScore scoreData={score} />
          </div>
          <div className="lg:col-span-6">
            <BudgetBreakdown
              breakdownData={budgetBreakdown}
              targetBudget={budget}
              travelers={travelers}
            />
          </div>
        </div>
      )}

      {/* 3. DESTINATION INTELLIGENCE & FIRST-TIME VISITOR GUIDE */}
      {destinationIntelligence && (activeTab === 'overview') && (
        <DestinationIntelligence
          destinationData={destinationIntelligence}
          destinationName={destination}
        />
      )}

      {/* 4. VERIFIED FLIGHT & HOTEL SELECTIONS */}
      {(activeTab === 'overview' || activeTab === 'flights' || activeTab === 'hotels') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(activeTab === 'overview' || activeTab === 'flights') && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                  Verified Flight Selection
                </h3>
                <span className="text-xs text-sky-500 font-semibold">Google Flights</span>
              </div>
              <FlightCard flight={flights?.selected || flights?.options?.[0]} />
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'hotels') && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                  Selected Hotel Stay
                </h3>
                <span className="text-xs text-teal-500 font-semibold">Google Hotels</span>
              </div>
              <HotelCard
                hotel={hotel?.selected || hotel?.options?.[0]}
                nights={Math.max(1, dates.durationDays - 1)}
                onViewOnMap={handleViewOnMap}
              />
            </div>
          )}
        </div>
      )}

      {/* 5. WEATHER INTELLIGENCE */}
      {weather && (activeTab === 'overview' || activeTab === 'weather') && (
        <WeatherCard weather={weather} />
      )}

      {/* 6. TASTE THE DESTINATION (FOOD GUIDE) */}
      {foodIntelligence && foodIntelligence.length > 0 && (activeTab === 'overview' || activeTab === 'food') && (
        <FoodGuide
          foodDishes={foodIntelligence}
          destination={destination}
          onViewOnMap={handleViewOnMap}
        />
      )}

      {/* 7. PLACES YOU SHOULDN'T MISS */}
      {places && places.length > 0 && (activeTab === 'overview' || activeTab === 'places') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Curated Attractions
              </span>
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
                Places You Shouldn't Miss in {destination}
              </h3>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {PLACE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedPlaceCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedPlaceCategory === cat
                      ? 'bg-gradient-to-r from-violet-600 via-rose-600 to-amber-500 text-white font-bold shadow-md shadow-violet-500/20'
                      : 'bg-white/80 dark:bg-luxury-dark-surface text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlaces.slice(0, 6).map((p, idx) => (
              <PlaceCard
                key={idx}
                place={p}
                onViewOnMap={handleViewOnMap}
              />
            ))}
          </div>
        </div>
      )}

      {/* 8. INTERACTIVE OPENSTREETMAP & NEARBY DISCOVERY */}
      {(activeTab === 'overview' || activeTab === 'map') && (
        <div id="interactive-map-section">
          <MapView
            destinationName={destination}
            originName={origin}
            destinationCenter={currentTrip?.destinationCoordinates || null}
            hotel={hotel?.selected || hotel?.options?.[0]}
            hotels={hotel?.options || []}
            places={places}
            itinerary={itinerary}
            selectedPlace={highlightedMapPlace}
          />
        </div>
      )}

      {/* 9. GEOSPATIAL WEATHER-AWARE ITINERARY */}
      {(activeTab === 'overview' || activeTab === 'itinerary') && (
        <ItineraryTimeline
          itinerary={itinerary}
          onViewOnMap={handleViewOnMap}
        />
      )}

      {/* 10. "WHAT IF?" SIMULATION ENGINE */}
      {(activeTab === 'overview') && (
        <WhatIfPanel />
      )}

      {/* 11. VERIFIED SENTIMENT ANALYSIS */}
      {reviews && (activeTab === 'overview') && (
        <ReviewSummary reviewData={reviews} />
      )}

      {/* 12. FLOATING AI TRAVEL ASSISTANT */}
      <AIChat />

    </div>
  );
};

export default TripResultPage;
