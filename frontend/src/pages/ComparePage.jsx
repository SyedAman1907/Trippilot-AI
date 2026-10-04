import React, { useState, useEffect } from 'react';
import { Columns3, Check, RefreshCw } from 'lucide-react';
import CompareTable from '../components/compare/CompareTable';
import api from '../services/api';

const ComparePage = () => {
  const [allDestinations, setAllDestinations] = useState([]);
  const [selectedIds, setSelectedIds] = useState(['dest_goa', 'dest_jaipur', 'dest_kochi']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchExplore = async () => {
      try {
        const res = await api.get('/explore');
        if (isMounted && res.success && res.data?.destinations) {
          setAllDestinations(res.data.destinations);
        }
      } catch (e) {
        if (isMounted) console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchExplore();
    return () => { isMounted = false; };
  }, []);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(prev => prev.filter(i => i !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds(prev => [...prev, id]);
      } else {
        setSelectedIds(prev => [prev[1], prev[2], id]);
      }
    }
  };

  const comparedList = allDestinations.filter(d => selectedIds.includes(d.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-400 text-xs font-semibold mb-2">
          <Columns3 className="w-3.5 h-3.5" />
          <span>Factual Decision Matrix</span>
        </div>
        <h2 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">
          Compare Destinations Side-by-Side
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
          Evaluate flight accessibility, estimated budget totals, hotel tiers, and TripPilot Match across 2 to 3 candidate spots.
        </p>
      </div>

      {/* Destination Selectors */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase mr-2">Select 2–3 Destinations:</span>
        {allDestinations.map(d => {
          const isSelected = selectedIds.includes(d.id);
          return (
            <button
              key={d.id}
              onClick={() => toggleSelect(d.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-brand-teal-500 text-brand-navy-950 font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-brand-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {d.name} {isSelected && '✓'}
            </button>
          );
        })}
      </div>

      {/* Comparison Matrix Component */}
      <CompareTable destinations={comparedList} />
    </div>
  );
};

export default ComparePage;
