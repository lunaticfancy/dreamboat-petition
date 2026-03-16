import { Badge } from '@/components/ui/badge';
import { PetitionStatus } from '@/types';

interface StatusBadgeProps {
  status: PetitionStatus;
}

const statusConfig = {
  OPEN: {
    label: '진행 중',
    className:
      'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
  },
  PENDING_ANSWER: {
    label: '답변 대기',
    className:
      'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100',
  },
  ANSWERED: {
    label: '답변 완료',
    className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  CLOSED: {
    label: '종료',
    className: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100',
  },
  MERGED: {
    label: '병합됨',
    className:
      'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}
