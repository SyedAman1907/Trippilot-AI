const mockReviews = {
  goa: {
    placeName: 'Goa Coastal Highlights',
    overallRating: 4.6,
    totalReviewsAnalyzed: 450,
    aiSummary: {
      tag: 'AI Review Summary',
      whatPeopleLike: [
        'Breathtaking coastal sunsets at Anjuna and Vagator',
        'Authentic coastal seafood, especially Goan prawn curry and rava fry',
        'Warm, hospitable shack owners and relaxed beach vibe',
        'Vibrant watersports activities at Baga'
      ],
      commonComplaints: [
        'Heavy beach traffic during peak sunset hours',
        'Aggressive taxi pricing outside airport and popular beaches',
        'Loud crowd concentrations near main commercial shacks'
      ],
      bestFor: ['Couples', 'Solo Explorers', 'Friends Group', 'Adventure Seekers'],
      sentimentScore: 88
    },
    sampleReviews: [
      {
        author: 'Rohan Mehta',
        rating: 5,
        date: '2 weeks ago',
        snippet: 'The watersports at Baga and the sunset at Aguada fort made this the most memorable beach holiday. Unbeatable atmosphere!'
      },
      {
        author: 'Priya Nambiar',
        rating: 4,
        date: '1 month ago',
        snippet: 'Fontainhas is a photographer dream. Loved the pastel villas. Just remember to hire a scooter early to beat the taxi fares.'
      }
    ]
  },
  jaipur: {
    placeName: 'Jaipur Royal Heritage',
    overallRating: 4.7,
    totalReviewsAnalyzed: 520,
    aiSummary: {
      tag: 'AI Review Summary',
      whatPeopleLike: [
        'Architectural grandeur of Amber Fort and Sheesh Mahal',
        'Rich culinary experiences including dal baati churma and ghewar',
        'Vibrant bazaars full of blue pottery and silver jewelry'
      ],
      commonComplaints: [
        'Afternoon heat can be intense during sightseeing',
        'Crowded ticket counters at Hawa Mahal if not booked online'
      ],
      bestFor: ['Families', 'History Enthusiasts', 'Couples', 'Culture Seekers'],
      sentimentScore: 92
    },
    sampleReviews: [
      {
        author: 'Ananya Verma',
        rating: 5,
        date: '3 weeks ago',
        snippet: 'Amber Fort with an audio guide is a must! The sheer craftsmanship is breathtaking.'
      }
    ]
  },
  hyderabad: {
    placeName: 'Hyderabad Historic & Nizami Highlights',
    overallRating: 4.6,
    totalReviewsAnalyzed: 480,
    aiSummary: {
      tag: 'AI Review Summary',
      whatPeopleLike: [
        'Magnificent heritage architecture at Golconda Fort and Chowmahalla Palace',
        'World-famous authentic Hyderabadi biryani and Irani chai in the Old City',
        'Scenic sunset views around Hussain Sagar and vibrant tech city nightlife',
        'Rich pearl and gemstone bazaars around Charminar'
      ],
      commonComplaints: [
        'Traffic congestion near Old City markets during peak evening hours',
        'Afternoon heat during summer months requires early morning visits'
      ],
      bestFor: ['Food Lovers', 'History Buffs', 'Families', 'Culture Seekers'],
      sentimentScore: 91
    },
    sampleReviews: [
      {
        author: 'Kavita Reddy',
        rating: 5,
        date: '1 week ago',
        snippet: 'The light and sound show at Golconda Fort paired with authentic Nizami dinner made this trip incredible.'
      },
      {
        author: 'Rahul Sharma',
        rating: 5,
        date: '3 weeks ago',
        snippet: 'Do not miss early morning Irani chai near Charminar. Unmatched atmosphere and welcoming people.'
      }
    ]
  }
};

const getMockReviews = (destination = 'Goa') => {
  if (!destination || typeof destination !== 'string') {
    return mockReviews.goa;
  }
  const clean = destination.trim().toLowerCase();
  const key = Object.keys(mockReviews).find(k => clean.includes(k));
  if (key && mockReviews[key]) {
    return mockReviews[key];
  }

  // Dynamic destination-aware review data — NEVER leak beach or shack data to non-coastal cities!
  const capitalized = destination.trim().charAt(0).toUpperCase() + destination.trim().slice(1);
  return {
    placeName: `${capitalized} Travel Intelligence`,
    overallRating: 4.6,
    totalReviewsAnalyzed: 380,
    aiSummary: {
      tag: 'Verified Destination Sentiment',
      whatPeopleLike: [
        `Rich cultural atmosphere and memorable sightseeing across ${capitalized}`,
        `Authentic regional cuisine and diverse culinary hotspots`,
        `Warm hospitality and accessible local neighborhoods`
      ],
      commonComplaints: [
        'No destination-specific travel headwinds available yet.'
      ],
      bestFor: ['Culture Seekers', 'Couples', 'Solo Explorers', 'Families'],
      sentimentScore: 89
    },
    sampleReviews: [
      {
        author: 'Verified Traveler',
        rating: 5,
        date: 'Recent',
        snippet: `Exploring ${capitalized} offered an unforgettable cultural and culinary journey.`
      }
    ]
  };
};

module.exports = { mockReviews, getMockReviews };

