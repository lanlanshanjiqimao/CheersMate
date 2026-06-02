export interface UserTag {
  label: string;
  type: 'sport' | 'food' | 'drink' | 'music' | 'travel' | 'game' | 'social' | 'outdoor';
}

export interface PlatformTag {
  label: string;
  type: 'buddy' | 'group' | 'system';
}

export interface UserReview {
  id: string;
  reviewerId: string;
  revieweeId: string;
  activityId: string;
  rating: number;
  tags: string[];
  content: string;
  createdAt: string;
}

export interface User {
  id: string;
  emoji: string;
  emojiBg: string;
  name: string;
  bio: string;
  rating: number;
  activityCount: number;
  online: boolean;
  tags: UserTag[];
  reviews: UserReview[];
}
