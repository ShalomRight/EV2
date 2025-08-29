
export type User = {
  id: string;
  name: string;
  role: 'user' | 'vendor' | 'admin';
  avatar: string;
  points: number;
  level: number;
  badges: string[];
  savedItems: string[];
  likedItems: string[];
  following: string[];
};

export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type QuizOption = {
  id: string;
  text: string;
};

export type Quiz = {
  questions: {
    question: string;
    options: QuizOption[];
    correctAnswerId: string;
  }[];
}

export enum FeedItemType {
  VendorHighlight = 'vendor_highlight',
  Event = 'event',
  UserContent = 'user_content',
  Poll = 'poll',
  Video = 'video',
  Quiz = 'quiz',
}

export type FeedItem = {
  id: string;
  type: FeedItemType;
  author: string;
  authorAvatar: string;
  timestamp: string;
  title?: string;
  caption: string;
  media?: string; // URL for image or video thumbnail
  videoUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  // Poll specific
  pollOptions?: PollOption[];
  totalVotes?: number;
  // Event specific
  eventDate?: string;
  location?: string;
  // Quiz specific
  quiz?: Quiz;
};

export enum VendorCategory {
    Food = 'Food & Beverages',
    Crafts = 'Arts & Crafts',
    Tours = 'Tours & Activities',
    Agriculture = 'Agriculture',
    Fashion = 'Fashion & Apparel'
}

export type Review = {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export type Product = {
  id: string;
  name: string;
  image: string;
  price?: string;
  description: string;
};

export type Vendor = {
  id:string;
  name: string;
  category: VendorCategory;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
  followersCount: number;
  location: string;
  featured: boolean;
  premium: boolean;
  reviews: Review[];
  showcaseImages: string[];
  products: Product[];
};

export type Event = {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: string;
  attendees: number;
  featured: boolean;
  participants?: Pick<Vendor, 'id' | 'name' | 'image' | 'category'>[];
  showcaseImages?: string[];
};

export type View = 
  | 'home' 
  | 'feed' 
  | 'vendors' 
  | 'vendor-detail'
  | 'product-detail'
  | 'activity-detail'
  | 'events' 
  | 'event-detail' 
  | 'dashboard' 
  | 'map'
  | 'all-activities'
  | 'profile'; // an alias for dashboard