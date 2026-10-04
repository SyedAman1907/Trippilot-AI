const mockPlaces = {
  goa: [
    {
      id: 'p_goa_01',
      name: 'Baga Beach & Watersports Hub',
      category: 'attractions',
      rating: 4.6,
      reviews: 14200,
      address: 'Baga, North Goa 403516',
      latitude: 15.5553,
      longitude: 73.7517,
      openingHours: 'Open 24 hours (Water sports: 9 AM - 6 PM)',
      priceLevel: '₹₹',
      thumbnail: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      description: 'Lively beach famous for parasailing, jet skiing, vibrant shacks and beachside music.',
      visitDuration: '3 hours',
      bestFor: ['beaches', 'adventure', 'nightlife']
    },
    {
      id: 'p_goa_02',
      name: 'Aguada Fort & Lighthouse',
      category: 'attractions',
      rating: 4.5,
      reviews: 28500,
      address: 'Sinquerim, Candolim, Goa 403515',
      latitude: 15.4924,
      longitude: 73.7737,
      openingHours: '9:30 AM – 5:30 PM',
      priceLevel: '₹',
      thumbnail: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&w=800&q=80',
      description: '17th-century Portuguese fort offering panoramic vistas of the Arabian Sea and historic lighthouse.',
      visitDuration: '2 hours',
      bestFor: ['culture', 'sunset', 'nature']
    },
    {
      id: 'p_goa_03',
      name: 'Curlies Beach Shack & Sunset Deck',
      category: 'restaurants',
      rating: 4.4,
      reviews: 8900,
      address: 'Anjuna Beach, Anjuna, Goa 403509',
      latitude: 15.5786,
      longitude: 73.7408,
      openingHours: '8:30 AM – 3:00 AM',
      priceLevel: '₹₹',
      thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      description: 'Iconic beachfront institution renowned for Goan prawn curry, woodfired pizzas, and electric sunset views.',
      visitDuration: '2.5 hours',
      bestFor: ['food', 'nightlife', 'sunset']
    }
  ],
  hyderabad: [
    {
      id: 'p_hyd_01',
      name: 'Charminar Heritage Plaza & Laad Bazaar',
      category: 'attractions',
      rating: 4.7,
      reviews: 42000,
      address: 'Charminar Rd, Char Kaman, Ghansi Bazaar, Hyderabad 500002',
      latitude: 17.3616,
      longitude: 78.4747,
      openingHours: '9:30 AM – 5:30 PM',
      priceLevel: '₹',
      thumbnail: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=800&q=80',
      description: 'Iconic 16th-century mosque with four grand minarets, surrounded by the bustling pearl and bangle markets.',
      visitDuration: '2.5 hours',
      bestFor: ['culture', 'history', 'photography']
    },
    {
      id: 'p_hyd_02',
      name: 'Golconda Fort Sound & Light Arena',
      category: 'attractions',
      rating: 4.6,
      reviews: 38000,
      address: 'Khair Complex, Ibrahim Bagh, Hyderabad 500008',
      latitude: 17.3833,
      longitude: 78.4011,
      openingHours: '9:00 AM – 5:30 PM',
      priceLevel: '₹₹',
      thumbnail: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      description: 'Magnificent medieval citadel famous for its acoustic engineering, diamond vault history, and panoramic views.',
      visitDuration: '3 hours',
      bestFor: ['history', 'architecture']
    },
    {
      id: 'p_hyd_03',
      name: 'Paradise Biryani & Nizami Kitchen',
      category: 'restaurants',
      rating: 4.5,
      reviews: 52000,
      address: 'SD Road, Sappu Bagh Apartment, Secunderabad, Hyderabad 500003',
      latitude: 17.4411,
      longitude: 78.4984,
      openingHours: '11:30 AM – 11:30 PM',
      priceLevel: '₹₹',
      thumbnail: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      description: 'World-famous culinary destination serving authentic dum biryani, mirchi ka salan, and double ka meetha.',
      visitDuration: '1.5 hours',
      bestFor: ['food', 'dining']
    },
    {
      id: 'p_hyd_04',
      name: 'Hussain Sagar Lake & Buddha Statue Promenade',
      category: 'attractions',
      rating: 4.4,
      reviews: 21000,
      address: 'Tank Bund Road, Hyderabad 500029',
      latitude: 17.4239,
      longitude: 78.4738,
      openingHours: 'Open 24 hours (Boating: 9 AM - 8 PM)',
      priceLevel: '₹',
      thumbnail: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      description: 'Heart-shaped lake featuring the giant monolithic Buddha statue and scenic sunset boat cruises.',
      visitDuration: '2 hours',
      bestFor: ['nature', 'relaxation', 'sunset']
    }
  ],
  bangalore: [
    {
      id: 'p_blr_01',
      name: 'Lalbagh Botanical Gardens & Glass House',
      category: 'attractions',
      rating: 4.6,
      reviews: 36000,
      address: 'Mavalli, Bengaluru 560004',
      latitude: 12.9507,
      longitude: 77.5848,
      openingHours: '6:00 AM – 7:00 PM',
      priceLevel: '₹',
      thumbnail: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
      description: 'Historical 240-acre botanical haven showcasing century-old trees and an iconic London Crystal Palace-inspired conservatory.',
      visitDuration: '2.5 hours',
      bestFor: ['nature', 'photography']
    },
    {
      id: 'p_blr_02',
      name: 'Bangalore Palace & Royal Grounds',
      category: 'attractions',
      rating: 4.4,
      reviews: 29000,
      address: 'Vasanth Nagar, Bengaluru 560052',
      latitude: 12.9988,
      longitude: 77.5921,
      openingHours: '10:00 AM – 5:30 PM',
      priceLevel: '₹₹₹',
      thumbnail: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      description: 'Tudor-style royal estate with fortified towers, stained glass, woodcarvings, and vintage memorabilia.',
      visitDuration: '2 hours',
      bestFor: ['history', 'culture']
    },
    {
      id: 'p_blr_03',
      name: 'MTR (Mavalli Tiffin Room) Heritage Cafe',
      category: 'restaurants',
      rating: 4.6,
      reviews: 41000,
      address: '14, Lal Bagh Main Rd, Bengaluru 560027',
      latitude: 12.9554,
      longitude: 77.5855,
      openingHours: '6:30 AM – 9:30 PM',
      priceLevel: '₹₹',
      thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      description: 'Legendary 1924 institution celebrated for crispy rava idlis, masala dosas, and pure filter coffee.',
      visitDuration: '1.5 hours',
      bestFor: ['food', 'breakfast']
    }
  ],
  mumbai: [
    {
      id: 'p_mum_01',
      name: 'Gateway of India & Colaba Boardwalk',
      category: 'attractions',
      rating: 4.7,
      reviews: 65000,
      address: 'Apollo Bandar, Colaba, Mumbai 400001',
      latitude: 18.9220,
      longitude: 72.8347,
      openingHours: 'Open 24 hours',
      priceLevel: 'Free',
      thumbnail: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
      description: 'Iconic 20th-century Indo-Saracenic arch monument overlooking the Arabian Sea and Taj Mahal Palace.',
      visitDuration: '2 hours',
      bestFor: ['culture', 'sightseeing']
    },
    {
      id: 'p_mum_02',
      name: 'Marine Drive Queens Necklace Promenade',
      category: 'attractions',
      rating: 4.8,
      reviews: 58000,
      address: 'Netaji Subhash Chandra Bose Road, Mumbai 400020',
      latitude: 18.9432,
      longitude: 72.8230,
      openingHours: 'Open 24 hours',
      priceLevel: 'Free',
      thumbnail: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800&q=80',
      description: '3.6-kilometer arc-shaped boulevard along the South Mumbai coast, famous for sparkling evening views.',
      visitDuration: '2 hours',
      bestFor: ['sunset', 'relaxation']
    }
  ],
  delhi: [
    {
      id: 'p_del_01',
      name: 'Qutub Minar & Mehrauli Complex',
      category: 'attractions',
      rating: 4.7,
      reviews: 55000,
      address: 'Seth Sarai, Mehrauli, New Delhi 110030',
      latitude: 28.5244,
      longitude: 77.1855,
      openingHours: '7:00 AM – 5:00 PM',
      priceLevel: '₹₹',
      thumbnail: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      description: 'UNESCO World Heritage 73-meter red sandstone minaret with intricately carved Islamic inscriptions.',
      visitDuration: '2.5 hours',
      bestFor: ['history', 'culture']
    },
    {
      id: 'p_del_02',
      name: 'Humayuns Tomb & Charbagh Gardens',
      category: 'attractions',
      rating: 4.6,
      reviews: 42000,
      address: 'Mathura Rd, Nizamuddin East, New Delhi 110013',
      latitude: 28.5933,
      longitude: 77.2507,
      openingHours: '6:00 AM – 6:00 PM',
      priceLevel: '₹₹',
      thumbnail: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=800&q=80',
      description: 'Sublime Mughal garden tomb designed by Persian architects, which inspired the Taj Mahal.',
      visitDuration: '2 hours',
      bestFor: ['architecture', 'photography']
    }
  ],
  paris: [
    {
      id: 'p_par_01',
      name: 'Eiffel Tower & Champ de Mars',
      category: 'attractions',
      rating: 4.8,
      reviews: 88000,
      address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris, France',
      latitude: 48.8584,
      longitude: 2.2945,
      openingHours: '9:00 AM – 11:45 PM',
      priceLevel: '€€',
      thumbnail: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
      description: 'World-famous 330m iron lattice tower offering breathtaking panoramic vistas of Paris.',
      visitDuration: '3 hours',
      bestFor: ['sightseeing', 'photography', 'romantic']
    },
    {
      id: 'p_par_02',
      name: 'Louvre Museum & Glass Pyramid',
      category: 'attractions',
      rating: 4.8,
      reviews: 95000,
      address: 'Rue de Rivoli, 75001 Paris, France',
      latitude: 48.8606,
      longitude: 2.3376,
      openingHours: '9:00 AM – 6:00 PM',
      priceLevel: '€€',
      thumbnail: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=800&q=80',
      description: 'The worlds largest art museum and historic royal palace housing the Mona Lisa and Venus de Milo.',
      visitDuration: '4 hours',
      bestFor: ['art', 'culture', 'history']
    }
  ],
  dubai: [
    {
      id: 'p_dxb_01',
      name: 'Burj Khalifa & Dubai Fountain Boardwalk',
      category: 'attractions',
      rating: 4.8,
      reviews: 92000,
      address: '1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, UAE',
      latitude: 25.1972,
      longitude: 55.2744,
      openingHours: '8:30 AM – 11:00 PM',
      priceLevel: 'AED €€€',
      thumbnail: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      description: 'Worlds tallest building soaring 828 meters, featuring sky-high observation decks and synchronized water shows.',
      visitDuration: '3 hours',
      bestFor: ['architecture', 'luxury', 'views']
    }
  ],
  singapore: [
    {
      id: 'p_sin_01',
      name: 'Gardens by the Bay & Supertree Grove',
      category: 'attractions',
      rating: 4.8,
      reviews: 74000,
      address: '18 Marina Gardens Dr, Singapore 018953',
      latitude: 1.2816,
      longitude: 103.8636,
      openingHours: '5:00 AM – 2:00 AM',
      priceLevel: 'S$',
      thumbnail: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
      description: 'Futuristic 101-hectare nature park featuring towering vertical gardens and climate-controlled Flower Domes.',
      visitDuration: '3.5 hours',
      bestFor: ['nature', 'futuristic', 'photography']
    }
  ],
  london: [
    {
      id: 'p_lon_01',
      name: 'Tower Bridge & Historic Thames Walk',
      category: 'attractions',
      rating: 4.8,
      reviews: 79000,
      address: 'Tower Bridge Rd, London SE1 2UP, UK',
      latitude: 51.5055,
      longitude: -0.0754,
      openingHours: '9:30 AM – 6:00 PM',
      priceLevel: '££',
      thumbnail: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
      description: 'Iconic Victorian suspension bridge with high-level glass floor walkways and panoramic Thames river views.',
      visitDuration: '2.5 hours',
      bestFor: ['history', 'sightseeing']
    }
  ]
};

