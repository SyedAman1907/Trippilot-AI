const mockDestinations = [
  {
    id: 'dest_goa',
    name: 'Goa',
    state: 'Goa',
    country: 'India',
    tagline: 'Sun-kissed beaches, Portuguese heritage & electric nightlife',
    description: 'A coastal paradise blending golden sands, vibrant beach shacks, historic Latin quarters, and thrilling watersports.',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    tags: ['beach', 'adventure', 'nightlife', 'food', 'relaxation'],
    baseFlightCost: 3200,
    baseHotelPerNight: 2800,
    typicalDailyExpense: 1800,
    weather: {
      temperature: '29°C',
      condition: 'Sunny with coastal breeze',
      bestSeason: 'Oct – Mar'
    },
    coordinates: {
      latitude: 15.2993,
      longitude: 74.1240
    },
    highlights: ['Baga Beach', 'Aguada Fort', 'Dudhsagar Falls', 'Fontainhas']
  },
  {
    id: 'dest_hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    tagline: 'City of Pearls, majestic forts, and world-renowned Nizami cuisine',
    description: 'A vibrant heritage metropolis where centuries-old Qutb Shahi architecture meets gleaming tech parks, lakes, and the legendary aroma of Hyderabadi biryani.',
    heroImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
    tags: ['culture', 'heritage', 'food', 'shopping', 'architecture'],
    baseFlightCost: 3500,
    baseHotelPerNight: 3200,
    typicalDailyExpense: 1600,
    weather: {
      temperature: '28°C',
      condition: 'Warm & pleasant',
      bestSeason: 'Oct – Mar'
    },
    coordinates: {
      latitude: 17.3850,
      longitude: 78.4867
    },
    highlights: ['Charminar', 'Golconda Fort', 'Chowmahalla Palace', 'Hussain Sagar Lake']
  },
  {
    id: 'dest_jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    tagline: 'The Pink City of forts, palaces, and vibrant bazaars',
    description: 'Immerse yourself in royal Rajputana grandeur with iconic pink sandstone architecture, hilltop forts, and mouthwatering delicacies.',
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    tags: ['culture', 'history', 'food', 'shopping', 'architecture'],
    baseFlightCost: 4400,
    baseHotelPerNight: 3900,
    typicalDailyExpense: 1500,
    weather: {
      temperature: '26°C',
      condition: 'Pleasant & clear',
      bestSeason: 'Oct – Mar'
    },
    coordinates: {
      latitude: 26.9124,
      longitude: 75.7873
    },
    highlights: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Chokhi Dhani']
  },
  {
    id: 'dest_kochi',
    name: 'Kochi',
    state: 'Kerala',
    country: 'India',
    tagline: 'Queen of the Arabian Sea, spice markets & backwater trails',
    description: 'A fascinating seaside melting pot of Chinese fishing nets, colonial spice warehouses, Dutch palaces, and serene backwaters.',
    heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    tags: ['nature', 'culture', 'relaxation', 'food'],
    baseFlightCost: 3600,
    baseHotelPerNight: 3200,
    typicalDailyExpense: 1600,
    weather: {
      temperature: '28°C',
      condition: 'Tropical & breezy',
      bestSeason: 'Sep – Mar'
    },
    coordinates: {
      latitude: 9.9312,
      longitude: 76.2673
    },
    highlights: ['Chinese Fishing Nets', 'Fort Kochi', 'Mattancherry Palace', 'Kumbalangi']
  },
  {
    id: 'dest_pondicherry',
    name: 'Pondicherry',
    state: 'Puducherry',
    country: 'India',
    tagline: 'French Quarter lanes, seaside promenades & spiritual serenity',
    description: 'Cobblestone streets lined with mustard-yellow colonial houses, quaint French bakeries, quiet beaches, and the peace of Auroville.',
    heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    tags: ['relaxation', 'food', 'culture', 'beach'],
    baseFlightCost: 3800,
    baseHotelPerNight: 3100,
    typicalDailyExpense: 1400,
    weather: {
      temperature: '27°C',
      condition: 'Gentle breeze',
      bestSeason: 'Oct – Mar'
    },
    coordinates: {
      latitude: 11.9416,
      longitude: 79.8083
    },
    highlights: ['Promenade Beach', 'French Quarter', 'Auroville', 'Paradise Beach']
  },
  {
    id: 'dest_udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    tagline: 'City of Lakes, floating marble palaces & romantic sunsets',
    description: 'Set amidst the Aravalli Hills with shimmering lakes, grand marble courtyards, and rooftop lakeside dining.',
    heroImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    tags: ['romantic', 'culture', 'luxury', 'history'],
    baseFlightCost: 4600,
    baseHotelPerNight: 4200,
    typicalDailyExpense: 1900,
    weather: {
      temperature: '25°C',
      condition: 'Sunny & calm',
      bestSeason: 'Sep – Mar'
    },
    coordinates: {
      latitude: 24.5854,
      longitude: 73.7125
    },
    highlights: ['City Palace', 'Lake Pichola', 'Jag Mandir', 'Saheliyon-ki-Bari']
  }
];

module.exports = { mockDestinations };
