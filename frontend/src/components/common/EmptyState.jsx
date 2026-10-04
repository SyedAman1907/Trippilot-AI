import React from 'react';
import { Compass, AlertCircle, RefreshCw } from 'lucide-react';

const EmptyState = ({
  title = 'No Results Found',
  message = 'We could not find matching travel options. Try adjusting your dates, budget, or filters.',
  actionText = 'Reset Filters',
  onAction,
  icon: CustomIcon
}) => {
  const Icon = CustomIcon || Compass;

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-3xl bg-slate-100/60 dark:bg-brand-navy-900/50 border border-slate-200/80 dark:border-slate-800/80 my-4">
      <div className="p-4 rounded-2xl bg-brand-teal-500/10 text-brand-teal-500 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 mb-6">
        {message}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-brand-teal-500 hover:bg-brand-teal-600 text-white shadow-lg shadow-brand-teal-500/20 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
