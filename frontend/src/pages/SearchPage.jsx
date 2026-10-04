import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plane,
  Building2,
  Compass,
  Utensils,
  Camera,
  Heart,
  Music,
  ShoppingBag,
  Palmtree,
  Mountain,
  Trees,
  Waves,
  ShieldCheck,
  AlertCircle,
  Clock,
  Plus,
  Minus
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { formatCurrency } from '../utils/formatters';

const PERSONALITY_CARDS = [
  { id: 'beach', label: 'Beaches', emoji: '🏖️', icon: Palmtree, desc: 'Sun, sand & coastal vistas' },
  { id: 'mountains', label: 'Mountains', emoji: '🏔️', icon: Mountain, desc: 'Scenic peaks & fresh air' },
  { id: 'food', label: 'Food & Dining', emoji: '🍜', icon: Utensils, desc: 'Culinary tours & local flavors' },
  { id: 'history', label: 'History & Art', emoji: '🏛️', icon: Compass, desc: 'Citadels, museums & heritage' },
  { id: 'nature', label: 'Nature & Wildlife', emoji: '🌿', icon: Trees, desc: 'Lush greenery & serene escapes' },
  { id: 'nightlife', label: 'Nightlife & Parties', emoji: '🎉', icon: Music, desc: 'Clubs, lounges & social scenes' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', icon: ShoppingBag, desc: 'Boutiques, souks & markets' },
  { id: 'photography', label: 'Photography', emoji: '📸', icon: Camera, desc: 'Golden hour vantage points' },
  { id: 'adventure', label: 'Adventure', emoji: '🎢', icon: Waves, desc: 'Trekking & water sports' },
  { id: 'relaxation', label: 'Relaxation & Spa', emoji: '🧘', icon: Sparkles, desc: 'Wellness, yoga & leisure' },
  { id: 'romantic', label: 'Romantic Escapes', emoji: '❤️', icon: Heart, desc: 'Couples sunsets & dining' },
  { id: 'family', label: 'Family Friendly', emoji: '👨‍👩‍👧', icon: Users, desc: 'Fun for all generations' }
];

const BUDGET_STYLES = [
  { id: 'backpacker', label: 'Backpacker', range: '₹12,000 – ₹20,000', emoji: '🎒', desc: 'Hostels, local transit, smart spend' },
  { id: 'balanced', label: 'Balanced', range: '₹25,000 – ₹40,000', emoji: '⚖️', desc: 'Boutique stays, mixed dining, key tours' },
  { id: 'comfortable', label: 'Comfortable', range: '₹45,000 – ₹75,000', emoji: '✨', desc: '4-star resorts, direct flights, fine dining' },
  { id: 'luxury', label: 'Luxury', range: '₹85,000+', emoji: '👑', desc: '5-star beachfront, private cars, exclusive experiences' }
];

const TRAVEL_PACES = [
  { id: 'relaxed', label: 'Relaxed', desc: '1–2 activities per day, plenty of downtime' },
  { id: 'balanced', label: 'Balanced', desc: '3–4 activities per day, comfortable rhythm' },
  { id: 'explorer', label: 'Explorer', desc: '5+ activities per day, see as much as possible' }
];

const DIETARY_OPTIONS = [
  { id: 'no_preference', label: 'No Preference' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'non_vegetarian', label: 'Non-Vegetarian' },
  { id: 'halal', label: 'Halal' },
  { id: 'jain', label: 'Jain' },
  { id: 'gluten_free', label: 'Gluten-Free' },
  { id: 'dairy_free', label: 'Dairy-Free' }
];

export default function SearchPage() {
  const navigate = useNavigate();
  const { generateTrip, isGenerating, loadingStep } = useTrip();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 19);
    return d.toISOString().split('T')[0];
  });

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const [budgetStyle, setBudgetStyle] = useState('balanced');
  const [customBudget, setCustomBudget] = useState(35000);

  const [selectedStyles, setSelectedStyles] = useState([]);
  const [travelPace, setTravelPace] = useState('');
  const [dietary, setDietary] = useState('');

  const [errors, setErrors] = useState({});

  // Calculate duration in nights & days
  const durationNights = Math.max(
    1,
    Math.round((new Date(returnDate) - new Date(departureDate)) / (1000 * 60 * 60 * 24))
  );
  const durationDays = durationNights + 1;
  const totalTravelers = adults + children;

  const toggleStyle = (id) => {
    setSelectedStyles(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
    if (errors.preferences) setErrors(prev => ({ ...prev, preferences: '' }));
  };

  const validateCurrentStep = () => {
    const errs = {};
    if (currentStep === 1) {
      if (!origin || !origin.trim()) errs.origin = 'Please enter your starting location/city.';
      if (!destination || !destination.trim()) errs.destination = 'Please enter destination or type "Anywhere".';
    }
    if (currentStep === 2) {
      if (!departureDate) errs.departureDate = 'Please select departure date.';
      if (!returnDate) errs.returnDate = 'Please select return date.';
    }
    if (currentStep === 3) {
      if (totalTravelers < 1) errs.travelers = 'At least 1 traveler required.';
    }
    if (currentStep === 5) {
      if (selectedStyles.length === 0) {
        errs.preferences = 'Choose at least one preference to personalize your trip.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(totalSteps, prev + 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    try {
      const trip = await generateTrip({
        origin: origin.trim(),
        destination: destination.trim(),
        departureDate,
        returnDate,
        durationDays,
        travelers: totalTravelers,
        rooms,
        budget: customBudget,
        currency: 'INR',
        preferences: selectedStyles,
        travelPace,
        dietary
      });

      const tripId = trip?._id || trip?.id;
      if (!tripId) {
        throw new Error('Trip was created but no trip ID was returned.');
      }
      navigate(`/trip/${tripId}`);
    } catch (err) {
      console.error('[TripPilot] Trip generation failed:', err);
    }
  };


  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-luxury-light-primary dark:text-luxury-dark-primary uppercase tracking-wider flex items-center justify-center gap-1.5 mb-1.5">
          <Sparkles className="w-4 h-4" />
          Intelligent Multi-Factor Trip Builder
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          Design Your Perfect Journey
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Step {currentStep} of {totalSteps} · Tailoring verified flights, hotels, weather, and dining
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-luxury-light-primary to-luxury-light-ocean dark:from-luxury-dark-primary dark:to-luxury-dark-ai"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Form Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: ORIGIN & DESTINATION */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-1">
                  Where are you starting & where do you want to go?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Global cities and destinations supported. Enter "Anywhere" to discover AI-recommended spots.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Starting Location (From)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Hyderabad, Bangalore, Mumbai, Delhi, London"
                      value={origin}
                      onChange={(e) => {
                        setOrigin(e.target.value);
                        setErrors(prev => ({ ...prev, origin: '' }));
                      }}
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                        errors.origin ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-luxury-light-primary dark:text-luxury-dark-primary" />
                  </div>
                  {errors.origin && <p className="text-xs text-red-500 mt-1">{errors.origin}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Destination (To)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Goa, Dubai, Paris, Tokyo, Bali, Anywhere"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        setErrors(prev => ({ ...prev, destination: '' }));
                      }}
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                        errors.destination ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    <Compass className="absolute left-3.5 top-3.5 w-4 h-4 text-luxury-light-ocean dark:text-luxury-dark-ocean" />
                  </div>
                  {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DATES & DURATION */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-1">
                  When are you planning to travel?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculates real flight availability, live hotel rates, and weather forecast alignment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Duration Preview Pill */}
              <div className="p-4 rounded-2xl bg-luxury-light-secondary dark:bg-luxury-dark-secondary border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-luxury-light-primary dark:text-luxury-dark-primary" />
                  Calculated Duration:
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {durationDays} Days / {durationNights} Nights
                </span>
              </div>
            </motion.div>
          )}

          {/* STEP 3: TRAVELERS & ROOMS */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-1">
                  Who is traveling with you?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Explicit headcounts ensure accurate group flights and hotel room capacities.
                </p>
              </div>

              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">Adults</span>
                    <span className="text-xs text-slate-400">Age 13 and older</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-base w-6 text-center text-slate-900 dark:text-white">{adults}</span>
                    <button
                      onClick={() => setAdults(prev => prev + 1)}
                      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">Children</span>
                    <span className="text-xs text-slate-400">Ages 0 to 12</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-base w-6 text-center text-slate-900 dark:text-white">{children}</span>
                    <button
                      onClick={() => setChildren(prev => prev + 1)}
                      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">Hotel Rooms</span>
                    <span className="text-xs text-slate-400">Number of rooms required</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setRooms(prev => Math.max(1, prev - 1))}
                      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-base w-6 text-center text-slate-900 dark:text-white">{rooms}</span>
                    <button
                      onClick={() => setRooms(prev => prev + 1)}
                      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: BUDGET & TRAVEL STYLE */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-1">
                  What is your target budget style?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We itemize flights, stays, food, transit, activities, and emergency buffer.
                </p>
              </div>

              {/* Budget Style Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUDGET_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setBudgetStyle(style.id);
                      if (style.id === 'backpacker') setCustomBudget(18000);
                      if (style.id === 'balanced') setCustomBudget(35000);
                      if (style.id === 'comfortable') setCustomBudget(60000);
                      if (style.id === 'luxury') setCustomBudget(100000);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      budgetStyle === style.id
                        ? 'border-luxury-light-primary dark:border-luxury-dark-primary bg-luxury-light-secondary/60 dark:bg-luxury-dark-secondary/60 shadow-md ring-2 ring-luxury-light-primary/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{style.emoji}</span>
                        {style.label}
                      </span>
                      <span className="text-xs font-semibold text-luxury-light-primary dark:text-luxury-dark-primary">
                        {style.range}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{style.desc}</p>
                  </button>
                ))}
              </div>

              {/* Exact Budget Slider */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Total Group Budget (INR)</span>
                  <span className="font-extrabold text-base text-luxury-light-primary dark:text-luxury-dark-primary">
                    {formatCurrency(customBudget)}
                  </span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={250000}
                  step={2500}
                  value={customBudget}
                  onChange={(e) => setCustomBudget(Number(e.target.value))}
                  className="w-full accent-luxury-light-primary dark:accent-luxury-dark-primary cursor-pointer"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 5: TRAVEL PERSONALITY & PREFERENCES */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    Select your travel personality & preferences
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30">
                    REQUIRED *
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose at least one preference to personalize your trip.
                </p>
                {errors.preferences && (
                  <p className="text-xs font-bold text-rose-500 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.preferences}</span>
                  </p>
                )}
              </div>

              {/* 12 Visual Cards (Prompt Section 13) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {PERSONALITY_CARDS.map(card => {
                  const isSelected = selectedStyles.includes(card.id);
                  return (
                    <button
                      key={card.id}
                      onClick={() => toggleStyle(card.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-violet-500 bg-violet-500/15 shadow-md ring-2 ring-violet-500/20 scale-[1.02]'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-lg mb-1">
                        <span>{card.emoji}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">{card.label}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{card.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Travel Pace & Dietary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Travel Pace
                  </label>
                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
                    {TRAVEL_PACES.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setTravelPace(p.id)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          travelPace === p.id
                            ? 'btn-luxury-primary text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Dietary Preference
                  </label>
                  <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select Dietary Preference (Optional)</option>
                    {DIETARY_OPTIONS.map(d => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: YOUR TRAVEL DNA (Prompt Section 16) */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <span className="text-xs font-bold text-luxury-light-accent dark:text-luxury-dark-accent uppercase tracking-wider">
                  Verified Trip Summary
                </span>
                <h3 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
                  YOUR TRAVEL DNA
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Review your personalized profile before our real travel engine builds your journey.
                </p>
              </div>

              {/* Travel DNA Summary Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-luxury-light-secondary to-white dark:from-luxury-dark-secondary dark:to-luxury-dark-surface border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-luxury-dark-elevated">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Origin</span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{origin}</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-luxury-dark-elevated">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Destination</span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{destination}</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-luxury-dark-elevated">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{durationDays} Days</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-luxury-dark-elevated">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Travelers</span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{totalTravelers} People</span>
                  </div>
                </div>

                {/* Persona Badges */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Active Personalities & Styles
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStyles.map(s => {
                      const found = PERSONALITY_CARDS.find(p => p.id === s);
                      return (
                        <span
                          key={s}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-luxury-dark-elevated text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                          {found?.emoji || '✦'} {found?.label || s}
                        </span>
                      );
                    })}
                    {travelPace && (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        ⚡ {travelPace.toUpperCase()} Pace
                      </span>
                    )}
                    {dietary && (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        🥗 {dietary.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Target Budget */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-luxury-light-primary/10 dark:bg-luxury-dark-primary/10 border border-luxury-light-primary/20 dark:border-luxury-dark-primary/20">
                  <span className="text-xs font-bold text-luxury-light-primary dark:text-luxury-dark-primary">
                    Estimated Target Budget
                  </span>
                  <span className="text-base font-extrabold font-display text-luxury-light-primary dark:text-luxury-dark-primary">
                    {formatCurrency(customBudget)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={currentStep === 5 && selectedStyles.length === 0}
              className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentStep === 5 && selectedStyles.length === 0
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                  : 'btn-luxury-primary shadow-lg hover:scale-105 active:scale-95'
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-8 py-3.5 rounded-2xl text-sm font-extrabold btn-luxury-ai shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Building Journey...' : 'Build My Trip ✦'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading Modal Screen (Prompt Section 75) */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-[#050505]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-amber-400 animate-spin" />
            <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <h3 className="text-2xl font-black font-display tracking-tight hero-gradient-text mb-2">✦ TRIPPILOT AI</h3>
          <p className="text-sm text-slate-300 mb-6 font-medium">Curating your bespoke luxury journey...</p>
          
          <div className="space-y-2.5 text-xs text-slate-300 max-w-sm text-left p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-2 text-violet-300 font-semibold">
              <Check className="w-4 h-4 text-amber-400" />
              <span>Analyzing Travel DNA & preferences</span>
            </div>
            <div className="flex items-center gap-2 text-violet-300 font-semibold">
              <Check className="w-4 h-4 text-amber-400" />
              <span>Querying verified flights & premium hotels</span>
            </div>
            <div className="flex items-center gap-2 text-violet-300 font-semibold">
              <Check className="w-4 h-4 text-amber-400" />
              <span>Retrieving real attractions & gourmet dining intelligence</span>
            </div>
            <div className="flex items-center gap-2 text-violet-300 font-semibold">
              <Check className="w-4 h-4 text-amber-400" />
              <span>Checking live meteorological forecasts</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400 font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-amber-400" />
              <span>Optimizing itinerary schedule & map routing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
