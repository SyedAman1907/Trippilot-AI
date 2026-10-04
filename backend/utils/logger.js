// TripPilot AI Clean Logger
const sanitize = (message) => {
  if (typeof message !== 'string') return message;
  // Mask potential keys or tokens
  return message
    .replace(/(api[_-]?key|secret|token|password)=['"]?[a-zA-Z0-9_\-\.]+['"]?/gi, '$1=***REDACTED***');
};

const logger = {
  info: (msg, ...args) => {
    console.log(`[TripPilot] ✈️ ${sanitize(msg)}`, ...args);
  },
  warn: (msg, ...args) => {
    console.warn(`[TripPilot] ⚠️ ${sanitize(msg)}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`[TripPilot] ❌ ${sanitize(msg)}`, ...args);
  },
  debug: (msg, ...args) => {
    if (process.env.DEBUG === 'true') {
      console.log(`[TripPilot] 🔍 ${sanitize(msg)}`, ...args);
    }
  }
};

module.exports = logger;
