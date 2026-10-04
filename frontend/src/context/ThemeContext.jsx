import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme') || localStorage.getItem('trippilot_theme');
        if (saved === 'light' || saved === 'dark') {
          return saved;
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      }
    } catch {
      // Safe fallback if localStorage/window is inaccessible
    }
    return 'dark'; // Sleek dark default
  });

  useEffect(() => {
    try {
      const isDarkMode = theme === 'dark';
      document.documentElement.classList.toggle('dark', isDarkMode);
      document.documentElement.dataset.theme = theme;
      localStorage.setItem('theme', theme);
      localStorage.setItem('trippilot_theme', theme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}

export { ThemeContext };
export default useTheme;
