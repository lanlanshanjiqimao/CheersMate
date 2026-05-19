export interface Message {
  id: string;
  senderId: string;
  type: 'text' | 'activity_card' | 'location' | 'system';
  content: string;
  activityId?: string;
  locationName?: string;
  locationAddress?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'system';
  name: string;
  emoji: string;
  tag?: { label: string; type: 'buddy' | 'group' | 'system' };
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  participantIds: string[];
  activityId?: string;
  dissolved?: boolean;
  online?: boolean;
  messages: Message[];
}
