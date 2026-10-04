import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plane, Building2, Utensils, Car, Compass, ShieldAlert, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const BudgetBreakdown = ({ breakdownData, targetBudget = 25000, travelers = 2 }) => {
  const {
    flights = 6400,
    hotels = 8500,
    food = 3800,
    transport = 2000,
    activities = 3200,
    buffer = 1500,
    estimatedTotal = 25400,
    remainingBudget = -400,
    budgetUtilization = 101
  } = breakdownData || {};

  const chartData = [
    { name: 'Flights', value: flights, color: '#06D6A0', icon: Plane },
    { name: 'Hotels', value: hotels, color: '#6C5CE7', icon: Building2 },
    { name: 'Food & Dining', value: food, color: '#FA8231', icon: Utensils },
    { name: 'Local Transport', value: transport, color: '#3B82F6', icon: Car },
    { name: 'Activities', value: activities, color: '#FF6B6B', icon: Compass },
    { name: 'Safety Buffer', value: buffer, color: '#94A3B8', icon: ShieldAlert }
  ];

  return (
    <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <span className="text-xs font-bold text-brand-teal-500 uppercase tracking-wider">
            Financial Transparency
          </span>
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            Trip Cost & Budget Analysis
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Estimated</span>
          <span className="text-2xl font-extrabold font-display text-brand-teal-500">
            {formatCurrency(estimatedTotal)}
          </span>
          <span className="text-[11px] text-slate-400 block">
            Target: {formatCurrency(targetBudget)} ({travelers} travelers)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Donut Chart */}
        <div className="lg:col-span-5 h-60 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => [formatCurrency(val), 'Cost']}
                contentStyle={{
                  backgroundColor: '#0B132B',
                  borderRadius: '12px',
                  border: '1px solid #1C2541',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text inside donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold font-display text-slate-900 dark:text-white">
              {budgetUtilization}%
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Utilization
            </span>
          </div>
        </div>

        {/* Itemized Line Items */}
        <div className="lg:col-span-7 space-y-2.5">
          {chartData.map((item, idx) => {
            const Icon = item.icon;
            const percentage = Math.round((item.value / estimatedTotal) * 100);
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-brand-navy-900/60 border border-slate-200/60 dark:border-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {percentage}% of trip total
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-display text-slate-900 dark:text-white block">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Budget Margin Status Bar */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">Remaining Cushion:</span>
          <span className={`font-bold ${remainingBudget >= 0 ? 'text-brand-teal-500' : 'text-brand-coral-500'}`}>
            {remainingBudget >= 0 ? `+${formatCurrency(remainingBudget)} under budget` : `${formatCurrency(Math.abs(remainingBudget))} above target`}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 italic">
          *Includes mandatory taxes, buffer cushion & estimated daily transit
        </span>
      </div>

    </div>
  );
};

export default BudgetBreakdown;
