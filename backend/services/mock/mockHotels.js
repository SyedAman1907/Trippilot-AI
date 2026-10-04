const mockHotels = {
  goa: [
    {
      id: 'h_goa_01',
      name: 'Santana Beach Resort',
      rating: 4.5,
      reviews: 1840,
      pricePerNight: 2800,
      address: 'Candolim Beach Road, Candolim, Goa 403515',
      amenities: ['Swimming Pool', 'Beach Access', 'Free Wi-Fi', 'Complimentary Breakfast', 'Bar / Lounge'],
      thumbnail: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      coordinates: {
        latitude: 15.5165,
        longitude: 73.7661
      },
      classType: 'Boutique Beachfront',
      checkInTime: '02:00 PM',
      checkOutTime: '11:00 AM'
    },
    {
      id: 'h_goa_02',
      name: 'The Postcard Moira',
      rating: 4.8,
      reviews: 620,
      pricePerNight: 5400,
      address: 'Moira, North Goa 403507',
      amenities: ['Heritage Villa', 'Artisan Dining', 'Ayurvedic Spa', 'Garden Pool', 'High-Speed Wi-Fi'],
      thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      coordinates: {
        latitude: 15.6012,
        longitude: 73.8324
      },
      classType: 'Luxury Boutique',
      checkInTime: '02:00 PM',
      checkOutTime: '12:00 PM'
    },
    {
      id: 'h_goa_03',
      name: 'Zostel Plus Morjim',
      rating: 4.6,
      reviews: 2150,
      pricePerNight: 1650,
      address: 'Morjim Beach Road, Morjim, Goa 403512',
      amenities: ['Infinity Pool', 'Coworking Space', 'Cafe', 'Surfing Lessons', 'Air Conditioning'],
      thumbnail: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      coordinates: {
        latitude: 15.6328,
        longitude: 73.7381
      },
      classType: 'Social Experience / Budget',
      checkInTime: '01:00 PM',
      checkOutTime: '10:00 AM'
    }
  ],
  jaipur: [
    {
      id: 'h_jai_01',
      name: 'Alsisar Haveli - A Heritage Hotel',
      rating: 4.6,
      reviews: 1420,
      pricePerNight: 3900,
      address: 'Sansar Chandra Road, Jaipur, Rajasthan 302001',
      amenities: ['Courtyard Pool', 'Traditional Rajasthani Restaurant', 'Free Parking', 'Spa', 'Historic Architecture'],
      thumbnail: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      coordinates: {
        latitude: 26.9248,
        longitude: 75.7994
      },
      classType: 'Heritage Palace',
      checkInTime: '02:00 PM',
      checkOutTime: '12:00 PM'
    },
    {
      id: 'h_jai_02',
      name: 'Shahpura House',
      rating: 4.7,
      reviews: 1890,
      pricePerNight: 4800,
      address: 'Devi Marg, Bani Park, Jaipur 302016',
      amenities: ['Rooftop Dining', 'Frescoed Suites', 'Outdoor Pool', 'Spa Treatments', 'High-Speed Wi-Fi'],
      thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      coordinates: {
        latitude: 26.9295,
        longitude: 75.7891
      },
      classType: 'Luxury Heritage',
      checkInTime: '02:00 PM',
      checkOutTime: '11:00 AM'
    }
  ],
  kochi: [
    {
      id: 'h_cok_01',
      name: 'Forte Kochi Heritage Hotel',
      rating: 4.7,
      reviews: 980,
      pricePerNight: 4200,
      address: 'Princess Street, Fort Kochi, Kochi 682001',
      amenities: ['Colonial Architecture', 'Outdoor Pool', 'Seafood Bistro', 'Free Wi-Fi', 'Bicycle Rentals'],
      thumbnail: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      coordinates: {
        latitude: 9.9658,
        longitude: 76.2428
      },
      classType: 'Colonial Heritage',
      checkInTime: '02:00 PM',
      checkOutTime: '11:00 AM'
    }
  ]
};

const getMockHotels = (destination = 'Goa', nights = 3) => {
  const key = Object.keys(mockHotels).find(k => destination.toLowerCase().includes(k)) || 'goa';
  const list = mockHotels[key] || mockHotels.goa;

  return list.map(h => ({
    ...h,
    numberOfNights: nights,
    totalPrice: h.pricePerNight * nights
  }));
};

module.exports = { mockHotels, getMockHotels };
