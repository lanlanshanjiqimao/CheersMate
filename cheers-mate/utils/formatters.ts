export function formatPeople(current: number, max: number): string {
  return `${current}/${max}人`;
}

export function formatProgress(current: number, max: number): number {
  return Math.round((current / max) * 100);
}

export function formatRemaining(current: number, max: number): string {
  const remaining = max - current;
  if (remaining <= 0) return '已满员';
  if (remaining === 1) return `还差1人成局`;
  return `还差${remaining}人成局`;
}

export function formatCost(cost: string): string {
  return cost;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 7) return `${diffDay}天前`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekday = weekdays[date.getDay()];
  return `${month}-${day} 周${weekday}`;
}
