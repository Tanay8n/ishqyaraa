export interface Profile {
  id: string;
  name: string;
  age: number;
  college: string;
  area: string;
  image: string;
  photos?: string[];
  bio: string;
  intention: "Dating" | "Friendship" | "Food Buddy" | "Puja Buddy" | "Photography Buddy";
  compatibility: number;
  interests: string[];
  pujaPreferences: {
    crowdComfort: "Loved Midnight Rush" | "Quiet Afternoon Adda" | "Balanced Explorer";
    favoritePandalZone: "North Kolkata Heritage" | "South Kolkata Theme" | "Salt Lake & New Town" | "Suburban Megastars";
    foodPriority: "Puchka & Rolls First" | "Moghlai & Biryani Feast" | "Bhog & Sweet Craver";
    timing: "All-Nighter (11 PM - 6 AM)" | "Sunset to Midnight (5 PM - 12 AM)" | "Early Bird";
  };
  prompts: {
    question: string;
    answer: string;
  }[];
  verified: boolean;
  distanceKm: number;
}

export interface GroupCard {
  id: string;
  title: string;
  membersCount: number;
  maxMembers: number;
  date: "Saptami" | "Ashtami" | "Nabami" | "Dashami";
  time: string;
  location: string;
  description: string;
  organizer: {
    name: string;
    college: string;
    avatar: string;
  };
  tags: string[];
  theme: string;
  routeHighlights: string[];
}

export const INITIAL_PROFILES: Profile[] = [
  {
    id: "riya-20",
    name: "Riya Sen",
    age: 20,
    college: "JIS College of Engineering",
    area: "Kalyani",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    bio: "Obsessed with Fuji film tones, late night phuchka competitions, and capturing dhunuchi naach frames. Looking for someone who doesn't mind 20,000 steps on Ashtami!",
    intention: "Friendship",
    compatibility: 92,
    interests: ["Photography", "Food", "Pandal Hopping", "Indie Music", "Vintage Sarees"],
    pujaPreferences: {
      crowdComfort: "Loved Midnight Rush",
      favoritePandalZone: "North Kolkata Heritage",
      foodPriority: "Puchka & Rolls First",
      timing: "All-Nighter (11 PM - 6 AM)",
    },
    prompts: [
      {
        question: "My quintessential Durga Puja ritual",
        answer: "Watching the dhakis warm up at Bagbazar while sharing hot chai in clay bhar.",
      },
      {
        question: "The fastest way to my heart during Sharodiya",
        answer: "A plate of extra spicy Vivekananda Park puchka at 2:00 AM.",
      },
    ],
    verified: true,
    distanceKm: 4.2,
  },
  {
    id: "sourav-22",
    name: "Sourav Ganguly",
    age: 22,
    college: "Jadavpur University",
    area: "Ballygunge",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    bio: "English Lit major with a 35mm film camera. I know all the secret alleys of North Kolkata where crowds are low and heritage architecture is peak.",
    intention: "Photography Buddy",
    compatibility: 95,
    interests: ["Film Photography", "Aesthetics", "Heritage Walks", "Coffee", "Dhak Beats"],
    pujaPreferences: {
      crowdComfort: "Quiet Afternoon Adda",
      favoritePandalZone: "North Kolkata Heritage",
      foodPriority: "Bhog & Sweet Craver",
      timing: "Sunset to Midnight (5 PM - 12 AM)",
    },
    prompts: [
      {
        question: "Pandal hopping green flag",
        answer: "Someone who respects the traditional Pratima art and lets you stand in awe without rushing.",
      },
      {
        question: "Best Puja song",
        answer: "Bhoomi songs on loud speakers mixed with the distant sound of kanshor ghonta.",
      },
    ],
    verified: true,
    distanceKm: 2.8,
  },
  {
    id: "ananya-21",
    name: "Ananya Roy",
    age: 21,
    college: "St. Xavier's College",
    area: "Park Street",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    bio: "Classic yellow saree enthusiast! Ashtami Anjali at our para mandap, followed by an endless tour of South Kolkata blockbusters like Tridhara and Maddox.",
    intention: "Dating",
    compatibility: 89,
    interests: ["Classical Dance", "Bengali Cuisine", "Fashion", "Maddox Adda", "Rabindra Sangeet"],
    pujaPreferences: {
      crowdComfort: "Balanced Explorer",
      favoritePandalZone: "South Kolkata Theme",
      foodPriority: "Moghlai & Biryani Feast",
      timing: "Sunset to Midnight (5 PM - 12 AM)",
    },
    prompts: [
      {
        question: "You'll find me at Maddox Square...",
        answer: "Sitting on the grass with 8 friends, arguing over which pandal had the best lighting concept.",
      },
    ],
    verified: true,
    distanceKm: 3.5,
  },
  {
    id: "debojyoti-23",
    name: "Debojyoti Paul",
    age: 23,
    college: "Techno India University",
    area: "Salt Lake, Sector V",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    bio: "Full stack dev by day, relentless foodie during Sharodotsav. I have an Excel sheet with the top 30 pandals ranked by pedestrian queue velocity.",
    intention: "Food Buddy",
    compatibility: 87,
    interests: ["Mutton Rolls", "Bhog Tasting", "Tech", "Route Optimization", "Late Night Drives"],
    pujaPreferences: {
      crowdComfort: "Loved Midnight Rush",
      favoritePandalZone: "Salt Lake & New Town",
      foodPriority: "Moghlai & Biryani Feast",
      timing: "All-Nighter (11 PM - 6 AM)",
    },
    prompts: [
      {
        question: "My superpower during Puja",
        answer: "Finding parking in Gariahat on Nabami evening without getting a ticket.",
      },
    ],
    verified: true,
    distanceKm: 6.1,
  },
  {
    id: "sneha-20",
    name: "Sneha Mukherjee",
    age: 20,
    college: "Presidency University",
    area: "College Street",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    bio: "Bookworm turned street wanderer once the kash phool blooms. I love theme pandals that tell social stories and making new genuine friends.",
    intention: "Puja Buddy",
    compatibility: 94,
    interests: ["Art Installations", "Literature", "Adda", "Street Food", "Documentary"],
    pujaPreferences: {
      crowdComfort: "Balanced Explorer",
      favoritePandalZone: "North Kolkata Heritage",
      foodPriority: "Puchka & Rolls First",
      timing: "Sunset to Midnight (5 PM - 12 AM)",
    },
    prompts: [
      {
        question: "Favorite Puja memory",
        answer: "Getting lost near Ahiritola Ghat and discovering a tiny 120-year-old Rajbari Puja with no crowds.",
      },
    ],
    verified: true,
    distanceKm: 1.9,
  },
  {
    id: "ishaan-21",
    name: "Ishaan Banerjee",
    age: 21,
    college: "Heritage Institute of Technology",
    area: "Ruby Connector",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    bio: "Guitarist at local rock bands and dhak lover. Looking for someone to jump into spontaneous pandal hopping adventures.",
    intention: "Puja Buddy",
    compatibility: 91,
    interests: ["Live Music", "Dhak Jamming", "Night Photography", "Street Strolls"],
    pujaPreferences: {
      crowdComfort: "Loved Midnight Rush",
      favoritePandalZone: "South Kolkata Theme",
      foodPriority: "Puchka & Rolls First",
      timing: "All-Nighter (11 PM - 6 AM)",
    },
    prompts: [
      {
        question: "Puja bucket list",
        answer: "Play dhunuchi naach till arms give up on Nabami midnight.",
      },
    ],
    verified: true,
    distanceKm: 5.4,
  },
];

