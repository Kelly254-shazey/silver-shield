function daysFromNowIso(dayOffset, hour = 9) {
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  target.setDate(target.getDate() + dayOffset);
  return target.toISOString();
}

export const FALLBACK_PROGRAMS = [
  {
    id: "fallback-program-1",
    isFallback: true,
    slug: "women-empowerment-program-wezesha-dada-initiative",
    title: "Women empowerment program (wezesha dada initiative)",
    category: "Women Empowerment",
    summary: "Skills training, mentorship, and business support for women-led households.",
    goalAmount: 0,
    raisedAmount: 0,
    heroImage:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-program-2",
    isFallback: true,
    slug: "youth-empowerment-program",
    title: "Youth empowerment program",
    category: "Youth Empowerment",
    summary: "Leadership, employability, and digital pathways for young people.",
    goalAmount: 0,
    raisedAmount: 0,
    heroImage:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-program-3",
    isFallback: true,
    slug: "school-mentorship-programmes",
    title: "School mentorship programmes",
    category: "Education",
    summary: "School-based mentorship focused on confidence, discipline, and career guidance.",
    goalAmount: 0,
    raisedAmount: 0,
    heroImage:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-program-4",
    isFallback: true,
    slug: "community-outreach-programme",
    title: "Community outreach programme",
    category: "Community",
    summary: "Household support, health awareness, and referrals across local communities.",
    goalAmount: 0,
    raisedAmount: 0,
    heroImage:
      "https://images.unsplash.com/photo-1469571486292-b53601010376?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-program-5",
    isFallback: true,
    slug: "naturing-talent",
    title: "Naturing talent",
    category: "Talent Development",
    summary: "Creative arts and sports coaching to nurture confidence and purpose.",
    goalAmount: 0,
    raisedAmount: 0,
    heroImage:
      "https://images.unsplash.com/photo-1529634898458-93dff0d8ed63?auto=format&fit=crop&w=1400&q=80",
  },
];

export const FALLBACK_STORIES = [
  {
    id: "fallback-story-1",
    isFallback: true,
    slug: "from-idea-to-income-a-women-led-business-circle",
    title: "From idea to income: A women-led business circle",
    author: "Silver Shield Team",
    excerpt: "How peer support and micro-grants helped mothers launch sustainable ventures.",
    category: "Women Empowerment",
    coverImage:
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-story-2",
    isFallback: true,
    slug: "youth-leaders-driving-change-in-their-neighborhoods",
    title: "Youth leaders driving change in their neighborhoods",
    author: "Community Desk",
    excerpt: "Young people designed and delivered a weekend service project with measurable impact.",
    category: "Youth Empowerment",
    coverImage:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-story-3",
    isFallback: true,
    slug: "mentorship-in-schools-building-confidence-one-session-at-a-time",
    title: "Mentorship in schools: Building confidence one session at a time",
    author: "Education Team",
    excerpt: "Mentors and teachers partnered to improve attendance and goal setting.",
    category: "Mentorship",
    coverImage:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1400&q=80",
  },
];

export const FALLBACK_EVENTS = [
  {
    id: "fallback-event-1",
    isFallback: true,
    status: "upcoming",
    title: "Women in Enterprise Bootcamp",
    description: "Hands-on training for women-led businesses, financial literacy, and networking.",
    location: "Nairobi",
    eventDate: daysFromNowIso(6),
    coverImage:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-event-2",
    isFallback: true,
    status: "upcoming",
    title: "Youth Innovation and Career Clinic",
    description: "Career coaching, CV labs, and innovation showcases for youth participants.",
    location: "Nakuru",
    eventDate: daysFromNowIso(13),
    coverImage:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-event-3",
    isFallback: true,
    status: "upcoming",
    title: "Community Outreach Health and Legal Camp",
    description: "Integrated clinic support with referrals for health, legal, and social protection.",
    location: "Mombasa",
    eventDate: daysFromNowIso(21),
    coverImage:
      "https://images.unsplash.com/photo-1576765608866-5b51046452be?auto=format&fit=crop&w=1400&q=80",
  },
];

