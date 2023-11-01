import { useMemo } from 'react';

import { useGetLiquidityPoolLists } from '~/api/api-contract/pool/get-liquidity-pool-lists';

import {
  TableColumn,
  TableColumnToken,
  TableColumnTokenIcon,
  TableHeaderComposition,
  TableHeaderMyAPR,
  TableHeaderSortable,
} from '~/components/tables';

import { formatNumber } from '~/utils/util-number';
import { useTableMyLiquidityPoolSortStore } from '~/states/components';

export const useTableLiquidityMy = () => {
  const data = useGetLiquidityPoolLists();
  const empty = data.every(d => d.balance === 0);

  const { sort, setSort } = useTableMyLiquidityPoolSortStore();
  const sortedData = data?.sort((a, b) => {
    if (sort?.key === 'POOL_VALUE')
      return sort.order === 'asc' ? a.poolValue - b.poolValue : b.poolValue - a.poolValue;
    if (sort?.key === 'VOLUME')
      return sort.order === 'asc' ? a.volume - b.volume : b.volume - a.volume;
    return 0;
  });

  const tableData = useMemo(
    () =>
      sortedData?.map(d => {
        const tokens = d.compositions.reduce((acc, cur) => {
          acc[cur.symbol] = cur.weight;
          return acc;
        }, {});

        return {
          id: d.id,
          meta: {
            id: d.id,
            network: d.network,
          },
          assets: <TableColumnTokenIcon tokens={d.assets} />,
          compositions: <TableColumnToken tokens={tokens} isNew={d.isNew} />,
          balance: <TableColumn value={`$${formatNumber(d.balance, 2)}`} align="flex-end" />,
          poolValue: <TableColumn value={`$${formatNumber(d.poolValue, 2)}`} align="flex-end" />,
          apr: <TableColumn value={`${formatNumber(d.apr, 2)}%`} align="flex-end" />,
        };
      }),
    [sortedData]
  );

  const columns = useMemo(
    () => [
      { accessorKey: 'meta' },
      {
        header: () => <TableHeaderComposition />,
        cell: row => row.renderValue(),
        accessorKey: 'compositions',
      },
      {
        header: () => (
          <TableHeaderSortable sortKey="BALANCE" label="My Balance" sort={sort} setSort={setSort} />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'balance',
      },
      {
        header: () => (
          <TableHeaderSortable
            sortKey="POOL_VALUE"
            label="Pool value"
            sort={sort}
            setSort={setSort}
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
    [sort]
  );

  return {
    columns,
    data: tableData,
    empty,
  };
};
