import { ColumnDef } from '@tanstack/react-table';
import { ReactNode, useMemo } from 'react';

import {
  TableHeaderAPR,
  TableHeaderAssets,
  TableHeaderComposition,
  TableHeaderSortable,
} from '~/components/tables';
import { TableColumn, TableColumnToken, TableColumnTokenIcon } from '~/components/tables/columns';
import { TOKEN } from '~/constants';
import { useTableLiquidityStore } from '~/states/components/table-liquidity-pool';
import { LiquidityPoolTable } from '~/types/components/tables';
import { formatNumber } from '~/utils/number';
import { sumPoolValues } from '~/utils/token';

export const useTableLiquidityPool = () => {
  const { sorting, setSorting } = useTableLiquidityStore();

  // TODO: fetch from contract api
  const data = [
    {
      assets: [TOKEN.MNT, TOKEN.DAI],
      composition: {
        [TOKEN.MNT]: 20,
        [TOKEN.DAI]: 80,
      } as Record<TOKEN, number>,
      pool: {
        [TOKEN.MNT]: 1029000,
        [TOKEN.DAI]: 348008,
      } as Record<TOKEN, number>,
      volume: 639120,
      apr: 0.87,
      isNew: true,
    },
    {
      assets: [TOKEN.MOAI, TOKEN.MNT, TOKEN.USDC],
      composition: {
        [TOKEN.MOAI]: 30,
        [TOKEN.MNT]: 30,
        [TOKEN.USDC]: 40,
      } as Record<TOKEN, number>,
      pool: {
        [TOKEN.MNT]: 102090,
        [TOKEN.DAI]: 34808,
        [TOKEN.USDC]: 23040,
      } as Record<TOKEN, number>,
      volume: 639120,
      apr: 0.87,
      isNew: false,
    },
  ];

  const sortedData = data.sort((a, b) => {
    if (sorting?.key === 'POOL_VALUE')
      return sorting.order === 'asc'
        ? sumPoolValues(a.pool) - sumPoolValues(b.pool)
        : sumPoolValues(b.pool) - sumPoolValues(a.pool);
    if (sorting?.key === 'POOL_VALUE')
      return sorting.order === 'asc' ? a.volume - b.volume : b.volume - a.volume;
    return 0;
  });

  const tableData = useMemo<LiquidityPoolTable[]>(
    () =>
      sortedData.map(d => ({
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
        apr: <TableColumn value={`${d.apr}$`} width={160} align="flex-end" />,
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
