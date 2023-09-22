import { ReactNode, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import {
  TableHeaderAssets,
  TableHeaderComposition,
  TableHeaderMyAPR,
  TableHeaderSortable,
} from '~/components/tables';
import { TableColumn, TableColumnToken, TableColumnTokenIcon } from '~/components/tables/columns';

import { formatNumber } from '~/utils/number';
import { useTableMyLiquidityStore } from '~/states/components/table-my-liquidity';

import { useGetLiquidityPoolLists } from '~/moai-evm/api/api-contract/pool/get-liquidity-pool-lists';

import { MyLiquidityPoolTable } from '~/moai-evm/types/components';

import { TOKEN } from '~/moai-evm/types/contracts';

export const useTableMyLiquidity = () => {
  const data = useGetLiquidityPoolLists();
  const empty = data.every(d => d.balance === 0);

  const { sorting, setSorting } = useTableMyLiquidityStore();
  const sortedData = data?.sort((a, b) => {
    if (sorting?.key === 'POOL_VALUE')
      return sorting.order === 'asc' ? a.poolValue - b.poolValue : b.poolValue - a.poolValue;
    if (sorting?.key === 'VOLUME')
      return sorting.order === 'asc' ? a.volume - b.volume : b.volume - a.volume;
    return 0;
  });

  const tableData = useMemo<MyLiquidityPoolTable[]>(
    () =>
      sortedData?.map(d => {
        const tokens = d.compositions.reduce((acc, cur) => {
          acc[cur.name as TOKEN] = cur.weight;
          return acc;
        }, {});

        return {
          id: d.id,
          assets: <TableColumnTokenIcon tokens={d.assets} />,
          compositions: <TableColumnToken tokens={tokens} isNew={d.isNew} />,
          balance: (
            <TableColumn value={`$${formatNumber(d.balance, 2)}`} width={160} align="flex-end" />
          ),
          poolValue: (
            <TableColumn value={`$${formatNumber(d.poolValue, 2)}`} width={160} align="flex-end" />
          ),
          apr: <TableColumn value={`${formatNumber(d.apr, 2)}%`} width={160} align="flex-end" />,
        };
      }),
    [sortedData]
  );

  const columns = useMemo<ColumnDef<MyLiquidityPoolTable, ReactNode>[]>(
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
        accessorKey: 'compositions',
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
    empty,
  };
};
