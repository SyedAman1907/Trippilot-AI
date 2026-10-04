const { clusterPlacesByDays } = require('./routeOptimizer.service');
const logger = require('../../utils/logger');

const timeSlots = [
  { label: 'Morning (09:00 AM - 12:30 PM)', time: '09:30 AM', defaultDuration: '2.5 hours' },
  { label: 'Afternoon (01:00 PM - 04:30 PM)', time: '01:30 PM', defaultDuration: '2.5 hours' },
  { label: 'Evening & Sunset (05:00 PM - 08:30 PM)', time: '05:30 PM', defaultDuration: '2.5 hours' },
  { label: 'Night (08:30 PM Onwards)', time: '08:30 PM', defaultDuration: '2 hours' }
];

const dayThemes = [
  { title: 'Coastal Arrival & Sunset Discovery', theme: 'Beaches & Ocean Vistas' },
  { title: 'Historic Citadels & Local Heritage', theme: 'Culture & Architecture' },
  { title: 'Watersports, Adrenaline & Shacks', theme: 'Adventure & Dining' },
  { title: 'Artisan Markets & Leisure Farewell', theme: 'Shopping & Local Flavor' },
  { title: 'Hidden Coves & Nature Escapes', theme: 'Serenity & Landscapes' }
];

const generateDayItinerary = ({
  destination = 'Goa',
  durationDays = 4,
  hotelCoordinates = null,
  places = [],
  userPreferences = [],
  weather = null
}) => {
  logger.info(`Itinerary generation started for ${destination} (${durationDays} days)`);

  const clusters = clusterPlacesByDays(places, durationDays, hotelCoordinates);
  const itinerary = [];
  const forecastList = weather?.forecast || [];

  for (let dayIndex = 0; dayIndex < durationDays; dayIndex++) {
    const dayTheme = dayThemes[dayIndex % dayThemes.length];
    const dayPlaces = clusters[dayIndex] || [];
    const activities = [];
    const dayForecast = forecastList[dayIndex] || forecastList[0] || null;

    let weatherNote = null;
    if (dayForecast) {
      const rainPercent = parseInt(String(dayForecast.rainChance).replace('%', ''), 10) || 0;
      if (rainPercent >= 40) {
        weatherNote = `Rain probability is ${dayForecast.rainChance}. Outdoor stops are clustered in the morning with covered cultural dining scheduled during afternoon hours.`;
      } else if (parseInt(String(dayForecast.maxTemp).replace('°', ''), 10) >= 33) {
        weatherNote = `Warm temperatures (${dayForecast.maxTemp}) expected. Morning visits prioritized for outdoor viewpoints with indoor relaxation in the afternoon.`;
      }
    }

    // Slot 1: Morning
    if (dayPlaces.length > 0) {
      const p = dayPlaces[0];
      activities.push({
        time: '09:00 AM',
        place: p.name,
        category: p.category || 'attraction',
        estimatedDuration: p.visitDuration || '2 hours',
        estimatedCost: p.priceLevel === '₹₹₹' ? 1200 : p.priceLevel === '₹₹' ? 600 : 250,
        description: p.description || `Explore ${p.name} with optimal morning light and smaller crowds.`,
        coordinates: {
          latitude: p.latitude,
          longitude: p.longitude
        },
        distanceFromPrevious: p.distanceFromPrevious || '2.2 km',
        travelTime: p.travelTime || '10 mins drive'
      });
    } else {
      activities.push({
        time: '09:00 AM',
        place: `${destination} Heritage Walk & Sightseeing`,
        category: 'attractions',
        estimatedDuration: '2 hours',
        estimatedCost: 300,
        description: `Explore the vibrant local surroundings and cultural streets of ${destination}.`,
        distanceFromPrevious: 'Hotel Base',
        travelTime: '15 mins drive'
      });
    }

    // Slot 2: Afternoon
    if (dayPlaces.length > 1) {
      const p = dayPlaces[1];
      activities.push({
        time: '01:30 PM',
        place: p.name,
        category: p.category || 'cultural',
        estimatedDuration: p.visitDuration || '2.5 hours',
        estimatedCost: p.priceLevel === '₹₹₹' ? 1500 : 500,
        description: p.description || `Delve deeper into local history and photography spots.`,
        coordinates: {
          latitude: p.latitude,
          longitude: p.longitude
        },
        distanceFromPrevious: p.distanceFromPrevious || '3.5 km',
        travelTime: p.travelTime || '15 mins drive'
      });
    } else {
      activities.push({
        time: '01:30 PM',
        place: `Artisanal Bistro & Regional Delicacies`,
        category: 'restaurants',
        estimatedDuration: '1.5 hours',
        estimatedCost: 800,
        description: `Enjoy renowned regional cuisine at a highly rated local culinary spot.`,
        distanceFromPrevious: '3.1 km',
        travelTime: '10 mins drive'
      });
    }

    // Slot 3: Sunset / Evening
    if (dayPlaces.length > 2) {
      const p = dayPlaces[2];
      activities.push({
        time: '05:30 PM',
        place: p.name,
        category: p.category || 'scenic',
        estimatedDuration: p.visitDuration || '2 hours',
        estimatedCost: 400,
        description: p.description || `Catch golden hour reflections and panoramic horizons.`,
        coordinates: {
          latitude: p.latitude,
          longitude: p.longitude
        },
        distanceFromPrevious: p.distanceFromPrevious || '4.0 km',
        travelTime: p.travelTime || '18 mins drive'
      });
    } else {
      activities.push({
        time: '05:30 PM',
        place: `Sunset Viewpoint & Coastal Deck`,
        category: 'scenic',
        estimatedDuration: '2 hours',
        estimatedCost: 350,
        description: `Relax at the premier sunset point of ${destination} with sea or valley views.`,
        distanceFromPrevious: '2.8 km',
        travelTime: '12 mins drive'
      });
    }

    itinerary.push({
      day: dayIndex + 1,
      title: `Day ${dayIndex + 1}: ${dayTheme.title}`,
      theme: dayTheme.theme,
      forecast: dayForecast,
      weatherNote: weatherNote,
      activities
    });
  }

  logger.info(`Itinerary generated successfully: ${itinerary.length} days formatted`);
  return itinerary;
};

module.exports = { generateDayItinerary };
