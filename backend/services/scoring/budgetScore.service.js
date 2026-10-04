const logger = require('../../utils/logger');

const calculateBudgetBreakdown = ({
  targetBudget = 25000,
  travelers = 1,
  durationDays = 4,
  flightCostPerPerson = 3200,
  hotelPricePerNight = 2800,
  roomsNeeded = null,
  tripStyle = 'balanced'
}) => {
  const nights = Math.max(1, durationDays - 1);
  const calculatedRooms = roomsNeeded || Math.ceil(travelers / 2);

  // Flight cost is per person for round-trip
  const totalFlights = Math.round(flightCostPerPerson * travelers * 2);

  // Hotel cost is per room for the entire duration
  const totalHotels = Math.round(hotelPricePerNight * nights * calculatedRooms);

  // Daily allowances adjusted for style
  let foodPerDayPerPerson = 750;
  let transportPerDayPerPerson = 350;
  let activityPerDayPerPerson = 600;

  if (tripStyle === 'budget') {
    foodPerDayPerPerson = 500;
    transportPerDayPerPerson = 250;
    activityPerDayPerPerson = 350;
  } else if (tripStyle === 'luxury') {
    foodPerDayPerPerson = 1500;
    transportPerDayPerPerson = 800;
    activityPerDayPerPerson = 1200;
  }

  const totalFood = Math.round(foodPerDayPerPerson * durationDays * travelers);
  const totalTransport = Math.round(transportPerDayPerPerson * durationDays * travelers);
  const totalActivities = Math.round(activityPerDayPerPerson * durationDays * travelers);

  // Safety buffer (roughly 5-7% of total)
  const subtotal = totalFlights + totalHotels + totalFood + totalTransport + totalActivities;
  const buffer = Math.round(subtotal * 0.06);

  const estimatedTotal = subtotal + buffer;
  const remainingBudget = targetBudget - estimatedTotal;
  const budgetUtilization = Math.round((estimatedTotal / targetBudget) * 100);

  // Compute budget match score (0 - 100)
  // Perfect match when utilization is between 80% and 100%
  let budgetMatch = 90;
  if (estimatedTotal <= targetBudget) {
    if (budgetUtilization >= 75 && budgetUtilization <= 100) {
      budgetMatch = 96;
    } else if (budgetUtilization < 75) {
      budgetMatch = 88; // Way under budget is still good, but maybe under-utilized
    }
  } else {
    // Over budget penalty
    const overageRatio = (estimatedTotal - targetBudget) / targetBudget;
    budgetMatch = Math.max(30, Math.round(90 - (overageRatio * 150)));
  }

  return {
    breakdown: {
      flights: totalFlights,
      hotels: totalHotels,
      food: totalFood,
      transport: totalTransport,
      activities: totalActivities,
      buffer: buffer,
      estimatedTotal,
      remainingBudget,
      budgetUtilization
    },
    meta: {
      flightCostPerPerson,
      hotelPricePerNight,
      numberOfNights: nights,
      roomsNeeded: calculatedRooms,
      travelers,
      durationDays
    },
    budgetMatch
  };
};

module.exports = { calculateBudgetBreakdown };
