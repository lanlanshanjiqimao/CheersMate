import { UserReview } from '../types/user';

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function isOrganizer(userId: string, organizerId: string): boolean {
  return userId === organizerId;
}

export function getTopTags(reviews: UserReview[]): string[] {
  const freq: Record<string, number> = {};
  for (const r of reviews) {
    for (const tag of r.tags) {
      freq[tag] = (freq[tag] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
}

export function calculateAvgRating(reviews: UserReview[]): number {
  if (reviews.length === 0) return 5.0;
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}