export const GROUPS_DATA: GroupCard[] = [
  {
    id: "group-1",
    title: "Saptami Night Pandal Hop 🪷",
    membersCount: 4,
    maxMembers: 6,
    date: "Saptami",
    time: "6:00 PM",
    location: "South Kolkata (Tridhara & Maddox)",
    description: "Kicking off Saptami with iconic South Kolkata vibes. We will do Tridhara, Ekdalia Evergreen, Singhi Park, and wrap up with a chill lawn adda at Maddox Square.",
    organizer: {
      name: "Tanay Mukherjee",
      college: "Techno Main Salt Lake",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
    },
    tags: ["South Kolkata", "Maddox Adda", "Casual Pace", "Food Stops"],
    theme: "Heritage & Chill",
    routeHighlights: ["Tridhara", "Ballygunge Cultural", "Ekdalia Evergreen", "Maddox Square"],
  },
  {
    id: "group-2",
    title: "Photography Pandal Hunt 📸",
    membersCount: 4,
    maxMembers: 6,
    date: "Saptami",
    time: "6:00 PM",
    location: "North Kolkata Heritage",
    description: "DSLRs, mirrorless, and phone photographers assemble! We're focusing on lighting, idols, traditional Bonedi Bari pujas, and candid dhunuchi moments.",
    organizer: {
      name: "Riya Sen",
      college: "JIS College",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
    tags: ["Photography", "Golden Hour", "Bonedi Bari", "Street Snaps"],
    theme: "Visual Arts & Culture",
    routeHighlights: ["Sovabazar Rajbari", "Bagbazar Sarbojanin", "Kumartuli Park", "Ahiritola Ghat"],
  },
  {
    id: "group-3",
    title: "Midnight Moghlai & Mega Pandals 🍜",
    membersCount: 5,
    maxMembers: 8,
    date: "Ashtami",
    time: "10:30 PM",
    location: "Central & South Kolkata",
    description: "For the night owls who know Kolkata looks magical at 2 AM. Starting with Arsalan or Aminia rolls, followed by Suruchi Sangha, Chetla Agrani, and Mudiali.",
    organizer: {
      name: "Debojyoti Paul",
      college: "Techno India University",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
    tags: ["All Nighter", "Biryani Crawl", "South Blockbusters", "High Energy"],
    theme: "Food & Night Exploration",
    routeHighlights: ["Suruchi Sangha", "Chetla Agrani", "Mudiali Club", "Shiv Mandir"],
  },
  {
    id: "group-4",
    title: "Ashtami Morning Anjali & Bhog Squad 🪔",
    membersCount: 6,
    maxMembers: 6,
    date: "Ashtami",
    time: "9:00 AM",
    location: "Ballygunge & Gariahat",
    description: "Traditional attire mandatory (saree / kurta / dhoti)! We offer pushpanjali together, savor authentic khichuri bhog, and enjoy quiet afternoon adda.",
    organizer: {
      name: "Ananya Roy",
      college: "St. Xavier's College",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    },
    tags: ["Traditional", "Pushpanjali", "Bhog Lovers", "Yellow Saree"],
    theme: "Festive Rituals & Adda",
    routeHighlights: ["Para Mandap", "Ballygunge Cultural", "Community Bhog Feast"],
  },
  {
    id: "group-5",
    title: "Salt Lake & New Town Megaspectacle Tour ✨",
    membersCount: 3,
    maxMembers: 6,
    date: "Nabami",
    time: "5:30 PM",
    location: "Salt Lake & Lake Town",
    description: "Covering the giant artistic installations: Sreebhumi, FD Block, BJ Block, and ending with coffee at Eco Park street eateries.",
    organizer: {
      name: "Sneha Mukherjee",
      college: "Presidency University",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    },
    tags: ["Illumination", "Theme Art", "Wide Spaces", "Café Wrapup"],
    theme: "Theme Architecture",
    routeHighlights: ["Sreebhumi Sporting", "FD Block Salt Lake", "BJ Block", "EC Block"],
  },
  {
    id: "group-6",
    title: "Dashami Sindoor Khela & Dhunuchi Jam 🥁",
    membersCount: 7,
    maxMembers: 10,
    date: "Dashami",
    time: "4:00 PM",
    location: "Babu Ghat & Bagbazar",
    description: "The bittersweet finale. Witnessing immersive Bisorjon processions, emotional Dhunuchi naach battles, and sharing warm Shubho Bijoya sweet boxes.",
    organizer: {
      name: "Ishaan Banerjee",
      college: "Heritage Tech",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    },
    tags: ["Sindoor Khela", "Bisorjon", "Sweet Sharing", "Shubho Bijoya"],
    theme: "Grand Finale",
    routeHighlights: ["Bagbazar Ghat", "Babu Ghat", "Misti Distribution Point"],
  },
];

export const USER_CURRENT_PROFILE = {
  name: "Tanay Mukherjee",
  age: 21,
  tagline: "Chai over coffee, Maddox lawn over clubs, 35mm rolls ready! 🪷",
  college: "Techno Main Salt Lake",
  area: "Ballygunge, Kolkata",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80",
  bio: "Engineering undergrad with a heart committed to Kolkata's Sharodiya magic. Looking for curious minds to plan midnight pandal walks, review street rolls, and take aesthetic photos.",
  lookingFor: ["Friendship", "Photography Buddy", "Puja Buddy"] as const,
  interests: ["Pandal Hopping", "Street Photography", "Maddox Adda", "Kathi Rolls", "Indie Rock", "Heritage Architecture"],
  pujaPreferences: {
    crowdComfort: "Balanced Explorer",
    favoritePandalZone: "South Kolkata Theme",
    foodPriority: "Puchka & Rolls First",
    timing: "Sunset to Midnight (5 PM - 12 AM)",
  },
  prompts: [
    {
      question: "My quintessential Durga Puja ritual is...",
      answer: "Standing near Maddox Square at 8 PM, listening to the dhak resonance vibrating in my chest while chatting with friends over tea.",
    },
    {
      question: "Best pandal bhog in town...",
      answer: "Ballygunge Cultural's Ashtami khichuri with labra and tomato-khejur chutney on sal leaf plate.",
    },
    {
      question: "Pujor gaan on loop...",
      answer: "Mohiner Ghoraguli classics and Chandrabindoo's festive anthems.",
    },
  ],
  stats: {
    matches: 18,
  },
};
