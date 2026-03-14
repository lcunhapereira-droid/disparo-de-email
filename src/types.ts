export type Platform =
  | 'instagram_post'
  | 'instagram_reels'
  | 'instagram_stories'
  | 'tiktok'
  | 'youtube_shorts'
  | 'youtube_video';

export type Tone =
  | 'profissional'
  | 'casual'
  | 'divertido'
  | 'inspiracional'
  | 'educativo'
  | 'provocativo';

export type PostStatus = 'rascunho' | 'agendado' | 'publicado';

export type View = 'dashboard' | 'clients' | 'create' | 'calendar' | 'library';

export interface Client {
  id: string;
  name: string;
  initials: string;
  color: string;
  niche: string;
  segment: string;
  tone: Tone;
  targetAudience: string;
  platforms: Platform[];
  keywords: string[];
  bio: string;
  createdAt: string;
}

export interface Post {
  id: string;
  clientId: string;
  clientName: string;
  clientColor: string;
  platform: Platform;
  topic: string;
  caption: string;
  hashtags: string[];
  cta: string;
  suggestedTime: string;
  contentIdeas: string[];
  engagementTips: string[];
  status: PostStatus;
  scheduledDate?: string;
  createdAt: string;
}

export interface GeneratedContent {
  caption: string;
  hashtags: string[];
  cta: string;
  suggestedTime: string;
  contentIdeas: string[];
  engagementTips: string[];
}
