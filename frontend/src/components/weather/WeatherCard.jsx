import React from 'react';
import { CloudRain, Wind, Droplets, Thermometer, Sun, AlertTriangle, CloudSun, ShieldAlert } from 'lucide-react';

export default function WeatherCard({ weather }) {
  if (!weather) return null;

  const {
    destination,
    temperature,
    tempFormatted,
    condition,
    emoji,
    feelsLike,
    humidity,
    windSpeed,
    rainChance,
    forecast = [],
    alerts = []
  } = weather;

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-luxury-light-ocean dark:text-luxury-dark-ocean uppercase tracking-wider flex items-center gap-1">
              <CloudSun className="w-4 h-4" />
              Real-Time Weather Intelligence
            </span>
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
            {destination} Climate & Forecast
          </h3>
        </div>

        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Meteorological Data
        </span>
      </div>

      {/* Main Temperature & Conditions Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-luxury-light-secondary to-white dark:from-luxury-dark-secondary dark:to-luxury-dark-surface border border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="text-5xl sm:text-6xl drop-shadow-sm select-none">
            {emoji || '☀️'}
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white">
              {tempFormatted || `${temperature}°C`}
            </div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {condition}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Feels like {feelsLike}
            </div>
          </div>
        </div>

        {/* Vital Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-luxury-dark-elevated/70 border border-slate-200/50 dark:border-slate-700/50 text-center">
            <Droplets className="w-4 h-4 text-sky-500 mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-slate-400 block">Humidity</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{humidity}</span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-luxury-dark-elevated/70 border border-slate-200/50 dark:border-slate-700/50 text-center">
            <Wind className="w-4 h-4 text-teal-500 mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-slate-400 block">Wind Speed</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{windSpeed}</span>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-luxury-dark-elevated/70 border border-slate-200/50 dark:border-slate-700/50 text-center">
            <CloudRain className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-slate-400 block">Rain Chance</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{rainChance}</span>
          </div>
        </div>
      </div>

      {/* Weather Alerts (Rain/Heat notices) */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
                alert.type === 'rain'
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-300'
                  : alert.type === 'heat'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
                  : 'bg-violet-500/10 border-violet-500/20 text-violet-700 dark:text-violet-300'
              }`}
            >
              <div className="text-lg flex-shrink-0 mt-0.5">{alert.icon}</div>
              <div>
                <span className="font-bold block mb-0.5">{alert.title}</span>
                <span>{alert.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5-Day Forecast Strip */}
      {forecast.length > 0 && (
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            5-Day Travel Outlook
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {forecast.map((f, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white/70 dark:bg-luxury-dark-elevated/50 border border-slate-200/60 dark:border-slate-700/60 text-center flex flex-col items-center justify-between hover:border-luxury-light-primary/40 dark:hover:border-luxury-dark-primary/40 transition-all"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.day}</span>
                <span className="text-2xl my-1.5">{f.emoji || '☀️'}</span>
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{f.maxTemp}</span>
                  <span className="text-slate-400">{f.minTemp}</span>
                </div>
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold mt-1">
                  🌧️ {f.rainChance}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
