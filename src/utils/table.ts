import { SortingState } from '~/types';

export const toggleSorting = (sorting?: SortingState): SortingState => {
  if (!sorting)
    return {
      key: '',
      order: 'asc',
    };

  const { key, order } = sorting;
  if (order === 'asc') {
    return { key, order: 'desc' };
  }
  return { key, order: 'asc' };
};
