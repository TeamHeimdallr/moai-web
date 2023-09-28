import { ReactNode, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import {
  TableColumn,
  TableColumnToken,
  TableColumnTokenIcon,
  TableHeaderAPR,
  TableHeaderAssets,
  TableHeaderComposition,
  TableHeaderSortable,
} from '~/components/tables';

import { formatNumber } from '~/utils/number';
import { useTableLiquidityPoolStore } from '~/states/components/table-liquidity-pool';

import { useGetLiquidityPoolLists } from '~/moai-xrp-ledger/api/api-contract/pool/get-liquidity-pool-lists';

import { LiquidityPoolTable } from '~/moai-xrp-ledger/types/components';

import { TOKEN } from '~/moai-xrp-ledger/types/contracts';

export const useTableLiquidityPool = () => {
  const data = useGetLiquidityPoolLists();

  const { sorting, setSorting } = useTableLiquidityPoolStore();
  const sortedData = data?.sort((a, b) => {
    if (sorting?.key === 'POOL_VALUE')
      return sorting.order === 'asc' ? a.poolValue - b.poolValue : b.poolValue - a.poolValue;

    if (sorting?.key === 'VOLUME')
      return sorting.order === 'asc' ? a.volume - b.volume : b.volume - a.volume;

    return 0;
  });

  const tableData = useMemo<LiquidityPoolTable[]>(
    () =>
      sortedData?.map(d => {
        const tokens = d.compositions.reduce((acc, cur) => {
          acc[cur.name as TOKEN] = cur.weight;
          return acc;
        }, {});

        return {
          id: d.id,
          'id-raw': d.id,
          'chain-raw': 'xrpl',
          assets: <TableColumnTokenIcon tokens={d.assets} />,
          compositions: <TableColumnToken tokens={tokens} isNew={d.isNew} />,
          poolValue: (
            <TableColumn value={`$${formatNumber(d.poolValue, 2)}`} width={160} align="flex-end" />
          ),
          volume: (
            <TableColumn value={`$${formatNumber(d.volume, 2)}`} width={160} align="flex-end" />
          ),
          apr: <TableColumn value={`${formatNumber(d.apr, 2)}%`} width={160} align="flex-end" />,
        };
      }),
    [sortedData]
  );

  const columns = useMemo<ColumnDef<LiquidityPoolTable, ReactNode>[]>(
    () => [
      { accessorKey: 'id-raw' },
      { accessorKey: 'chain-raw' },
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
        accessorKey: 'compositions',
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
            sortKey="VOLUME"
            label="Volume (24h)"
            sorting={sorting}
            setSorting={setSorting}
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'volume',
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
