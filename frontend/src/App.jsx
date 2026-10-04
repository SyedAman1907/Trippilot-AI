import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider, useTrip } from './context/TripContext';

// System & Error Boundary
import AppErrorBoundary from './components/system/AppErrorBoundary';
import RouteDebugger from './components/system/RouteDebugger';

// Components
import Navbar from './components/common/Navbar';
import LoadingJourney from './components/common/LoadingJourney';
import AuthModal from './pages/AuthModal';

// Pages
import LandingPage from './pages/LandingPage';
import DiscoverPage from './pages/DiscoverPage';
import SearchPage from './pages/SearchPage';
import DestinationPage from './pages/DestinationPage';
import TripResultPage from './pages/TripResultPage';
import ExploreMapPage from './pages/ExploreMapPage';
import ComparePage from './pages/ComparePage';
import SavedTripsPage from './pages/SavedTripsPage';
import ProfilePage from './pages/ProfilePage';
import ApiHealthPage from './pages/ApiHealthPage';
import GoogleMapsTest from './components/maps/GoogleMapsTest';
import NotFoundPage from './pages/NotFoundPage';

import { Plane, Activity } from 'lucide-react';

const AppContent = () => {
  const { isGenerating } = useTrip();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-white transition-colors duration-300 relative overflow-x-hidden selection:bg-violet-600 selection:text-white">
      {/* Dynamic Animated Loading Overlay */}
      {isGenerating && <LoadingJourney />}

      {/* Global Navbar */}
      <Navbar onOpenAuth={openAuth} />

      {/* Main Routed Content wrapped in Error Boundary */}
      <main className="flex-1">
        <AppErrorBoundary>
          <Routes>
            {/* 1. Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* 2. Trip Builder / Plan Routes */}
            <Route path="/plan" element={<SearchPage />} />
            <Route path="/search" element={<Navigate to="/plan" replace />} />

            {/* 3. Destination Discovery & Intelligence */}
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/destination/:destinationId" element={<DestinationPage />} />
            <Route path="/destination/city/:cityName" element={<DestinationPage />} />

            {/* 4. Trip Result & Subroutes */}
            <Route path="/trip/:tripId" element={<TripResultPage />} />
            <Route path="/trip/:tripId/flights" element={<TripResultPage />} />
            <Route path="/trip/:tripId/hotels" element={<TripResultPage />} />
            <Route path="/trip/:tripId/itinerary" element={<TripResultPage />} />

            {/* 5. Geospatial Exploration & Comparison */}
            <Route path="/explore" element={<ExploreMapPage />} />
            <Route path="/compare" element={<ComparePage />} />

            {/* 6. User Trips, Saved, and Profile */}
            <Route path="/trips" element={<SavedTripsPage />} />
            <Route path="/saved" element={<SavedTripsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* 7. Diagnostic & Testing Tools */}
            <Route path="/api-health" element={<ApiHealthPage />} />
            <Route path="/maps-test" element={<GoogleMapsTest />} />

            {/* 8. Auth aliases */}
            <Route path="/login" element={<LandingPage />} />
            <Route path="/register" element={<LandingPage />} />

            {/* 9. Catch-All 404 (ONLY for undefined routes) */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppErrorBoundary>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Dev Route Debugger */}
      <RouteDebugger />

      {/* Premium Footer */}
      <footer className="border-t border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-xl py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 via-rose-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-md shadow-violet-500/20">
              <Plane className="w-3.5 h-3.5 rotate-[-20deg]" />
            </div>
            <span className="font-display font-bold text-slate-800 dark:text-white">
              TripPilot AI
            </span>
            <span>— Search Less. Decide Better. Travel Smarter.</span>
          </div>

          <div className="flex items-center gap-5 flex-wrap">
            <Link to="/discover" className="hover:text-amber-400 dark:hover:text-amber-300 transition-colors">Discover</Link>
            <Link to="/plan" className="hover:text-amber-400 dark:hover:text-amber-300 transition-colors">Plan Trip</Link>
            <Link to="/compare" className="hover:text-amber-400 dark:hover:text-amber-300 transition-colors">Compare</Link>
            <Link to="/explore" className="hover:text-amber-400 dark:hover:text-amber-300 transition-colors">Map</Link>
            <Link to="/trips" className="hover:text-amber-400 dark:hover:text-amber-300 transition-colors">My Trips</Link>
            <Link to="/api-health" className="hover:text-amber-400 dark:hover:text-amber-300 transition-colors flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              <span>API Health</span>
            </Link>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
              v1.0 Production Ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <Router>
          <AppContent />
        </Router>
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
