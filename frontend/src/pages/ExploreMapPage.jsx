import React, { useState, useEffect, useCallback } from 'react';
import { Map, Compass, Search, MapPin, RefreshCw } from 'lucide-react';
import LeafletTripMap from '../components/maps/LeafletTripMap';
import { geocodeLocation } from '../services/maps/osmGeocodingService';
import { fetchNearbyPlaces } from '../services/maps/osmPlacesService';
import api from '../services/api';

const QUICK_CITIES = ['Hyderabad', 'Goa', 'Paris', 'Dubai', 'Bangalore', 'Tokyo', 'London', 'New York', 'Kochi', 'Jaipur'];

const ExploreMapPage = () => {
  const [destinationInput, setDestinationInput] = useState('Hyderabad');
  const [activeDestination, setActiveDestination] = useState('Hyderabad');
  const [destinationGeo, setDestinationGeo] = useState({
    name: 'Hyderabad',
    lat: 17.3850,
    lng: 78.4867
  });

  const [places, setPlaces] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (destinationInput.trim()) {
      loadGeospatialData(destinationInput.trim());
    }
  };

  const loadGeospatialData = useCallback(async (targetCity) => {
    const city = targetCity.trim();
    setActiveDestination(city);
    setLoading(true);

    try {
      // 1. Resolve coordinates via OpenStreetMap Nominatim
      const geo = await geocodeLocation(city);
      let lat = 17.3850;
      let lng = 78.4867;

      if (geo && geo.lat && geo.lng) {
        lat = geo.lat;
        lng = geo.lng;
        setDestinationGeo({
          name: geo.name || city,
          lat: geo.lat,
          lng: geo.lng
        });
      }

      // 2. Concurrently fetch dynamic OSM Overpass places & backend hotels
      const [nearbyPlaces, hotelsRes] = await Promise.allSettled([
        fetchNearbyPlaces(lat, lng, 'all', city),
        api.get('/hotels/search', { params: { destination: city } })
      ]);

      const loadedPlaces = nearbyPlaces.status === 'fulfilled' ? nearbyPlaces.value : [];
      const loadedHotels = hotelsRes.status === 'fulfilled' && hotelsRes.value.data?.hotels
        ? hotelsRes.value.data.hotels
        : [];

      setPlaces(loadedPlaces);
      setHotels(loadedHotels);
    } catch (err) {
      console.warn('[TripPilot] Geospatial exploration error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGeospatialData(activeDestination);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Global Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
            <Map className="w-3.5 h-3.5" />
            <span>Global Geospatial Exploration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
            Explore Places & Routes in {destinationGeo?.name || activeDestination}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            100% Free OpenStreetMap visualization with Nominatim geocoding, Overpass nearby spots, and OSRM turn-by-turn routing.
          </p>
        </div>

        {/* Global Destination Search Form */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-rose-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              placeholder="Search any city (e.g. Paris, Tokyo, Dubai)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-luxury-dark-surface text-xs font-medium border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl btn-luxury-primary text-white font-bold text-xs shadow-md shadow-violet-500/20 transition-all flex items-center gap-1.5 flex-shrink-0 disabled:opacity-60"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Explore</span>
          </button>
        </form>
      </div>

      {/* Quick City Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-xs font-bold text-slate-400 uppercase mr-1 flex-shrink-0">Trending:</span>
        {QUICK_CITIES.map(city => (
          <button
            key={city}
            type="button"
            onClick={() => {
              setDestinationInput(city);
              loadGeospatialData(city);
            }}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeDestination.toLowerCase() === city.toLowerCase()
                ? 'bg-gradient-to-r from-violet-600 via-rose-600 to-amber-500 text-white font-extrabold shadow-sm shadow-violet-500/20'
                : 'bg-white dark:bg-luxury-dark-surface border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Fullscreen Interactive Leaflet OpenStreetMap Visualizer */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-[600] bg-slate-950/40 backdrop-blur-sm rounded-3xl flex items-center justify-center">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white dark:bg-luxury-dark-surface border border-slate-200 dark:border-slate-800 shadow-2xl">
              <Compass className="w-5 h-5 text-amber-400 animate-spin" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                Mapping OpenStreetMap data for {destinationGeo?.name || activeDestination}...
              </span>
            </div>
          </div>
        )}

        <LeafletTripMap
          destinationName={destinationGeo?.name || activeDestination}
          center={{ lat: destinationGeo.lat, lng: destinationGeo.lng }}
          places={places}
          hotels={hotels}
          selectedPlace={selectedItem}
          onSelectPlace={(p) => setSelectedItem(p)}
          height="min(75vh, 680px)"
        />
      </div>

    </div>
  );
};

export default ExploreMapPage;
