import { ActivityStatus } from '../constants/status';

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  likes: number;
  pinned: boolean;
}

export interface Activity {
  id: string;
  title: string;
  emoji: string;
  status: ActivityStatus;
  category: string;
  tags: string[];
  date: string;
  time: string;
  location: string;
  locationDetail?: string;
  currentPeople: number;
  maxPeople: number;
  cost: string;
  requirements: string;
  description: string;
  organizerId: string;
  memberIds: string[];
  comments: Comment[];
  favorited?: boolean; // deprecated, kept for migration
  reviewedUserIds: Record<string, string[]>;
  createdAt: string;
}
