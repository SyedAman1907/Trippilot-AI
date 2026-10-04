import React, { useEffect, useState } from 'react';
import { Compass, RefreshCw, CheckCircle2, Navigation, MapPin } from 'lucide-react';
import LeafletTripMap from './LeafletTripMap';
import { geocodeLocation } from '../../services/maps/osmGeocodingService';
import { calculateRoute } from '../../services/maps/osrmRoutingService';

export default function GoogleMapsTest() {
  const [status, setStatus] = useState('loading');
  const [testResults, setTestResults] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  const runDiagnostics = async () => {
    setStatus('loading');
    const results = [];

    // Test 1: Geocoding
    try {
      const geo = await geocodeLocation('Hyderabad');
      if (geo && geo.lat) {
        results.push({ name: 'Nominatim Geocoding (Hyderabad)', status: 'PASS', detail: `${geo.lat}, ${geo.lng}` });
      } else {
        results.push({ name: 'Nominatim Geocoding', status: 'FAIL', detail: 'Could not geocode Hyderabad' });
      }
    } catch (e) {
      results.push({ name: 'Nominatim Geocoding', status: 'FAIL', detail: e.message });
    }

    // Test 2: OSRM Routing (Hyderabad -> Goa)
    try {
      const route = await calculateRoute('Hyderabad', 'Goa', 'DRIVING');
      if (route && route.success) {
        setRouteInfo(route);
        results.push({ name: 'OSRM Routing (Hyderabad → Goa)', status: 'PASS', detail: `${route.distance} • ${route.duration}` });
      } else {
        results.push({ name: 'OSRM Routing', status: 'FAIL', detail: 'Route failed' });
      }
    } catch (e) {
      results.push({ name: 'OSRM Routing', status: 'FAIL', detail: e.message });
    }

    setTestResults(results);
    setStatus('success');
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>OpenStreetMap & OSRM Engine Diagnostics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
            Geospatial Diagnostics Test
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verifying 100% free OpenStreetMap tile loading, Nominatim geocoding, and OSRM turn-by-turn routing.
          </p>
        </div>

        <button
          onClick={runDiagnostics}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold btn-luxury-primary text-white shadow-md shadow-violet-500/20 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
          <span>Rerun Tests</span>
        </button>
      </div>

      {/* Diagnostics Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {testResults.map((t, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">{t.name}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.detail}</span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${t.status === 'PASS' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600'}`}>
              {t.status}
            </span>
          </div>
        ))}
      </div>

      {/* Interactive Map Visualizer */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Navigation className="w-4 h-4 text-indigo-500" />
          <span>Live OSRM Route Visualization (Hyderabad → Goa)</span>
        </h4>
        <LeafletTripMap
          originName="Hyderabad"
          destinationName="Goa"
          initialRoute={routeInfo}
          height="460px"
        />
      </div>
    </div>
  );
}
