// Mock data for messages feature
// This will be replaced with real API calls later

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
};

export type Conversation = {
  id: string;
  matchId: string;
  matchName: string;
  matchAge: number;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
};

// Current user ID for mock purposes
export const CURRENT_USER_ID = 'current-user';

// Helper to create timestamps relative to now
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000);
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// Mock conversations with full message history
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    matchId: 'user-sarah',
    matchName: 'Sarah',
    matchAge: 28,
    lastMessage: "That sounds amazing! I'd love to try that restaurant.",
    lastMessageTime: minutesAgo(5),
    unreadCount: 2,
    isOnline: true,
    messages: [
      {
        id: 'msg-1-1',
        senderId: CURRENT_USER_ID,
        text: "Hey! How's your day going?",
        timestamp: hoursAgo(2),
        read: true,
      },
      {
        id: 'msg-1-2',
        senderId: 'user-sarah',
        text: "Pretty good! Just finished a long day at work. How about you?",
        timestamp: hoursAgo(1.9),
        read: true,
      },
      {
        id: 'msg-1-3',
        senderId: CURRENT_USER_ID,
        text: "Same here! I was thinking about trying that new Italian place downtown this weekend.",
        timestamp: hoursAgo(1.8),
        read: true,
      },
      {
        id: 'msg-1-4',
        senderId: 'user-sarah',
        text: "That sounds amazing! I'd love to try that restaurant.",
        timestamp: minutesAgo(5),
        read: false,
      },
      {
        id: 'msg-1-5',
        senderId: 'user-sarah',
        text: "I've heard their pasta is incredible 🍝",
        timestamp: minutesAgo(4),
        read: false,
      },
    ],
  },
  {
    id: 'conv-2',
    matchId: 'user-emma',
    matchName: 'Emma',
    matchAge: 26,
    lastMessage: "Haha that's hilarious! 😂",
    lastMessageTime: minutesAgo(45),
    unreadCount: 0,
    isOnline: true,
    messages: [
      {
        id: 'msg-2-1',
        senderId: 'user-emma',
        text: "Hi! I saw you're into hiking too!",
        timestamp: daysAgo(1),
        read: true,
      },
      {
        id: 'msg-2-2',
        senderId: CURRENT_USER_ID,
        text: "Yes! I try to get out on trails every weekend. Do you have a favorite spot?",
        timestamp: new Date(daysAgo(1).getTime() + 1000 * 60 * 20),
        read: true,
      },
      {
        id: 'msg-2-3',
        senderId: 'user-emma',
        text: "I love the trails up at Mount Wilson. The views are absolutely breathtaking!",
        timestamp: new Date(daysAgo(1).getTime() + 1000 * 60 * 35),
        read: true,
      },
      {
        id: 'msg-2-4',
        senderId: CURRENT_USER_ID,
        text: "Oh I've been meaning to check that out! Last time I went hiking, I accidentally took the 'difficult' trail thinking it was the easy one 😅",
        timestamp: hoursAgo(1.5),
        read: true,
      },
      {
        id: 'msg-2-5',
        senderId: 'user-emma',
        text: "Haha that's hilarious! 😂",
        timestamp: minutesAgo(45),
        read: true,
      },
    ],
  },
  {
    id: 'conv-3',
    matchId: 'user-olivia',
    matchName: 'Olivia',
    matchAge: 29,
    lastMessage: "I usually read before bed, helps me wind down",
    lastMessageTime: hoursAgo(3),
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 'msg-3-1',
        senderId: CURRENT_USER_ID,
        text: "Hey! Your profile mentioned you're a book lover. What are you reading right now?",
        timestamp: hoursAgo(5),
        read: true,
      },
      {
        id: 'msg-3-2',
        senderId: 'user-olivia',
        text: "Hi! Currently reading 'The Midnight Library'. It's so good I can't put it down!",
        timestamp: hoursAgo(4.5),
        read: true,
      },
      {
        id: 'msg-3-3',
        senderId: CURRENT_USER_ID,
        text: "Oh I've heard great things about that! I'm more of a sci-fi reader myself.",
        timestamp: hoursAgo(4),
        read: true,
      },
      {
        id: 'msg-3-4',
        senderId: 'user-olivia',
        text: "Nice! Any recommendations? I've been wanting to branch out from contemporary fiction.",
        timestamp: hoursAgo(3.5),
        read: true,
      },
      {
        id: 'msg-3-5',
        senderId: CURRENT_USER_ID,
        text: "Definitely check out 'Project Hail Mary' by Andy Weir. It's incredible!",
        timestamp: hoursAgo(3.2),
        read: true,
      },
      {
        id: 'msg-3-6',
        senderId: 'user-olivia',
        text: "I usually read before bed, helps me wind down",
        timestamp: hoursAgo(3),
        read: true,
      },
    ],
  },
  {
    id: 'conv-4',
    matchId: 'user-mia',
    matchName: 'Mia',
    matchAge: 27,
    lastMessage: "You: That's so cool! I've always wanted to learn",
    lastMessageTime: daysAgo(2),
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 'msg-4-1',
        senderId: 'user-mia',
        text: "Hey! I noticed you're into photography. Do you shoot film or digital?",
        timestamp: daysAgo(3),
        read: true,
      },
      {
        id: 'msg-4-2',
        senderId: CURRENT_USER_ID,
        text: "Mostly digital, but I've been wanting to try film! Do you shoot?",
        timestamp: daysAgo(2.9),
        read: true,
      },
      {
        id: 'msg-4-3',
        senderId: 'user-mia',
        text: "Yes! I actually develop my own film at home. There's something magical about the darkroom process.",
        timestamp: daysAgo(2.5),
        read: true,
      },
      {
        id: 'msg-4-4',
        senderId: CURRENT_USER_ID,
        text: "That's so cool! I've always wanted to learn",
        timestamp: daysAgo(2),
        read: true,
      },
    ],
  },
  {
    id: 'conv-5',
    matchId: 'user-ava',
    matchName: 'Ava',
    matchAge: 25,
    lastMessage: "You: Coffee sounds perfect!",
    lastMessageTime: daysAgo(4),
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 'msg-5-1',
        senderId: 'user-ava',
        text: "Hi there! Your profile made me smile 😊",
        timestamp: daysAgo(5),
        read: true,
      },
      {
        id: 'msg-5-2',
        senderId: CURRENT_USER_ID,
        text: "Thank you! I love your taste in music. Are you a vinyl collector?",
        timestamp: daysAgo(4.8),
        read: true,
      },
      {
        id: 'msg-5-3',
        senderId: 'user-ava',
        text: "I am! Started during the pandemic and now I'm hooked. Want to grab coffee and talk music sometime?",
        timestamp: daysAgo(4.5),
        read: true,
      },
      {
        id: 'msg-5-4',
        senderId: CURRENT_USER_ID,
        text: "Coffee sounds perfect!",
        timestamp: daysAgo(4),
        read: true,
      },
    ],
  },
  {
    id: 'conv-6',
    matchId: 'user-sophia',
    matchName: 'Sophia',
    matchAge: 30,
    lastMessage: "Good morning! ☀️",
    lastMessageTime: hoursAgo(8),
    unreadCount: 1,
    isOnline: false,
    messages: [
      {
        id: 'msg-6-1',
        senderId: CURRENT_USER_ID,
        text: "Hey! How was your weekend?",
        timestamp: daysAgo(1),
        read: true,
      },
      {
        id: 'msg-6-2',
        senderId: 'user-sophia',
        text: "It was great! Went to a yoga retreat. Feeling very zen 🧘‍♀️",
        timestamp: new Date(daysAgo(1).getTime() + 1000 * 60 * 60),
        read: true,
      },
      {
        id: 'msg-6-3',
        senderId: CURRENT_USER_ID,
        text: "That sounds amazing! I've been meaning to get into yoga.",
        timestamp: hoursAgo(12),
        read: true,
      },
      {
        id: 'msg-6-4',
        senderId: 'user-sophia',
        text: "Good morning! ☀️",
        timestamp: hoursAgo(8),
        read: false,
      },
    ],
  },
  {
    id: 'conv-7',
    matchId: 'user-isabella',
    matchName: 'Isabella',
    matchAge: 24,
    lastMessage: "You: Sounds like a plan! Looking forward to it",
    lastMessageTime: daysAgo(6),
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 'msg-7-1',
        senderId: 'user-isabella',
        text: "Hi! I saw you're a foodie too. Have you tried the new ramen place on 5th?",
        timestamp: daysAgo(7),
        read: true,
      },
      {
        id: 'msg-7-2',
        senderId: CURRENT_USER_ID,
        text: "Not yet! Is it good?",
        timestamp: daysAgo(6.8),
        read: true,
      },
      {
        id: 'msg-7-3',
        senderId: 'user-isabella',
        text: "It's incredible! We should check it out together sometime.",
        timestamp: daysAgo(6.5),
        read: true,
      },
      {
        id: 'msg-7-4',
        senderId: CURRENT_USER_ID,
        text: "Sounds like a plan! Looking forward to it",
        timestamp: daysAgo(6),
        read: true,
      },
    ],
  },
];

// Helper function to get conversation by ID
export const getConversationById = (id: string): Conversation | undefined => {
  return mockConversations.find(conv => conv.id === id);
};

// Helper function to get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to get avatar color based on name
export const getAvatarColor = (name: string): string => {
  const colors = [
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#ef4444', // red
    '#14b8a6', // teal
    '#f97316', // orange
  ];

  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};
