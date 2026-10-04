import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Plane, 
  Building2, 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Users, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Minus, 
  LocateFixed, 
  Loader2,
  Compass
} from 'lucide-react';
import FlightCard from '../components/travel/FlightCard';
import HotelCard from '../components/travel/HotelCard';
import PlaceCard from '../components/destination/PlaceCard';
import ReviewSummary from '../components/destination/ReviewSummary';
import MapView from '../components/map/MapView';
import { useTrip } from '../context/TripContext';
import { formatCurrency } from '../utils/formatters';
import { formatDestinationName } from '../utils/slugUtils';
import api from '../services/api';

const DestinationPage = () => {
  const { destinationId, cityName } = useParams();
  const rawDest = destinationId || cityName || '';
  const resolvedCityName = formatDestinationName(rawDest) || 'Destination';

  const navigate = useNavigate();
  const { generateTrip, isGenerating } = useTrip();

  const [destinationData, setDestinationData] = useState(null);
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [places, setPlaces] = useState([]);
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedHotelIndex, setSelectedHotelIndex] = useState(0);
  const [selectedMapPlace, setSelectedMapPlace] = useState(null);

  const handleViewOnMap = (place) => {
    if (!place) return;
    setSelectedMapPlace(place);
    const mapSection = document.getElementById('interactive-map-section');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Trip building modal state
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [origin, setOrigin] = useState('');
  const [travelers, setTravelers] = useState(null);
  const [durationDays, setDurationDays] = useState(4);
  const [budget, setBudget] = useState(25000);
  const [errors, setErrors] = useState({});
  const [isLocating, setIsLocating] = useState(false);

  // Stale request guard sequence
  const reqSeq = useRef(0);

  useEffect(() => {
    const currentSeq = ++reqSeq.current;

    // Immediately clear previous city content to prevent mixed destination state (Section 21)
    setDestinationData(null);
    setHotels([]);
    setPlaces([]);
    setReviews(null);
    setSelectedMapPlace(null);
    setSelectedHotelIndex(0);
    setLoading(true);

    const loadCityData = async () => {
      try {
        const [geoRes, hotelsRes, placesRes, reviewsRes] = await Promise.all([
          api.get(`/destination/resolve?destination=${encodeURIComponent(resolvedCityName)}`).catch(() => null),
          api.get(`/hotels/search?destination=${encodeURIComponent(resolvedCityName)}`).catch(() => null),
          api.get(`/places/search?destination=${encodeURIComponent(resolvedCityName)}&category=attractions`).catch(() => null),
          api.get(`/reviews/${encodeURIComponent(resolvedCityName)}`).catch(() => null)
        ]);

        if (currentSeq !== reqSeq.current) return; // Discard stale responses (Section 22)

        const resolvedGeo = geoRes?.data || {
          name: resolvedCityName,
          country: 'Global Destination',
          tagline: `Experience the sights, culture, and cuisine of ${resolvedCityName}.`,
          heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
          initialMatchScore: 92
        };

        const hotelsData = hotelsRes?.data?.hotels || [];
        const placesData = placesRes?.data?.places || [];
        const reviewsData = reviewsRes?.data || null;

        setDestinationData(resolvedGeo);
        setHotels(hotelsData);
        setPlaces(placesData);
        setReviews(reviewsData);
      } catch (err) {
        if (currentSeq === reqSeq.current) {
          console.error('Error loading destination:', err);
        }
      } finally {
        if (currentSeq === reqSeq.current) {
          setLoading(false);
        }
      }
    };

    loadCityData();
  }, [cityName, resolvedCityName]);

  // Geolocation helper
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, origin: 'Geolocation is not supported.' }));
      return;
    }
    setIsLocating(true);
    setErrors(prev => ({ ...prev, origin: '' }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`, {
            headers: { 'Accept-Language': 'en' }
          });
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.county || 'My Location';
          setOrigin(city);
        } catch (e) {
          setOrigin('Current Location');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setErrors(prev => ({ ...prev, origin: 'Location permission denied. Please enter starting city.' }));
      },
      { timeout: 10000 }
    );
  };

  const handleOpenBuildModal = () => {
    setErrors({});
    setShowBuildModal(true);
  };

  const handleBuildMyTrip = async (e) => {
    e?.preventDefault();
    const newErrors = {};

    if (!origin || !origin.trim()) {
      newErrors.origin = 'Please enter your starting location.';
    }

    const numTravelers = Number(travelers);
    if (!travelers || isNaN(numTravelers) || numTravelers < 1) {
      newErrors.travelers = 'Please select the number of travelers (at least 1).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const trip = await generateTrip({
        origin: origin.trim(),
        destination: resolvedCityName,
        durationDays: Number(durationDays),
        travelers: Number(travelers),
        budget: Number(budget),
        preferences: ['sightseeing', 'culture', 'food']
      });
      setShowBuildModal(false);
      const tripId = trip?._id || trip?.id;
      if (!tripId) {
        throw new Error('Trip was created but no trip ID was returned.');
      }
      navigate(`/trip/${tripId}`);
    } catch (e) {
      console.error('Trip generation error:', e);
      setErrors({ general: e.message || 'Failed to generate trip itinerary.' });
    }

  };

  const selectedHotel = hotels[selectedHotelIndex] || hotels[0] || null;

  if (loading && !destinationData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="relative mb-2">
          <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-amber-400 animate-spin" />
          <Compass className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight hero-gradient-text">
            Analyzing {resolvedCityName}...
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Retrieving verified hotels, authentic attractions, and real traveler sentiment for {resolvedCityName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discovery</span>
      </button>

      {/* Hero Destination Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 sm:h-96">
        <img
          src={destinationData?.heroImage || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80'}
          alt={cityName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-950 via-brand-navy-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white border border-white/20 text-xs font-bold shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>TripPilot Match: {destinationData?.initialMatchScore || 94}%</span>
          </div>
        </div>

        {/* Hero Bottom Info */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{destinationData?.country || 'Global Destination'}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
              {cityName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
              {destinationData?.tagline || `Discover handpicked stays, flights, and hotspots in ${cityName}.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenBuildModal}
              className="px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm btn-luxury-primary text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-105"
            >
              Build My Trip to {cityName}
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Stays Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-violet-500" />
            <span>Live Hotels & Stays in {cityName} ({hotels.length})</span>
          </h3>
          {hotels.length > 0 && (
            <span className="text-xs text-emerald-500 font-bold uppercase">● LIVE GOOGLE HOTELS</span>
          )}
        </div>

        {hotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hotels.slice(0, 6).map((h, idx) => (
              <HotelCard
                key={h.id || idx}
                hotel={h}
                nights={4}
                isSelected={selectedHotelIndex === idx}
                onSelect={() => setSelectedHotelIndex(idx)}
                onViewOnMap={handleViewOnMap}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-slate-100 dark:bg-brand-navy-900/50 text-center text-xs text-slate-500">
            {loading ? 'Searching live Google Hotels...' : 'No live hotels found for this destination.'}
          </div>
        )}
      </div>

      {/* Review Sentiment Analysis */}
      {reviews && <ReviewSummary reviewData={reviews} />}

      {/* Interactive Destination Map */}
      <div id="interactive-map-section">
        <MapView
          destinationName={resolvedCityName}
          hotel={selectedHotel}
          hotels={hotels}
          places={places}
          destinationCenter={destinationData}
          selectedPlace={selectedMapPlace}
        />
      </div>

      {/* Top Places & Attractions */}
      <div>
        <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-4">
          Top Places & Experiences in {resolvedCityName} ({places.length})
        </h3>
        {places.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {places.map((place, idx) => (
              <PlaceCard
                key={idx}
                place={place}
                onViewOnMap={handleViewOnMap}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-slate-100 dark:bg-brand-navy-900/50 text-center text-xs text-slate-500">
            {loading ? 'Searching live places via SerpApi Maps...' : 'No places found.'}
          </div>
        )}
      </div>

      {/* BUILD TRIP MODAL (Asking for Source & Travelers) */}
      {showBuildModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-white/20 dark:border-slate-700 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-extrabold font-display text-slate-900 dark:text-white">
                  Build Trip to {cityName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Please provide your starting location and traveler count
                </p>
              </div>
            </div>

            {errors.general && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleBuildMyTrip} className="space-y-4">
              {/* Origin */}
              <div className={`p-3.5 rounded-2xl bg-white dark:bg-brand-navy-900 border ${
                errors.origin ? 'border-red-500 ring-1 ring-red-500/50' : 'border-slate-200 dark:border-slate-700'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Where are you traveling from?
                  </label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="text-[10px] text-brand-teal-500 font-semibold flex items-center gap-1"
                  >
                    {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />}
                    <span>Locate me</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-teal-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => {
                      setOrigin(e.target.value);
                      if (errors.origin) setErrors(prev => ({ ...prev, origin: '' }));
                    }}
                    placeholder="e.g. Hyderabad, Bangalore, Mumbai, Paris"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-white focus:outline-none"
                    autoFocus
                  />
                </div>
                {errors.origin && (
                  <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.origin}</span>
                  </p>
                )}
              </div>

              {/* Travelers */}
              <div className={`p-3.5 rounded-2xl bg-white dark:bg-brand-navy-900 border ${
                errors.travelers ? 'border-red-500 ring-1 ring-red-500/50' : 'border-slate-200 dark:border-slate-700'
              }`}>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  How many travelers?
                </label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-violet-500 flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {travelers ? `${travelers} ${travelers === 1 ? 'Traveler' : 'Travelers'}` : 'Select count'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-brand-navy-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(1, (travelers || 2) - 1);
                        setTravelers(next);
                        if (errors.travelers) setErrors(prev => ({ ...prev, travelers: '' }));
                      }}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-brand-navy-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 shadow-sm"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-extrabold text-slate-900 dark:text-white">
                      {travelers || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.min(20, (travelers || 0) + 1);
                        setTravelers(next);
                        if (errors.travelers) setErrors(prev => ({ ...prev, travelers: '' }));
                      }}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-brand-navy-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {errors.travelers && (
                  <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.travelers}</span>
                  </p>
                )}
              </div>

              {/* Duration & Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-slate-700">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Duration</label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value={3} className="dark:bg-brand-navy-900">3 Days</option>
                    <option value={4} className="dark:bg-brand-navy-900">4 Days</option>
                    <option value={5} className="dark:bg-brand-navy-900">5 Days</option>
                    <option value={7} className="dark:bg-brand-navy-900">7 Days</option>
                  </select>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-slate-700">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Budget (INR)</label>
                  <input
                    type="number"
                    step="1000"
                    min="5000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBuildModal(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-brand-navy-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 py-3 px-6 rounded-xl font-bold text-sm btn-luxury-primary text-white shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Building Trip...</span>
                    </>
                  ) : (
                    <>
                      <span>Build My Trip</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default DestinationPage;
