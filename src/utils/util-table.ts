import { ITableSort } from '~/types';

export const toggleTableSorting = (tableSort?: ITableSort): ITableSort => {
  if (!tableSort) return { key: '', order: 'asc' };

  const { key, order } = tableSort;

  if (order === 'asc') return { key, order: 'desc' };
  return { key, order: 'asc' };
};
