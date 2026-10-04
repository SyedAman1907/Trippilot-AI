import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [currentTrip, setCurrentTrip] = useState(() => {
    try {
      const cached = sessionStorage.getItem('trippilot_active_trip') || localStorage.getItem('trippilot_active_trip');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  const [savedTrips, setSavedTrips] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [serverHealth, setServerHealth] = useState(null);

  // Check health on startup
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res.success) {
          setServerHealth(res);
        }
      } catch (e) {
        console.warn('Backend health check error:', e);
      }
    };
    checkHealth();
  }, []);

  // Persist current trip to storage
  useEffect(() => {
    if (currentTrip) {
      const tripId = currentTrip._id || currentTrip.id;
      if (tripId) {
        localStorage.setItem('lastTripId', tripId);
      }
      sessionStorage.setItem('trippilot_active_trip', JSON.stringify(currentTrip));
      localStorage.setItem('trippilot_active_trip', JSON.stringify(currentTrip));
    }
  }, [currentTrip]);

  const searchSteps = [
    'Analyzing travel preferences...',
    'Querying live Google Flights...',
    'Finding Google Hotels with verified deep links...',
    'Discovering authentic spots & culinary guides...',
    'Checking weather & building smart itinerary...'
  ];

  // Parse natural language search
  const parseQuery = async (query) => {
    const res = await api.post('/ai/parse', { query });
    return res.data || res.parsed || res;
  };

  // Generate trip with animated progress steps
  const generateTrip = async (searchParams) => {
    if (isGenerating) return currentTrip;

    setIsGenerating(true);
    setError(null);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < searchSteps.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await api.post('/trips/generate', searchParams);
      clearInterval(interval);
      setLoadingStep(searchSteps.length - 1);

      const tripPayload = res.trip || res.data;
      if (!tripPayload) {
        throw new Error('Trip was not returned by the server.');
      }

      const tripId = tripPayload._id || tripPayload.id;
      if (!tripId) {
        throw new Error('Trip was created but no trip ID was returned.');
      }

      // Ensure both id and _id exist on trip object
      const normalizedTrip = {
        ...tripPayload,
        id: tripId,
        _id: tripId
      };

      setCurrentTrip(normalizedTrip);
      localStorage.setItem('lastTripId', tripId);
      sessionStorage.setItem('trippilot_active_trip', JSON.stringify(normalizedTrip));
      setIsGenerating(false);

      return normalizedTrip;
    } catch (err) {
      clearInterval(interval);
      setIsGenerating(false);
      setError(err.message || 'Failed to generate trip itinerary.');
      throw err;
    }
  };

  // Fetch trip by ID (supports refresh and direct URL links)
  const getTripById = useCallback(async (tripId) => {
    if (!tripId || tripId === 'undefined' || tripId === 'null') {
      const error = new Error('Invalid trip ID');
      error.code = 'INVALID_TRIP_ID';
      throw error;
    }

    // 1. If currently in memory with matching ID, return immediately
    if (currentTrip && (currentTrip.id === tripId || currentTrip._id === tripId)) {
      return currentTrip;
    }

    // 2. Check local/session storage cache
    try {
      const cached = sessionStorage.getItem('trippilot_active_trip') || localStorage.getItem('trippilot_active_trip');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.id === tripId || parsed._id === tripId)) {
          setCurrentTrip(parsed);
          return parsed;
        }
      }
    } catch (e) {
      // proceed to API fetch
    }

    // 3. Fetch from Backend API
    try {
      const res = await api.get(`/trips/${tripId}`);
      const tripData = res.trip || res.data;
      if (tripData) {
        const normalized = {
          ...tripData,
          id: tripData._id || tripData.id || tripId,
          _id: tripData._id || tripData.id || tripId
        };
        setCurrentTrip(normalized);
        sessionStorage.setItem('trippilot_active_trip', JSON.stringify(normalized));
        localStorage.setItem('lastTripId', normalized.id);
        return normalized;
      }
    } catch (err) {
      throw err;
    }

    const notFoundError = new Error('Trip not found');
    notFoundError.code = 'TRIP_NOT_FOUND';
    throw notFoundError;
  }, [currentTrip]);

  // What-If Simulation
  const simulateWhatIf = async (action) => {
    if (!currentTrip) return null;
    try {
      const res = await api.post('/trips/what-if', {
        action,
        currentTrip
      });
      if (res.success && res.data?.mutatedTrip) {
        setCurrentTrip(res.data.mutatedTrip);
        return res.data;
      }
    } catch (err) {
      console.error('What-if error:', err);
      throw err;
    }
  };

  // AI Assistant Chat
  const chatWithAssistant = async (message) => {
    try {
      const res = await api.post('/ai/chat', {
        message,
        currentTrip
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // Save trip to database / profile
  const saveCurrentTrip = async () => {
    if (!currentTrip) return;
    try {
      const res = await api.post('/trips', currentTrip);
      const saved = res.trip || res.data;
      if (saved) {
        setSavedTrips(prev => [saved, ...prev.filter(t => (t.id !== saved.id && t._id !== saved._id))]);
        return saved;
      }
    } catch (err) {
      throw err;
    }
  };

  // Load saved trips
  const fetchSavedTrips = async () => {
    try {
      const res = await api.get('/trips');
      const tripsList = res.trips || res.data;
      if (tripsList) {
        setSavedTrips(tripsList);
      }
    } catch (err) {
      console.warn('Failed to fetch saved trips:', err.message);
    }
  };

  // Delete saved trip
  const removeSavedTrip = async (id) => {
    try {
      await api.delete(`/trips/${id}`);
      setSavedTrips(prev => prev.filter(t => (t._id !== id && t.id !== id)));
    } catch (err) {
      throw err;
    }
  };

  // Reset current trip state for new journeys
  const resetCurrentTrip = () => {
    setCurrentTrip(null);
    sessionStorage.removeItem('trippilot_active_trip');
    localStorage.removeItem('trippilot_active_trip');
  };

  return (
    <TripContext.Provider
      value={{
        currentTrip,
        setCurrentTrip,
        resetCurrentTrip,
        getTripById,
        savedTrips,
        isGenerating,
        loadingStep,
        searchSteps,
        error,
        serverHealth,
        isDemoMode: serverHealth?.demoMode ?? false,
        parseQuery,
        generateTrip,
        simulateWhatIf,
        chatWithAssistant,
        saveCurrentTrip,
        fetchSavedTrips,
        removeSavedTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
