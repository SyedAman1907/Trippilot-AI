import { Loader } from '@googlemaps/js-api-loader';

let loaderInstance = null;
let googleMapsPromise = null;
let authFailureListenerAttached = false;

/**
 * Setup global Google Maps auth failure handler
 * Google Maps triggers window.gm_authFailure when an API key is invalid, unbilled, or unauthorized
 */
function setupAuthFailureHandler() {
  if (typeof window === 'undefined' || authFailureListenerAttached) return;

  const originalAuthFailure = window.gm_authFailure;
  window.gm_authFailure = function () {
    console.warn('[TripPilot] Google Maps authentication failed (billing, key restriction, or invalid key). Falling back gracefully.');
    window.dispatchEvent(new CustomEvent('google-maps-auth-failure', {
      detail: { message: 'Google Maps authentication failed. Please verify API key, billing, and HTTP referrer restrictions.' }
    }));
    if (typeof originalAuthFailure === 'function') {
      originalAuthFailure();
    }
  };
  authFailureListenerAttached = true;
}

/**
 * Get Google Maps API key safely without exposing it in logs or errors
 */
export function getGoogleMapsApiKey() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key || key.trim() === '' || key === 'YOUR_REPLACEMENT_GOOGLE_MAPS_KEY' || key === 'YOUR_NEW_ROTATED_KEY' || key === 'YOUR_NEW_GOOGLE_MAPS_KEY') {
    return null;
  }
  return key.trim();
}

/**
 * Check if a valid Google Maps API key is configured
 */
export function isGoogleMapsConfigured() {
  return Boolean(getGoogleMapsApiKey());
}

/**
 * Check if the window.google.maps object is ready in browser
 */
export function isGoogleMapsLoaded() {
  return typeof window !== 'undefined' && Boolean(window.google?.maps);
}

/**
 * Load Google Maps JavaScript API with singleton promise
 */
export async function loadGoogleMaps() {
  setupAuthFailureHandler();

  if (isGoogleMapsLoaded()) {
    return window.google.maps;
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    const error = new Error('Google Maps is not configured. Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env');
    error.code = 'KEY_MISSING';
    throw error;
  }

  loaderInstance = new Loader({
    apiKey: apiKey,
    version: 'weekly',
    libraries: ['places', 'geometry', 'marker']
  });

  googleMapsPromise = loaderInstance
    .load()
    .then(() => {
      return window.google.maps;
    })
    .catch((err) => {
      googleMapsPromise = null; // Allow retry on failure
      const error = new Error(`Failed to load Google Maps: ${err.message || 'Unknown network/API error'}`);
      error.code = 'LOAD_FAILED';
      error.originalError = err;
      throw error;
    });

  return googleMapsPromise;
}
