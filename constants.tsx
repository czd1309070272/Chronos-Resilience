
import { Milestone, LogEntry, MapLocation, UserSettings } from './types';

export const INITIAL_USER = {
  name: 'Alex Rivera',
  birthDate: new Date('2000-01-01'),
  lifeExpectancy: 85,
};

// Add missing properties todaySleepTime and todayWorkTime to meet UserSettings interface requirements
export const INITIAL_SETTINGS: UserSettings = {
  language: 'zh-TW',
  birthDate: '1999-01-01',
  birthTime: "08:30",
  lifeExpectancyPreset: 'custom',
  customLifeExpectancy: 85,
  sleepOffset: 8,
  todaySleepTime: 8,
  todayWorkTime: 8,
  workStart: "09:00",
  workEnd: "18:00",
  decimalPrecision: 6,
  progressBarStyle: 'linear',
  soundEnabled: true,
  gravityEnabled: false,
  anniversaries: [
    { id: '1', name: 'Graduation', date: '2026-06-15' },
    { id: '2', name: 'First Home', date: '2028-10-01' }
  ]
};

export const MOCK_MAP_LOCATIONS: MapLocation[] = [
  {
    id: 'm1',
    title: 'Tokyo',
    subtitle: 'Shibuya Crossing',
    date: 'April 2023',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
    coordinates: { x: 82, y: 38 },
  },
  {
    id: 'm2',
    title: 'Paris',
    subtitle: 'Le Marais District',
    date: 'June 2022',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
    coordinates: { x: 48, y: 32 },
    isCurrent: true
  },
  {
    id: 'm3',
    title: 'New York',
    subtitle: 'Manhattan Skyline',
    date: 'Dec 2021',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80',
    coordinates: { x: 28, y: 36 },
  },
  {
    id: 'm4',
    title: 'Reykjavik',
    subtitle: 'Northern Lights',
    date: 'Jan 2024',
    imageUrl: 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=400&q=80',
    coordinates: { x: 42, y: 18 },
  },
  {
    id: 'm5',
    title: 'Sydney',
    subtitle: 'Opera House Harbor',
    date: 'Nov 2023',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&q=80',
    coordinates: { x: 88, y: 82 },
  }
];

export const MOCK_MILESTONES: Milestone[] = [
  {
    id: '1',
    title: 'Summit Mt. Fuji',
    date: '2023',
    status: 'completed',
    category: 'Adventure',
    imageUrl: 'https://images.unsplash.com/photo-1570690516157-a2d712741914?w=400&q=80',
    estimatedAge: 23
  },
  {
    id: '2',
    title: 'Master Piano Concerto No. 2',
    status: 'pending',
    category: 'Skill',
    estimatedAge: 28
  },
  {
    id: '3',
    title: 'Travel to Antarctica',
    status: 'long-term',
    category: 'Travel',
    estimatedAge: 40
  },
  {
    id: '4',
    title: 'Learn Surfing',
    status: 'missed',
    category: 'Adventure',
    estimatedAge: 22
  }
];

export const MOCK_LOGS: LogEntry[] = [
  {
    id: '1',
    time: '21:30',
    date: 'Oct 14, 2023',
    content: 'Finally understood the core concept of temporal dynamics today. It felt like a door opening in my mind.',
    isHighlight: true,
    tags: [{ label: '#INSIGHT', type: 'insight' }, { label: '#GROWTH', type: 'growth' }]
  },
  {
    id: '2',
    time: '08:45',
    date: 'Oct 12, 2023',
    content: 'Morning meditation was particularly deep. Realized that speed is often the enemy of progress.',
    hasVoice: true,
    duration: '0:45',
    tags: [{ label: '#MINDFULNESS', type: 'mindfulness' }]
  },
  {
    id: '3',
    time: '14:20',
    date: 'Oct 05, 2023',
    content: 'Started reading a new philosophy book. It challenges my perception of linear time.',
    tags: [{ label: '#GROWTH', type: 'growth' }]
  },
  {
    id: '4',
    time: '19:15',
    date: 'Sep 28, 2023',
    content: 'Felt a strong sense of nostalgia today while walking through the park. The autumn air changes everything.',
    tags: [{ label: '#REFLECTION', type: 'custom' }]
  },
  {
    id: '5',
    time: '10:00',
    date: 'Sep 15, 2023',
    content: 'Achieved a breakthrough in coding project. The flow state was real.',
    isHighlight: true,
    tags: [{ label: '#ACHIEVEMENT', type: 'growth' }]
  },
  {
    id: '6',
    time: '22:30',
    date: 'Aug 22, 2023',
    content: 'Late night thoughts about the scale of the universe. We are so small yet significant.',
    tags: [{ label: '#INSIGHT', type: 'insight' }]
  },
  {
    id: '7',
    time: '18:45',
    date: 'Aug 08, 2023',
    content: 'Discovered a new hiking trail. Nature has a way of resetting the mind.',
    images: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=200&q=80'],
    tags: [{ label: '#MINDFULNESS', type: 'mindfulness' }]
  },
  {
    id: '8',
    time: '09:00',
    date: 'Jul 14, 2023',
    content: 'Mid-year review. Progress is slower than expected, but steady. Patience is key.',
    tags: [{ label: '#GROWTH', type: 'growth' }]
  },
  {
    id: '9',
    time: '11:20',
    date: 'Jun 30, 2023',
    content: 'First day of the new routine. It feels difficult but necessary for long term goals.',
    tags: [{ label: '#DISCIPLINE', type: 'custom' }]
  },
  {
    id: '10',
    time: '23:45',
    date: 'Jun 15, 2023',
    content: 'Stargazing in the desert. The silence here is a physical weight, grounded in infinity.',
    tags: [{ label: '#INSIGHT', type: 'insight' }]
  },
  {
    id: '11',
    time: '07:30',
    date: 'Jun 10, 2023',
    content: 'Woke up before the sun. The world at dawn belongs to those who observe it in silence.',
    tags: [{ label: '#MINDFULNESS', type: 'mindfulness' }]
  },
  {
    id: '12',
    time: '16:00',
    date: 'Jun 02, 2023',
    content: 'Completed the endurance challenge. 20 miles. Body is spent, mind is sharp.',
    isHighlight: true,
    tags: [{ label: '#GROWTH', type: 'growth' }]
  },
  {
    id: '13',
    time: '12:00',
    date: 'May 28, 2023',
    content: 'Coffee with an old mentor. He reminded me that Plan B is just a distraction from executing Plan A.',
    tags: [{ label: '#INSIGHT', type: 'insight' }]
  },
  {
    id: '14',
    time: '20:15',
    date: 'May 20, 2023',
    content: 'Testing the new HUD interface. The Aero Gold highlights look sharp under low-light conditions.',
    tags: [{ label: '#TECHNOLOGY', type: 'custom' }]
  },
  {
    id: '15',
    time: '09:30',
    date: 'May 12, 2023',
    content: 'Heavy rain today. It slows down the perception of everything. Good for deep work.',
    tags: [{ label: '#MINDFULNESS', type: 'mindfulness' }]
  },
  {
    id: '16',
    time: '09:30',
    date: 'May 12, 2023',
    content: 'Heavy rain today. It slows down the perception of everything. Good for deep work.',
    tags: [{ label: '#MINDFULNESS', type: 'mindfulness' }]
  }

];
