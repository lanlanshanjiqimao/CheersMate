export interface UserTag {
  label: string;
  type: 'sport' | 'food' | 'drink' | 'music' | 'travel' | 'game' | 'social' | 'outdoor';
}

export interface PlatformTag {
  label: string;
  type: 'buddy' | 'group' | 'system';
}

export interface User {
  id: string;
  emoji: string;
  emojiBg: string;
  name: string;
  rating: number;
  activityCount: number;
  online: boolean;
  tags: UserTag[];
}
