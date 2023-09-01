import { ColumnDef } from '@tanstack/react-table';
import { ReactNode, useMemo } from 'react';

import {
  TableHeaderAPR,
  TableHeaderAssets,
  TableHeaderComposition,
  TableHeaderSortable,
} from '~/components/tables';
import { TableColumn, TableColumnToken, TableColumnTokenIcon } from '~/components/tables/columns';
import { useTableLiquidityStore } from '~/states/components/table-liquidity-pool';
import { LiquidityPoolTable } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';
import { sumPoolValues } from '~/utils/token';

export const useTableLiquidityPool = () => {
  const { sorting, setSorting } = useTableLiquidityStore();

  // TODO: fetch from contract api
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any[] = [
    {
      assets: [TOKEN.MOAI, TOKEN.WETH],
      composition: {
        [TOKEN.MOAI]: 80,
        [TOKEN.WETH]: 20,
      } as Record<TOKEN, number>,
      pool: {
        [TOKEN.MOAI]: 7077.75,
        [TOKEN.WETH]: 147,
      } as Record<TOKEN, number>,
      volume: 78086.25,
      apr: 6.79,
      isNew: true,
    },
    {
      assets: [TOKEN.WETH, TOKEN.USDC, TOKEN.USDT],
      composition: {
        [TOKEN.WETH]: 50,
        [TOKEN.USDC]: 30,
        [TOKEN.USDT]: 20,
      } as Record<TOKEN, number>,
      pool: {
        [TOKEN.WETH]: 293,
        [TOKEN.USDC]: 302205,
        [TOKEN.USDT]: 201470,
      } as Record<TOKEN, number>,
      volume: 45813,
      apr: 4.98,
      isNew: true,
    },
  ];

  const sortedData = data?.sort((a, b) => {
    if (sorting?.key === 'POOL_VALUE')
      return sorting.order === 'asc'
        ? sumPoolValues(a.pool) - sumPoolValues(b.pool)
        : sumPoolValues(b.pool) - sumPoolValues(a.pool);
    if (sorting?.key === 'VOLUMN')
      return sorting.order === 'asc' ? a.volume - b.volume : b.volume - a.volume;
    return 0;
  });

  const tableData = useMemo<LiquidityPoolTable[]>(
    () =>
      sortedData?.map(d => ({
        assets: <TableColumnTokenIcon tokens={d.assets} />,
        composition: <TableColumnToken tokens={d.composition} isNew={d.isNew} />,
        poolValue: (
          <TableColumn
            value={`$${formatNumber(sumPoolValues(d.pool), 2)}`}
            width={160}
            align="flex-end"
          />
        ),
        volumn: (
          <TableColumn value={`$${formatNumber(d.volume, 2)}`} width={160} align="flex-end" />
        ),
        apr: <TableColumn value={`${d.apr}%`} width={160} align="flex-end" />,
      })),
    [sortedData]
  );

  const columns = useMemo<ColumnDef<LiquidityPoolTable, ReactNode>[]>(
    () => [
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
        header: () => (
          <TableHeaderSortable
            sortKey="VOLUMN"
            label="Volume (24h)"
            sorting={sorting}
            setSorting={setSorting}
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'volumn',
      },
      {
        header: () => <TableHeaderAPR />,
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