const getMockPlaces = (destination = 'Hyderabad', category = null) => {
  const destClean = String(destination || '').toLowerCase().trim();
  const key = Object.keys(mockPlaces).find(k => destClean.includes(k));

  let list = [];
  if (key && mockPlaces[key]) {
    list = mockPlaces[key];
  } else {
    // Generate contextual dynamic places for unknown destinations
    list = [
      {
        id: `p_${destClean}_01`,
        name: `${destination} Central Heritage Landmark`,
        category: 'attractions',
        rating: 4.6,
        reviews: 2400,
        address: `Central Cultural District, ${destination}`,
        latitude: 20.5937,
        longitude: 78.9629,
        openingHours: '9:00 AM – 6:00 PM',
        priceLevel: '₹₹',
        thumbnail: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        description: `Prominent historical and cultural landmark in ${destination} featuring iconic architecture.`,
        visitDuration: '2 hours',
        bestFor: ['culture', 'sightseeing']
      },
      {
        id: `p_${destClean}_02`,
        name: `${destination} Grand Promenade & Market`,
        category: 'attractions',
        rating: 4.5,
        reviews: 1800,
        address: `Downtown Avenue, ${destination}`,
        latitude: 20.5950,
        longitude: 78.9650,
        openingHours: '10:00 AM – 9:00 PM',
        priceLevel: '₹',
        thumbnail: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80',
        description: `Bustling urban promenade and shopping district with artisanal boutiques and local culture.`,
        visitDuration: '2.5 hours',
        bestFor: ['shopping', 'culture']
      },
      {
        id: `p_${destClean}_03`,
        name: `The Royal ${destination} Kitchen`,
        category: 'restaurants',
        rating: 4.7,
        reviews: 3100,
        address: `Culinary Street, ${destination}`,
        latitude: 20.5920,
        longitude: 78.9610,
        openingHours: '12:00 PM – 11:00 PM',
        priceLevel: '₹₹',
        thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        description: `Renowned culinary haven serving regional authentic delicacies and traditional recipes of ${destination}.`,
        visitDuration: '1.5 hours',
        bestFor: ['food', 'dining']
      }
    ];
  }

  if (!category) return list;
  const target = category.toLowerCase();
  return list.filter(p => p.category?.toLowerCase().includes(target));
};

module.exports = { mockPlaces, getMockPlaces };
