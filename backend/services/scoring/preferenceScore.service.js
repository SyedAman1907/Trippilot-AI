const calculatePreferenceMatch = (userPreferences = [], destinationTags = [], activities = []) => {
  if (!userPreferences || userPreferences.length === 0) {
    return 85; // Sensible default when user specifies generic trip
  }

  const normalizedUserPrefs = userPreferences.map(p => String(p).toLowerCase().trim());
  const allDestinationFeatures = [
    ...(destinationTags || []),
    ...(activities || [])
  ].map(t => String(t).toLowerCase().trim());

  let matchCount = 0;
  normalizedUserPrefs.forEach(pref => {
    const isDirectMatch = allDestinationFeatures.some(feat => feat.includes(pref) || pref.includes(feat));
    if (isDirectMatch) {
      matchCount += 1;
    }
  });

  const ratio = matchCount / normalizedUserPrefs.length;
  // Base 60 + ratio scaled to 40
  const score = Math.round(60 + (ratio * 38));
  return Math.min(99, Math.max(40, score));
};

module.exports = { calculatePreferenceMatch };
