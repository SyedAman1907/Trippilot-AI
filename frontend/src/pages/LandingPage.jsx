import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plane,
  Compass,
  Sparkles,
  MapPin,
  ArrowRight,
  Route,
  Star,
  CloudSun,
  Utensils,
  Navigation,
  CheckCircle2,
  Calendar,
  Layers,
  Building2,
  DollarSign,
  ShieldCheck,
  Zap,
  TrendingUp,
  Map,
  Eye,
  Clock
} from 'lucide-react';
import HeroSearch from '../components/search/HeroSearch';
import DestinationCard from '../components/destination/DestinationCard';
import LeafletTripMap from '../components/maps/LeafletTripMap';
import { geocodeLocation } from '../services/maps/osmGeocodingService';
import { fetchNearbyPlaces } from '../services/maps/osmPlacesService';
import CinematicTravelBackground from '../components/background/CinematicTravelBackground';

const CITY_SHOWCASE_DATA = {
  Hyderabad: {
    title: 'Hyderabad Heritage & Royal Palaces',
    tagline: 'Charminar bazaars, Nizami architecture & culinary trails',
    routeFrom: 'DEL / BOM',
    routeTo: 'HYD',
    duration: '1h 40m Direct',
    matchScore: 95,
    flightNumber: 'IndiGo 6E-241',
    flightPrice: '₹3,490',
    optimalSeason: 'Optimal Season: Oct–Mar',
    heroImage: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&q=80',
  },
  Goa: {
    title: 'Goa Coastal Escape',
    tagline: 'Sun-kissed beaches, Portuguese villas & vibrant coastal cafes',
    routeFrom: 'HYD / BOM',
    routeTo: 'GOI',
    duration: '1h 25m Direct',
    matchScore: 94,
    flightNumber: 'IndiGo 6E-512',
    flightPrice: '₹3,250',
    optimalSeason: 'Optimal Season: Nov–Feb',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  },
  Paris: {
    title: 'Paris Haute Culture & Arts',
    tagline: 'Iconic monuments, Louvre galleries & Michelin dining',
    routeFrom: 'DEL / BOM',
    routeTo: 'CDG',
    duration: '9h 10m Direct',
    matchScore: 96,
    flightNumber: 'Air France AF-225',
    flightPrice: '₹28,000',
    optimalSeason: 'Optimal Season: Apr–Oct',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  },
  Dubai: {
    title: 'Dubai Futuristic Skyline & Safari',
    tagline: 'Burj Khalifa, luxury desert safaris & world-class shopping',
    routeFrom: 'BOM / HYD',
    routeTo: 'DXB',
    duration: '3h 45m Direct',
    matchScore: 93,
    flightNumber: 'Emirates EK-527',
    flightPrice: '₹14,500',
    optimalSeason: 'Optimal Season: Nov–Mar',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  },
  Singapore: {
    title: 'Singapore Garden City & Marina',
    tagline: 'Gardens by the Bay, rooftop infinity views & street food',
    routeFrom: 'HYD / MAA',
    routeTo: 'SIN',
    duration: '4h 15m Direct',
    matchScore: 95,
    flightNumber: 'Singapore Air SQ-503',
    flightPrice: '₹16,800',
    optimalSeason: 'Optimal Season: Year-Round',
    heroImage: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
  },
  Mumbai: {
    title: 'Mumbai Marine Drive & Promenade',
    tagline: 'Gateway of India, Art Deco architecture & vibrant culture',
    routeFrom: 'HYD / DEL',
    routeTo: 'BOM',
    duration: '1h 30m Direct',
    matchScore: 92,
    flightNumber: 'Vistara UK-832',
    flightPrice: '₹3,100',
    optimalSeason: 'Optimal Season: Nov–Feb',
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
  }
};

