export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  type?: 'note' | 'sheet';
  data?: any; // For sheet data (e.g., 2D array)
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  date: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  type?: string;
  description?: string;
  repeat?: 'none' | 'hourly' | 'daily' | 'monthly';
}

export interface Payment {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export type ThemeType = 'elite' | 'midnight' | 'emerald' | 'rose' | 'vintage' | 'ivory-gold' | 'midnight-marble' | 'dark-parchment' | 'industrial-rustic';
export type FontType = 'classic' | 'modern' | 'technical' | 'soft';
export type FontSize = 'sm' | 'md' | 'lg';
export type RadiusSize = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  dueTime?: string;
  style?: {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
  };
}

export interface DashboardSettings {
  showGreeting: boolean;
  greetingText: string;
  subtitleText: string;
  layout: 'left' | 'center';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  showStats: boolean;
  showClock: boolean;
  showWeather: boolean;
  showQuickActions: boolean;
  showRecentActivity: boolean;
  glassOpacity: number;
  coverImage?: string;
  coverOpacity?: number;
  coverBlur?: number;
  coverOverlay?: number;
  showTodoPanel: boolean;
  showUniversalClock: boolean;
  showLunarCalendar: boolean;
  showFullCalendar: boolean;
  clockStyle?: number;
}

export interface ProfileSettings {
  name: string;
  role: string;
  avatar?: string;
  vaultPin?: string;
}

export interface AppBookmark {
  id: string;
  title: string;
  studioUrl: string;
  publishedUrl: string;
  icon?: string;
  category?: string;
  openMode?: 'internal' | 'external';
}

export interface AppearanceSettings {
  theme: ThemeType;
  font: FontType;
  fontSize: FontSize;
  radius: RadiusSize;
  dashboard: DashboardSettings;
  profile: ProfileSettings;
  notificationSound?: string;
  isAudioEnabled?: boolean;
  useAIVoice?: boolean;
  customFontSize?: number;
  customFontFamily?: string;
}

export interface CloudSettings {
  pCloudToken?: string;
}

export interface Account {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  category: 'ecommerce' | 'social' | 'tools' | 'email' | 'other';
  notes?: string;
  twoFactorCode?: string;
  updatedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  categories?: string[];
  creator?: string;
  thumbnail?: string;
  audioUrl?: string;
}

export interface NewsCategory {
  id: string;
  label: string;
  rssUrl: string;
}

export interface SearchSource {
  id: string;
  name: string;
  domain: string;
  enabled: boolean;
  isCustom?: boolean;
}

export interface EntertainmentItem {
  id: string;
  title: string;
  url: string;
  platform: 'youtube' | 'spotify' | 'zingmp3' | 'nhaccuatoi' | 'local' | string;
  category: string;
  thumbnail?: string;
  addedAt: string;
  isLocal?: boolean;
  fileType?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface PromptItem {
  id: string;
  name: string;
  prompt: string;
  image: string;
  category: string;
  hashtags: string[];
  userId?: string;
  addedAt?: string;
}
