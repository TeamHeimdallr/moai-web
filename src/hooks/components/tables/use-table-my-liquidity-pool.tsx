import { ColumnDef } from '@tanstack/react-table';
import { ReactNode, useMemo } from 'react';

import { useGetLiquidityPoolLists } from '~/api/api-contract/pool/get-liquidity-pool-lists';
import {
  TableHeaderAssets,
  TableHeaderComposition,
  TableHeaderMyAPR,
  TableHeaderSortable,
} from '~/components/tables';
import { TableColumn, TableColumnToken, TableColumnTokenIcon } from '~/components/tables/columns';
import { useTableMyLiquidityStore } from '~/states/components/table-my-liquidity';
import { MyLiquidityPoolTable } from '~/types/components';
import { formatNumber } from '~/utils/number';

export const useTableMyLiquidity = () => {
  const { sorting, setSorting } = useTableMyLiquidityStore();
  const data = useGetLiquidityPoolLists();

  const sortedData = data?.sort((a, b) => {
    if (sorting?.key === 'POOL_VALUE')
      return sorting.order === 'asc' ? a.poolValue - b.poolValue : b.poolValue - a.poolValue;
    if (sorting?.key === 'VOLUME')
      return sorting.order === 'asc' ? a.volume - b.volume : b.volume - a.volume;
    return 0;
  });

  const tableData = useMemo<MyLiquidityPoolTable[]>(
    () =>
      sortedData?.map(d => ({
        id: d.id,
        assets: <TableColumnTokenIcon tokens={d.assets} />,
        composition: <TableColumnToken tokens={d.composition} isNew={d.isNew} />,
        balance: (
          <TableColumn value={`$${formatNumber(d.balance, 2)}`} width={160} align="flex-end" />
        ),
        poolValue: (
          <TableColumn value={`$${formatNumber(d.poolValue, 2)}`} width={160} align="flex-end" />
        ),
        apr: <TableColumn value={`${d.apr}%`} width={160} align="flex-end" />,
      })),
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
