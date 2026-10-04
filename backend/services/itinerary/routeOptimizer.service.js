// Haversine Distance Formula in Kilometers
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 3.5; // default fallback km

  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

// Estimate city drive time based on distance (avg speed 25 km/h in bustling tourist hubs)
const estimateTravelTime = (distanceKm) => {
  if (distanceKm < 1) return '5-10 mins walk / drive';
  const minutes = Math.round((distanceKm / 25) * 60) + 5;
  if (minutes < 60) return `${minutes} mins drive`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return `${hours}h ${remMin}m drive`;
};

// Cluster places by proximity using greedy nearest-neighbor clustering
const optimizePlaceSequencing = (places = [], startCoordinates = null) => {
  if (!places || places.length <= 1) return places;

  const unvisited = [...places];
  const ordered = [];

  let currentCoord = startCoordinates || {
    latitude: places[0].latitude,
    longitude: places[0].longitude
  };

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const p = unvisited[i];
      const dist = calculateHaversineDistance(
        currentCoord.latitude,
        currentCoord.longitude,
        p.latitude,
        p.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const nextPlace = unvisited.splice(nearestIndex, 1)[0];
    const distFromPrev = calculateHaversineDistance(
      currentCoord.latitude,
      currentCoord.longitude,
      nextPlace.latitude,
      nextPlace.longitude
    );

    ordered.push({
      ...nextPlace,
      distanceFromPrevious: `${distFromPrev} km`,
      travelTime: estimateTravelTime(distFromPrev)
    });

    currentCoord = {
      latitude: nextPlace.latitude,
      longitude: nextPlace.longitude
    };
  }

  return ordered;
};

// Partition places into N days grouping geographically nearby items
const clusterPlacesByDays = (places = [], daysCount = 3, hotelCoords = null) => {
  if (!places || places.length === 0) return [];

  const count = Math.max(1, daysCount);
  const itemsPerDay = Math.ceil(places.length / count);
  const sequenced = optimizePlaceSequencing(places, hotelCoords);

  const clusteredDays = [];
  for (let d = 0; d < count; d++) {
    const dayItems = sequenced.slice(d * itemsPerDay, (d + 1) * itemsPerDay);
    if (dayItems.length > 0) {
      clusteredDays.push(dayItems);
    }
  }

  return clusteredDays;
};

module.exports = {
  calculateHaversineDistance,
  estimateTravelTime,
  optimizePlaceSequencing,
  clusterPlacesByDays
};