const CURATED_DESTINATIONS = [
  {
    name: 'Goa',
    country: 'India',
    state: 'Goa',
    tagline: 'Sun-kissed beaches, Portuguese heritage villas & vibrant coastal cafes',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    tags: ['beach', 'adventure', 'cafes'],
    baseFlightCost: 3250,
    baseHotelPerNight: 2800,
    estimatedCost: 23540,
    initialMatchScore: 94,
    rating: 4.8
  },
  {
    name: 'Paris',
    country: 'France',
    state: 'Île-de-France',
    tagline: 'Haute gastronomy, timeless art citadels & iconic romantic landmarks',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    tags: ['culture', 'museums', 'cuisine'],
    baseFlightCost: 28000,
    baseHotelPerNight: 11000,
    estimatedCost: 86500,
    initialMatchScore: 96,
    rating: 4.9
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    state: 'Dubai',
    tagline: 'Futuristic architecture, luxury desert safaris & world-class dining',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    tags: ['luxury', 'shopping', 'safari'],
    baseFlightCost: 14500,
    baseHotelPerNight: 7500,
    estimatedCost: 52900,
    initialMatchScore: 93,
    rating: 4.7
  }
];

const DISCOVER_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '📍' },
  { id: 'attraction', label: 'Attractions', emoji: '⭐' },
  { id: 'restaurant', label: 'Restaurants', emoji: '🍴' },
  { id: 'cafe', label: 'Cafes', emoji: '☕' },
  { id: 'mall', label: 'Malls', emoji: '🏬' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'supermarket', label: 'Supermarkets', emoji: '🛒' },
  { id: 'hotel', label: 'Hotels', emoji: '🏨' },
  { id: 'park', label: 'Parks', emoji: '🌳' },
  { id: 'hospital', label: 'Hospitals', emoji: '🏥' },
  { id: 'airport', label: 'Airports', emoji: '✈️' }
];

