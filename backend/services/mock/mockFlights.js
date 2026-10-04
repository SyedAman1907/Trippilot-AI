const mockFlights = [
  {
    origin: 'HYD',
    destination: 'GOI',
    airline: 'IndiGo',
    flightNumber: '6E-512',
    departure: {
      time: '08:15 AM',
      airport: 'Rajiv Gandhi International (HYD)',
      date: '2026-10-10'
    },
    arrival: {
      time: '09:40 AM',
      airport: 'Goa International (GOI)',
      date: '2026-10-10'
    },
    duration: '1h 25m',
    stops: 0,
    price: 3250,
    currency: 'INR',
    bookingToken: 'mock_token_hyd_goa_01',
    bookingUrl: 'https://www.google.com/travel/flights',
    carbonEmissions: '62 kg'
  },
  {
    origin: 'GOI',
    destination: 'HYD',
    airline: 'IndiGo',
    flightNumber: '6E-515',
    departure: {
      time: '06:30 PM',
      airport: 'Goa International (GOI)',
      date: '2026-10-14'
    },
    arrival: {
      time: '07:55 PM',
      airport: 'Rajiv Gandhi International (HYD)',
      date: '2026-10-14'
    },
    duration: '1h 25m',
    stops: 0,
    price: 3150,
    currency: 'INR',
    bookingToken: 'mock_token_goa_hyd_02',
    bookingUrl: 'https://www.google.com/travel/flights',
    carbonEmissions: '62 kg'
  },
  {
    origin: 'HYD',
    destination: 'JAI',
    airline: 'Air India Express',
    flightNumber: 'IX-192',
    departure: {
      time: '07:00 AM',
      airport: 'Rajiv Gandhi International (HYD)',
      date: '2026-10-10'
    },
    arrival: {
      time: '09:10 AM',
      airport: 'Jaipur International (JAI)',
      date: '2026-10-10'
    },
    duration: '2h 10m',
    stops: 0,
    price: 4400,
    currency: 'INR',
    bookingToken: 'mock_token_hyd_jai_01',
    bookingUrl: 'https://www.google.com/travel/flights',
    carbonEmissions: '88 kg'
  },
  {
    origin: 'HYD',
    destination: 'COK',
    airline: 'Akasa Air',
    flightNumber: 'QP-1422',
    departure: {
      time: '09:30 AM',
      airport: 'Rajiv Gandhi International (HYD)',
      date: '2026-10-10'
    },
    arrival: {
      time: '11:15 AM',
      airport: 'Cochin International (COK)',
      date: '2026-10-10'
    },
    duration: '1h 45m',
    stops: 0,
    price: 3600,
    currency: 'INR',
    bookingToken: 'mock_token_hyd_cok_01',
    bookingUrl: 'https://www.google.com/travel/flights',
    carbonEmissions: '72 kg'
  },
  {
    origin: 'DEL',
    destination: 'GOI',
    airline: 'Vistara',
    flightNumber: 'UK-881',
    departure: {
      time: '10:45 AM',
      airport: 'Indira Gandhi International (DEL)',
      date: '2026-10-10'
    },
    arrival: {
      time: '01:25 PM',
      airport: 'Goa Dabolim (GOI)',
      date: '2026-10-10'
    },
    duration: '2h 40m',
    stops: 0,
    price: 5200,
    currency: 'INR',
    bookingToken: 'mock_token_del_goa_01',
    bookingUrl: 'https://www.google.com/travel/flights',
    carbonEmissions: '105 kg'
  },
  {
    origin: 'BLR',
    destination: 'GOI',
    airline: 'IndiGo',
    flightNumber: '6E-338',
    departure: {
      time: '11:20 AM',
      airport: 'Kempegowda International (BLR)',
      date: '2026-10-10'
    },
    arrival: {
      time: '12:35 PM',
      airport: 'Goa International (GOI)',
      date: '2026-10-10'
    },
    duration: '1h 15m',
    stops: 0,
    price: 2600,
    currency: 'INR',
    bookingToken: 'mock_token_blr_goa_01',
    bookingUrl: 'https://www.google.com/travel/flights',
    carbonEmissions: '54 kg'
  }
];

const getMockFlights = (origin = 'HYD', destination = 'Goa') => {
  const normDest = destination.toLowerCase();
  let code = 'GOI';
  if (normDest.includes('jaipur')) code = 'JAI';
  else if (normDest.includes('kochi') || normDest.includes('cochin')) code = 'COK';
  else if (normDest.includes('pondicherry') || normDest.includes('chennai')) code = 'MAA';

  const matches = mockFlights.filter(f => f.destination === code);
  if (matches.length > 0) return matches;

  // Generate synthetic matching flights for any other city pair
  return [
    {
      origin: origin.slice(0, 3).toUpperCase(),
      destination: destination.slice(0, 3).toUpperCase(),
      airline: 'IndiGo',
      flightNumber: '6E-784',
      departure: {
        time: '09:15 AM',
        airport: `${origin} Airport`,
        date: '2026-10-10'
      },
      arrival: {
        time: '11:20 AM',
        airport: `${destination} Airport`,
        date: '2026-10-10'
      },
      duration: '2h 05m',
      stops: 0,
      price: 3600,
      currency: 'INR',
      bookingToken: 'mock_generated_flight_01',
      bookingUrl: 'https://www.google.com/travel/flights',
      carbonEmissions: '75 kg'
    },
    {
      origin: origin.slice(0, 3).toUpperCase(),
      destination: destination.slice(0, 3).toUpperCase(),
      airline: 'Air India',
      flightNumber: 'AI-429',
      departure: {
        time: '02:45 PM',
        airport: `${origin} Airport`,
        date: '2026-10-10'
      },
      arrival: {
        time: '05:00 PM',
        airport: `${destination} Airport`,
        date: '2026-10-10'
      },
      duration: '2h 15m',
      stops: 0,
      price: 4100,
      currency: 'INR',
      bookingToken: 'mock_generated_flight_02',
      bookingUrl: 'https://www.google.com/travel/flights',
      carbonEmissions: '82 kg'
    }
  ];
};

module.exports = { mockFlights, getMockFlights };
