export enum ActivityStatus {
  ENROLLING = 'enrolling',
  FULL = 'full',
  ONGOING = 'ongoing',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
}

export const StatusLabels: Record<ActivityStatus, string> = {
  [ActivityStatus.ENROLLING]: '报名中',
  [ActivityStatus.FULL]: '已满员',
  [ActivityStatus.ONGOING]: '进行中',
  [ActivityStatus.ENDED]: '已结束',
  [ActivityStatus.CANCELLED]: '已取消',
  [ActivityStatus.DRAFT]: '草稿',
};

export const StatusColors: Record<ActivityStatus, { bg: string; text: string }> = {
  [ActivityStatus.ENROLLING]: { bg: '#E8FBF5', text: '#00B894' },
  [ActivityStatus.FULL]: { bg: '#FFF8E1', text: '#E17055' },
  [ActivityStatus.ONGOING]: { bg: '#F0EEFF', text: '#6C5CE7' },
  [ActivityStatus.ENDED]: { bg: '#F7F8FA', text: '#B2BEC3' },
  [ActivityStatus.CANCELLED]: { bg: '#FFF0F0', text: '#FF6B6B' },
  [ActivityStatus.DRAFT]: { bg: '#F7F8FA', text: '#B2BEC3' },
};
