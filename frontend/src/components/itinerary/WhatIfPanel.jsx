import React, { useState } from 'react';
import { Sparkles, ArrowRight, TrendingDown, Users, CalendarPlus, Hotel, Compass, RefreshCw } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { formatCurrency } from '../../utils/formatters';

const WhatIfPanel = () => {
  const { simulateWhatIf } = useTrip();
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  const simulationOptions = [
    { id: 'REDUCE_BUDGET_5K', label: 'Reduce budget by ₹5,000', icon: TrendingDown, desc: 'Optimizes stays and daily activities' },
    { id: 'ADD_TRAVELER', label: 'Add 1 traveler', icon: Users, desc: 'Recalculates shared rooming & flights' },
    { id: 'EXTEND_ONE_DAY', label: 'Extend by 1 day', icon: CalendarPlus, desc: 'Generates an extra leisure day' },
    { id: 'UPGRADE_HOTEL', label: 'Upgrade to luxury resort', icon: Hotel, desc: 'Swaps stay to 5-star heritage villa' },
  ];

  const handleSimulate = async (actionId) => {
    setIsSimulating(true);
    setActiveAction(actionId);
    try {
      const res = await simulateWhatIf(actionId);
      if (res) {
        setSimulationResult(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-coral-500/10 text-brand-coral-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              "What If?" Travel Simulator
            </h3>
            <p className="text-xs text-slate-400">
              Test trip mutations with deterministic financial recalculations
            </p>
          </div>
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {simulationOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = activeAction === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleSimulate(opt.id)}
              disabled={isSimulating}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-brand-teal-500/10 border-brand-teal-500 text-brand-teal-700 dark:text-brand-teal-300 shadow-md'
                  : 'bg-white dark:bg-brand-navy-900 border-slate-200/80 dark:border-slate-800 hover:border-brand-teal-500/40 text-slate-700 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-4 h-4 text-brand-teal-500" />
                <span className="text-xs font-bold font-display">{opt.label}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">{opt.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Simulation Result Diff Card */}
      {simulationResult && (
        <div className="mt-5 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">BEFORE</span>
                <span className="text-base font-bold line-through text-slate-400">
                  {formatCurrency(simulationResult.beforeTotal)}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-teal-400" />
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-teal-400 block">AFTER</span>
                <span className="text-xl font-extrabold font-display text-white">
                  {formatCurrency(simulationResult.afterTotal)}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">NET FINANCIAL CHANGE</span>
              <span className={`text-base font-bold font-display ${
                simulationResult.change < 0 ? 'text-brand-teal-400' : 'text-brand-coral-400'
              }`}>
                {simulationResult.change < 0 ? '' : '+'}
                {formatCurrency(simulationResult.change)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-3 flex items-start gap-2">
            <span className="text-brand-teal-400 font-bold">•</span>
            <span>{simulationResult.explanation}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default WhatIfPanel;
