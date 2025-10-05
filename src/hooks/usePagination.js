import { useMemo } from 'react';

export default function usePagination(items, page, pageSize) {
  return useMemo(() => {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const paginated = items.slice(start, start + pageSize);
    return { paginated, totalPages };
  }, [items, page, pageSize]);
}
