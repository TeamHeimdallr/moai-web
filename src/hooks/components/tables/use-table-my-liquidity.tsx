import { ColumnDef } from '@tanstack/react-table';
import { ReactNode, useMemo } from 'react';

import {
  TableHeaderAssets,
  TableHeaderComposition,
  TableHeaderMyAPR,
  TableHeaderSortable,
} from '~/components/tables';
import { TableColumn, TableColumnToken, TableColumnTokenIcon } from '~/components/tables/columns';
import { POOL_ID } from '~/constants';
import { useTableMyLiquidityStore } from '~/states/components/table-my-liquidity';
import { MyLiquidityData, MyLiquidityTable } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';
import { sumPoolValues } from '~/utils/token';

export const useTableMyLiquidity = () => {
  const { sorting, setSorting } = useTableMyLiquidityStore();

  const data: MyLiquidityData[] = [
    {
      id: POOL_ID.POOL_A,
      assets: [TOKEN.MOAI, TOKEN.WETH],
      composition: {
        [TOKEN.MOAI]: 80,
        [TOKEN.WETH]: 20,
      } as Record<TOKEN, number>,
      pool: {
        [TOKEN.MOAI]: 7077.75,
        [TOKEN.WETH]: 147,
      } as Record<TOKEN, number>,
      balance: 693194,
      apr: 6.79,
      isNew: false,
    },
  ];

  const sortedData = data?.sort((a, b) => {
    if (sorting?.key === 'POOL_VALUE')
      return sorting.order === 'asc'
        ? sumPoolValues(a.pool) - sumPoolValues(b.pool)
        : sumPoolValues(b.pool) - sumPoolValues(a.pool);
    if (sorting?.key === 'VOLUME')
      return sorting.order === 'asc' ? a.balance - b.balance : b.balance - a.balance;
    return 0;
  });

  const tableData = useMemo<MyLiquidityTable[]>(
    () =>
      sortedData?.map(d => ({
        id: d.id,
        assets: <TableColumnTokenIcon tokens={d.assets} />,
        composition: <TableColumnToken tokens={d.composition} isNew={d.isNew} />,
        balance: (
          <TableColumn value={`$${formatNumber(d.balance, 2)}`} width={160} align="flex-end" />
        ),
        poolValue: (
          <TableColumn
            value={`$${formatNumber(sumPoolValues(d.pool), 2)}`}
            width={160}
            align="flex-end"
          />
        ),
        apr: <TableColumn value={`${d.apr}%`} width={160} align="flex-end" />,
      })),
    [sortedData]
  );

  const columns = useMemo<ColumnDef<MyLiquidityTable, ReactNode>[]>(
    () => [
      {
        cell: row => row.renderValue(),
        accessorKey: 'id',
      },
      {
        header: () => <TableHeaderAssets />,
        cell: row => row.renderValue(),
        accessorKey: 'assets',
      },
      {
        header: () => <TableHeaderComposition />,
        cell: row => row.renderValue(),
        accessorKey: 'composition',
      },
      {
        header: () => (
          <TableHeaderSortable
            sortKey="BALANCE"
            label="My Balance"
            sorting={sorting}
            setSorting={setSorting}
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'balance',
      },
      {
        header: () => (
          <TableHeaderSortable
            sortKey="POOL_VALUE"
            label="Pool value"
            sorting={sorting}
            setSorting={setSorting}
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'poolValue',
      },
      {
        header: () => <TableHeaderMyAPR />,
        cell: row => row.renderValue(),
        accessorKey: 'apr',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sorting]
  );

  return {
    columns,
    data: tableData,
  };
};
