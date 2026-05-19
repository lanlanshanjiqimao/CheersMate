import { User } from '../types/user';

export const CURRENT_USER_ID = 'u_me';

export const mockUsers: User[] = [
  {
    id: 'u_me',
    emoji: '😊',
    emojiBg: '#E8FBF5',
    name: '我',
    rating: 4.8,
    activityCount: 6,
    online: true,
    tags: [
      { label: '羽毛球', type: 'sport' },
      { label: '日料', type: 'food' },
      { label: 'K歌', type: 'music' },
    ],
  },
  {
    id: 'u_linyu',
    emoji: '🦊',
    emojiBg: '#F0EEFF',
    name: '林语',
    rating: 4.9,
    activityCount: 12,
    online: true,
    tags: [
      { label: '羽毛球', type: 'sport' },
      { label: '精酿', type: 'drink' },
      { label: '徒步', type: 'outdoor' },
    ],
  },
  {
    id: 'u_chenmo',
    emoji: '🐱',
    emojiBg: '#E8FBF5',
    name: '陈默',
    rating: 4.7,
    activityCount: 5,
    online: false,
    tags: [
      { label: '羽毛球', type: 'sport' },
      { label: '游戏', type: 'game' },
    ],
  },
  {
    id: 'u_xiaowen',
    emoji: '🌸',
    emojiBg: '#FFF8E1',
    name: '小温',
    rating: 4.9,
    activityCount: 8,
    online: false,
    tags: [
      { label: '日料', type: 'food' },
      { label: '瑜伽', type: 'sport' },
      { label: '旅行', type: 'travel' },
    ],
  },
  {
    id: 'u_akira',
    emoji: '🎵',
    emojiBg: '#FFF8E1',
    name: 'Akira',
    rating: 4.5,
    activityCount: 2,
    online: false,
    tags: [
      { label: 'K歌', type: 'music' },
      { label: '居酒屋', type: 'food' },
    ],
  },
  {
    id: 'u_momo',
    emoji: '🌴',
    emojiBg: '#F0EEFF',
    name: '墨墨',
    rating: 4.6,
    activityCount: 2,
    online: false,
    tags: [
      { label: '徒步', type: 'outdoor' },
      { label: '咖啡', type: 'food' },
    ],
  },
  {
    id: 'u_leo',
    emoji: '🎸',
    emojiBg: '#FFF8E1',
    name: 'Leo',
    rating: 4.3,
    activityCount: 3,
    online: false,
    tags: [
      { label: '精酿', type: 'drink' },
      { label: '音乐节', type: 'music' },
    ],
  },
  {
    id: 'u_xiaoya',
    emoji: '🧋',
    emojiBg: '#E8FBF5',
    name: '小雅',
    rating: 4.8,
    activityCount: 10,
    online: true,
    tags: [
      { label: '奶茶', type: 'drink' },
      { label: '剧本杀', type: 'game' },
      { label: '旅行', type: 'travel' },
    ],
  },
];

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}
