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
