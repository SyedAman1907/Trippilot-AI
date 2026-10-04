import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Plane,
  Compass,
  Map,
  Navigation,
  Bookmark,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  Layers,
  ChevronRight
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import DemoBadge from './DemoBadge';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onOpenAuth }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, quickDemoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'Explore', path: '/explore', icon: Map },
    { name: 'Trips', path: '/trips', icon: Bookmark },
    { name: 'Directions', path: '/explore', icon: Navigation },
    { name: 'AI Planner', path: '/plan', icon: Sparkles, badge: '✦ AI' },
  ];

  const handleDemoClick = async () => {
    try {
      await quickDemoLogin();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 px-3 sm:px-6 lg:px-8 ${
        isScrolled ? 'py-2' : 'py-3 sm:py-4'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto rounded-2xl sm:rounded-3xl transition-all duration-300 border ${
          isScrolled
            ? 'glass-nav shadow-2xl py-2 px-4 sm:px-6 border-slate-200/80 dark:border-white/10'
            : 'glass-nav py-2.5 px-4 sm:px-6 border-slate-200/60 dark:border-white/[0.07]'
        }`}
      >
        <div className="flex items-center justify-between h-12 sm:h-13">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-rose-600 to-amber-400 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-600/25 group-hover:scale-105 transition-transform duration-300">
              <Plane className="w-5 h-5 rotate-[-20deg] text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  TripPilot
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600 via-rose-600 to-amber-500 text-white font-black uppercase tracking-wider shadow-sm">
                  AI ✦
                </span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-400 -mt-0.5 hidden md:inline font-medium">
                Plan less. Experience more.
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 p-1 rounded-2xl bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.05]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-violet-600 to-rose-600 shadow-md shadow-violet-600/30 font-black'
                      : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                  {link.badge && !isActive && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 font-extrabold border border-violet-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xl:block">
              <DemoBadge />
            </div>

            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-brand-navy-900 hover:border-violet-500 transition-colors shadow-sm"
                >
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden sm:inline">
                    {user?.name?.split(' ')[0] || 'Traveler'}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 via-rose-500 to-amber-400 text-white flex items-center justify-center text-xs font-black shadow-inner">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-brand-navy-800"
                    >
                      <User className="w-4 h-4 text-brand-teal-500" />
                      <span>Profile & Preferences</span>
                    </Link>
                    <Link
                      to="/trips"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-brand-navy-800"
                    >
                      <Bookmark className="w-4 h-4 text-brand-sky-400" />
                      <span>Saved Journeys</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={handleDemoClick}
                  title="Quick Sandbox Login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  <span>Demo Login</span>
                </button>
                <button
                  onClick={() => onOpenAuth ? onOpenAuth('login') : navigate('/login')}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 text-white hover:brightness-110 transition-all shadow-md shadow-rose-600/25"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-100 dark:hover:bg-brand-navy-900 border border-slate-200/50 dark:border-white/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-3">
          <div className="pb-2">
            <DemoBadge />
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-rose-600 text-white font-black shadow-md shadow-violet-600/25'
                    : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-brand-navy-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
