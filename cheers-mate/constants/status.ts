export enum ActivityStatus {
  ENROLLING = 'enrolling',
  FULL = 'full',
  GROUPED = 'grouped',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export const StatusLabels: Record<ActivityStatus, string> = {
  [ActivityStatus.ENROLLING]: '报名中',
  [ActivityStatus.FULL]: '已满员',
  [ActivityStatus.GROUPED]: '已成团',
  [ActivityStatus.ONGOING]: '进行中',
  [ActivityStatus.COMPLETED]: '已完成',
  [ActivityStatus.ENDED]: '已结束',
  [ActivityStatus.CANCELLED]: '已取消',
};

export const StatusColors: Record<ActivityStatus, { bg: string; text: string }> = {
  [ActivityStatus.ENROLLING]: { bg: '#E8FBF5', text: '#00B894' },
  [ActivityStatus.FULL]: { bg: '#FFF8E1', text: '#E17055' },
  [ActivityStatus.GROUPED]: { bg: '#F0EEFF', text: '#6C5CE7' },
  [ActivityStatus.ONGOING]: { bg: '#F0EEFF', text: '#6C5CE7' },
  [ActivityStatus.COMPLETED]: { bg: '#E8F8F5', text: '#00B894' },
  [ActivityStatus.ENDED]: { bg: '#F7F8FA', text: '#B2BEC3' },
  [ActivityStatus.CANCELLED]: { bg: '#FFF0F0', text: '#FF6B6B' },
};

const DEFAULT_COLORS = StatusColors[ActivityStatus.ENROLLING];
const DEFAULT_LABEL = '未知';

export function getStatusColors(status: string) {
  return StatusColors[status as ActivityStatus] ?? DEFAULT_COLORS;
}

export function getStatusLabel(status: string) {
  return StatusLabels[status as ActivityStatus] ?? DEFAULT_LABEL;
}