const AI_INSIGHTS = [
  {
    icon: Calendar,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    title: '💡 Best Time to Visit',
    desc: 'Algorithmic season weighting evaluating climate trends, shoulder periods, and festival schedules.'
  },
  {
    icon: DollarSign,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    title: '💰 Estimated Budget',
    desc: 'Live itemized breakdown covering real airfare, lodging, daily meals, local transit, and activity costs.'
  },
  {
    icon: CloudSun,
    color: 'text-sky-400',
    bgColor: 'bg-sky-400/10',
    title: '🌦 Weather Insight',
    desc: '5-day forecasts, humidity, wind conditions, and automated indoor/outdoor itinerary adaptations.'
  },
  {
    icon: Navigation,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-400/10',
    title: '🚗 Transportation',
    desc: 'OSRM multimodal turn-by-turn driving, walking paths, metro lines, and airport connection matrices.'
  },
  {
    icon: Utensils,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    title: '🍴 Food Recommendations',
    desc: 'Verified regional culinary dishes, dietary tags (vegetarian, halal, vegan), and top local spots.'
  },
  {
    icon: Zap,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    title: '⚡ Hidden Gems',
    desc: 'Lesser-known viewpoints, secret courtyards, and scenic routes away from crowded tourist hubs.'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();

  // Landing map showcase state
  const [showcaseCity, setShowcaseCity] = useState('Hyderabad');
  const [showcaseGeo, setShowcaseGeo] = useState({ lat: 17.3850, lng: 78.4867 });
  const [showcasePlaces, setShowcasePlaces] = useState([]);
  const [showcaseCategory, setShowcaseCategory] = useState('all');
  const [loadingShowcase, setLoadingShowcase] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadShowcase = async () => {
      setLoadingShowcase(true);
      try {
        const geo = await geocodeLocation(showcaseCity);
        if (geo && geo.lat && geo.lng && isMounted) {
          setShowcaseGeo({ lat: geo.lat, lng: geo.lng });
          const nearby = await fetchNearbyPlaces(geo.lat, geo.lng, showcaseCategory, showcaseCity);
          if (isMounted) setShowcasePlaces(nearby);
        }
      } catch (e) {
        console.warn('Showcase error:', e);
      } finally {
        if (isMounted) setLoadingShowcase(false);
      }
    };
    loadShowcase();
    return () => { isMounted = false; };
  }, [showcaseCity, showcaseCategory]);

  const currentFeatured = CITY_SHOWCASE_DATA[showcaseCity] || {
    title: `${showcaseCity} Journey`,
    tagline: `Experience the best of ${showcaseCity}`,
    routeFrom: 'DEL / BOM',
    routeTo: showcaseCity.slice(0, 3).toUpperCase(),
    duration: 'Direct Flight',
    matchScore: 94,
    flightNumber: 'Air India AI-102',
    flightPrice: '₹4,200',
    optimalSeason: 'Optimal Season: Nov–Mar',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* 0. BASE ANIMATED CINEMATIC TRAVEL BACKGROUND (z-index: 0, fixed, inset-0) */}
      <CinematicTravelBackground />

      {/* 10. APPLICATION UI CONTENT LAYERS (z-index: 10, relative) */}
      <div className="relative z-10 space-y-16 md:space-y-24">
        
        {/* 1. FULL-VIEWPORT CINEMATIC HERO SECTION */}
        <section className="relative min-h-[88vh] sm:min-h-[94vh] flex flex-col justify-center pt-4 pb-10 sm:pt-8 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 text-left space-y-6">
              
              {/* Small Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/15 dark:bg-white/[0.08] border border-violet-500/30 dark:border-white/[0.15] text-xs font-bold text-violet-600 dark:text-violet-300 shadow-sm backdrop-blur-xl"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>✦ AI-Powered Travel Intelligence</span>
              </motion.div>

              {/* Large Heading with Gradient Highlight */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-1"
              >
                <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-slate-900 dark:text-white leading-[1.04] drop-shadow-md">
                  Plan less.<br />
                  Experience{' '}
                  <span className="hero-gradient-text bg-clip-text text-transparent">
                    more.
                  </span>
                </h1>
              </motion.div>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-sm sm:text-base md:text-lg text-slate-700 dark:text-zinc-200 max-w-xl font-medium leading-relaxed drop-shadow"
              >
                Discover places, build intelligent itineraries, and navigate your journey with AI-powered travel intelligence.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3 pt-1"
              >
                <Link
                  to="/discover"
                  className="px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm btn-luxury-primary shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Exploring</span>
                </Link>

                <Link
                  to="/explore"
                  className="px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm cinematic-hero-glass text-slate-800 dark:text-slate-100 hover:bg-white/[0.15] transition-all flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-violet-400" />
                  <span>Explore Destinations</span>
                </Link>
              </motion.div>

            </div>

            {/* Right Hero Visual / Interactive Cinematic Preview */}
            <div className="lg:col-span-5 relative h-[380px] sm:h-[440px] flex items-center justify-center">
              
              {/* Ambient Backlight Orb */}
              <div className="w-80 h-80 rounded-full bg-gradient-to-tr from-violet-600/30 via-red-600/20 to-amber-400/20 blur-[100px] absolute -z-10 animate-pulse-slow pointer-events-none" />

              {/* Central Backdrop Destination Card (Dynamic Destination: Zero Goa Leakage) */}
              <div className="w-full max-w-xs sm:max-w-sm rounded-3xl overflow-hidden cinematic-hero-glass shadow-2xl p-3 relative group">
                <div className="h-44 sm:h-52 rounded-2xl overflow-hidden relative">
                  <img
                    src={currentFeatured.heroImage}
                    alt={currentFeatured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/95 via-[#050505]/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-amber-400 block tracking-wider">
                        Featured Journey
                      </span>
                      <h4 className="text-white font-extrabold font-display text-lg">
                        {currentFeatured.title}
                      </h4>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-600 to-rose-600 text-white font-black text-xs shadow-md shadow-violet-600/30">
                      {currentFeatured.matchScore}% Match
                    </div>
                  </div>
                </div>

                {/* Route Vector Preview */}
                <div className="p-3 pt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{currentFeatured.routeFrom}</span>
                    <Route className="w-3.5 h-3.5 text-rose-500" />
                    <span>{currentFeatured.routeTo}</span>
                  </div>
                  <span className="text-[11px] text-amber-400 font-bold">
                    {currentFeatured.duration}
                  </span>
                </div>
              </div>

              {/* Floating Card 1: AI Recommendation */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                className="absolute -top-2 left-0 p-3 sm:p-3.5 rounded-2xl cinematic-hero-glass shadow-xl w-52 z-20"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider block">AI Intelligence</span>
                    <span className="text-xs font-extrabold text-white">{currentFeatured.optimalSeason}</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 2: Live Flight Badge */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.6 }}
                className="absolute -bottom-4 right-0 p-3 sm:p-3.5 rounded-2xl cinematic-hero-glass shadow-xl w-56 z-20"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5 text-rose-500" />
                    {currentFeatured.flightNumber}
                  </span>
                  <span className="text-amber-400 font-extrabold">{currentFeatured.flightPrice}</span>
                </div>
                <div className="text-[10px] text-zinc-300 mt-0.5">Non-stop verified airfare</div>
              </motion.div>

              {/* Floating Location Marker Pin */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="absolute top-1/2 -right-3 -translate-y-1/2 p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 via-rose-600 to-amber-400 text-white shadow-xl border-2 border-white dark:border-[#050505] z-30"
              >
                <MapPin className="w-5 h-5 fill-brand-navy-950" />
              </motion.div>

            </div>

          </div>
        </section>

        {/* 2. SEARCH EXPERIENCE SECTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <HeroSearch />
      </section>

      {/* 3. POPULAR / RECOMMENDED DESTINATIONS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>Curated Escapes</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight high-contrast-heading">
              Trending Destinations
            </h2>
            <p className="text-xs sm:text-sm text-zinc-200 mt-1 high-contrast-label">
              Real-time flights, verified boutique resorts, and algorithmic itinerary scores.
            </p>
          </div>

          <Link
            to="/discover"
            className="text-xs font-bold text-brand-teal-600 dark:text-brand-teal-400 hover:text-brand-sky-400 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CURATED_DESTINATIONS.map((dest, idx) => (
            <DestinationCard key={idx} destination={dest} />
          ))}
        </div>
      </section>

      {/* 4. DISCOVER AROUND YOU SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>Discover Around You</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight high-contrast-heading">
            AI-curated places worth experiencing.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-200 high-contrast-label">
            Switch city hubs and explore live verified spots from OpenStreetMap and Overpass API.
          </p>
        </div>

        {/* LOCAL BACKDROP BEHIND NAVIGATION */}
        <div className="local-nav-backdrop p-2 sm:p-3">
          {/* DARK GLASS CONTROL BAR CONTAINER */}
          <div className="dark-glass-nav-bar p-3 sm:p-4 space-y-2.5 sm:space-y-3">
            
            {/* ROW 1: DESTINATION PILLS */}
            <div className="flex items-center sm:justify-center gap-2 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
              {['Hyderabad', 'Goa', 'Paris', 'Dubai', 'Singapore', 'Mumbai'].map((city) => {
                const isActive = showcaseCity.toLowerCase() === city.toLowerCase();
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setShowcaseCity(city)}
                    className={`px-4 py-2 rounded-2xl text-xs flex-shrink-0 flex items-center gap-1.5 transition-all ${
                      isActive ? 'destination-pill-active' : 'destination-pill-default'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isActive ? 'text-[#FACC15]' : 'text-white'}`} />
                    <span>{city}</span>
                  </button>
                );
              })}
            </div>

            {/* ROW 2: CATEGORY PILLS (8px–12px vertical spacing) */}
            <div className="flex items-center sm:justify-center gap-2 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
              {DISCOVER_CATEGORIES.map((cat) => {
                const isSelected = showcaseCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setShowcaseCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs flex-shrink-0 flex items-center gap-1.5 transition-all ${
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

        {/* Side-by-Side Discovery & Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Places List */}
          <div className="lg:col-span-5 space-y-3 max-h-[560px] overflow-y-auto pr-1 no-scrollbar">
            {loadingShowcase ? (
              <div className="p-12 text-center text-xs text-zinc-300 space-y-2 cinematic-hero-glass rounded-3xl">
                <Compass className="w-6 h-6 animate-spin text-[#FACC15] mx-auto" />
                <p>Loading verified places in {showcaseCity}...</p>
              </div>
            ) : showcasePlaces.length > 0 ? (
              showcasePlaces.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl cinematic-hero-glass border border-white/[0.14] hover:border-violet-500/50 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 capitalize">
                        {p.category}
                      </span>
                      {p.rating && (
                        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{p.rating}</span>
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                      {p.name}
                    </h4>
                    {p.address && (
                      <p className="text-[11px] text-zinc-300 line-clamp-1">
                        {p.address}
                      </p>
                    )}
                  </div>

                  <Link
                    to="/discover"
                    className="p-2 rounded-xl bg-white/[0.08] hover:bg-gradient-to-r hover:from-violet-600 hover:to-rose-600 hover:text-white text-zinc-200 text-xs font-bold transition-all flex-shrink-0 border border-white/10"
                    title="View on Map"
                  >
                    <Eye className="w-4 h-4 text-[#FACC15]" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-zinc-300 cinematic-hero-glass rounded-3xl">
                No places listed in this category. Try selecting "All".
              </div>
            )}
          </div>

          {/* Right Interactive Leaflet OpenStreetMap */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/[0.08]">
            <LeafletTripMap
              destinationName={showcaseCity}
              center={{ lat: showcaseGeo.lat, lng: showcaseGeo.lng }}
              places={showcasePlaces}
              height="560px"
              showDirectionsBar={true}
              showCategoryFilters={false}
              showSearchBox={false}
            />
          </div>
        </div>
      </section>

      {/* 5. AI TRAVEL PLANNER TEASER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-12 glass-panel border border-slate-200/80 dark:border-white/[0.09] shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Intelligent Decision Engine</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
                Your trip, intelligently planned.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                Tell TripPilot your origin, destination, travel dates, and budget. Our multi-agent travel intelligence dynamically retrieves verified flights, selects boutique hotels, clusters day-by-day maps, and computes your TripPilot Match score.
              </p>

              <div className="pt-2">
                <Link
                  to="/plan"
                  className="px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm btn-luxury-ai shadow-xl shadow-accent-purple/20 inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate My Trip ✦</span>
                </Link>
              </div>
            </div>

            {/* AI Interactive Planning Card Teaser */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 text-white border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-extrabold text-xs tracking-wider uppercase text-brand-teal-400 flex items-center gap-1.5">
                  ✦ TripPilot AI
                </span>
                <span className="text-[10px] text-slate-400">Autonomous Planner</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2.5 text-brand-teal-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Analyzing destination climate & timing...</span>
                </div>
                <div className="flex items-center gap-2.5 text-brand-sky-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finding live Google Flights & Google Hotels...</span>
                </div>
                <div className="flex items-center gap-2.5 text-accent-warm font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Optimizing OpenStreetMap route & itinerary...</span>
                </div>
                <div className="flex items-center gap-2.5 text-purple-400 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Calculating TripPilot Match (0–100%)...</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. AI TRAVEL INSIGHTS ("TRIPPILOT INTELLIGENCE") */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold text-violet-400 uppercase tracking-wider">
            Comprehensive Intelligence
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight high-contrast-heading">
            TripPilot Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-zinc-200 high-contrast-label">
            Six pillars of deterministic travel intelligence built into every journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {AI_INSIGHTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-white/[0.08] shadow-md hover:border-brand-teal-500/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.bgColor} ${item.color} flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold font-display text-base text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      </div>
    </div>
  );
};

export default LandingPage;
