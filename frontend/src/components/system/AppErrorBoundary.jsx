import React from 'react';
import { AlertCircle, RefreshCw, Home, Compass } from 'lucide-react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log safe error notice without leaking private data
    console.error('[TripPilot AppErrorBoundary] Caught runtime error:', error?.message || error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-brand-navy-950 text-slate-900 dark:text-slate-100">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold font-display text-slate-900 dark:text-white">
                Something went wrong.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                TripPilot is still running, but this section could not load properly.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-brand-navy-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold btn-luxury-primary text-white shadow-md shadow-violet-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-brand-navy-800 hover:bg-slate-200 dark:hover:bg-brand-navy-700 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
