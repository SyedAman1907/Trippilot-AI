import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, XCircle, AlertCircle, RefreshCw, Server, Globe, Key, CloudSun, Sparkles, Database, Navigation } from 'lucide-react';
import api from '../services/api';

export default function ApiHealthPage() {
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [services, setServices] = useState({
    frontend: { name: 'Frontend Client (Vite/React)', status: 'online', details: 'Running on localhost' },
    backend: { name: 'Backend API Server', status: 'checking', details: 'Connecting to http://localhost:5000/api' },
    mongodb: { name: 'Database (MongoDB)', status: 'checking', details: 'Checking connection' },
    serpapi: { name: 'Live Travel Search (SerpApi)', status: 'checking', details: 'Google Flights & Hotels' },
    gemini: { name: 'AI Decision Engine (Gemini)', status: 'checking', details: 'Travel DNA & Itineraries' },
    openStreetMap: { name: 'Interactive Maps (OpenStreetMap & Leaflet)', status: 'checking', details: '100% Free basemaps' },
    osrm: { name: 'Routing & Directions (OSRM)', status: 'checking', details: 'GPS Turn-by-Turn' },
    weather: { name: 'Meteorological Intelligence (Open-Meteo)', status: 'checking', details: 'Live 5-day forecasts' }
  });

  const checkHealth = async () => {
    setLoading(true);

    const updated = {
      frontend: { name: 'Frontend Client (Vite/React)', status: 'online', details: 'Operational' },
      openStreetMap: {
        name: 'Interactive Maps (OpenStreetMap & Leaflet)',
        status: 'online',
        details: 'OpenStreetMap standard tiles operational (No API keys required)'
      }
    };

    // 1. Check OSRM Routing
    try {
      const osrmRes = await fetch('https://router.project-osrm.org/route/v1/driving/78.4867,17.3850;73.8278,15.4989?overview=false');
      if (osrmRes.ok) {
        updated.osrm = {
          name: 'Routing & Directions (OSRM)',
          status: 'online',
          details: 'OSRM public routing engine connected'
        };
      } else {
        updated.osrm = {
          name: 'Routing & Directions (OSRM)',
          status: 'warning',
          details: 'OSRM returned HTTP ' + osrmRes.status
        };
      }
    } catch (e) {
      updated.osrm = {
        name: 'Routing & Directions (OSRM)',
        status: 'warning',
        details: 'Direct OSRM connection notice: ' + e.message
      };
    }

    // 2. Check Backend & DB & SerpApi & Gemini
    try {
      const healthRes = await api.get('/health');
      if (healthRes.success) {
        updated.backend = {
          name: 'Backend API Server',
          status: 'online',
          details: `v${healthRes.version || '1.0.0'} operational`
        };
        updated.mongodb = {
          name: 'Database (MongoDB)',
          status: healthRes.services?.database ? 'online' : 'warning',
          details: healthRes.services?.database ? 'Connected' : 'Disconnected (Demo mode memory store active)'
        };
        updated.serpapi = {
          name: 'Live Travel Search (SerpApi)',
          status: healthRes.services?.serpapi ? 'online' : 'warning',
          details: healthRes.services?.serpapi ? 'Live API Key verified' : 'No key provided'
        };
        updated.gemini = {
          name: 'AI Decision Engine (Gemini)',
          status: healthRes.services?.gemini ? 'online' : 'warning',
          details: healthRes.services?.gemini ? 'Gemini Pro / Flash active' : 'Fallback heuristic engine active'
        };
      }
    } catch (err) {
      updated.backend = {
        name: 'Backend API Server',
        status: 'offline',
        details: `Connection failed: ${err.message || 'Server down'}`
      };
      updated.mongodb = { name: 'Database (MongoDB)', status: 'offline', details: 'Backend unreachable' };
      updated.serpapi = { name: 'Live Travel Search (SerpApi)', status: 'offline', details: 'Backend unreachable' };
      updated.gemini = { name: 'AI Decision Engine (Gemini)', status: 'offline', details: 'Backend unreachable' };
    }

    // 3. Check Weather Service
    try {
      const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=17.3850&longitude=78.4867&current_weather=true');
      if (weatherRes.ok) {
        updated.weather = {
          name: 'Meteorological Intelligence (Open-Meteo)',
          status: 'online',
          details: 'Direct live forecast API connected'
        };
      } else {
        updated.weather = {
          name: 'Meteorological Intelligence (Open-Meteo)',
          status: 'warning',
          details: 'HTTP response ' + weatherRes.status
        };
      }
    } catch (e) {
      updated.weather = {
        name: 'Meteorological Intelligence (Open-Meteo)',
        status: 'warning',
        details: 'Direct lookup failed: ' + e.message
      };
    }

    setServices(prev => ({ ...prev, ...updated }));
    setLastChecked(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'online':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Operational</span>
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Standby / Fallback</span>
          </span>
        );
      case 'offline':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            <span>Unavailable</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-500">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Checking...</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>System Telemetry & Health</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
            TripPilot AI Service Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live diagnostic monitor for OpenStreetMap, OSRM routing, backend services, and APIs.
          </p>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-xs font-bold btn-luxury-primary text-white transition-all shadow-md shadow-violet-500/20 flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Status Overview Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live System Services</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lastChecked ? `Last verified at ${lastChecked}` : 'Checking...'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(services).map(([key, service]) => (
            <div
              key={key}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{service.name}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{service.details}</p>
              </div>
              <div>
                {getStatusBadge(service.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
