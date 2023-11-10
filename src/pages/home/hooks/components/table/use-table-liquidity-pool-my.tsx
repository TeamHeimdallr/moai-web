import { ReactNode } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { useGetMyPoolsInfinityQuery } from '~/api/api-server/pools/get-my-pools';

import {
  TableColumn,
  TableColumnToken,
  TableHeaderComposition,
  TableHeaderMyAPR,
  TableHeaderSortable,
} from '~/components/tables';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { useTableMyLiquidityPoolSortStore } from '~/states/components';

export const useTableMyLiquidityPool = () => {
  const { selectedNetwork } = useNetwork();
  const { sort, setSort } = useTableMyLiquidityPoolSortStore();

  const netwokrAbbr = getNetworkAbbr(selectedNetwork);
  const { currentAddress } = useConnectedWallet(selectedNetwork);

  const { data, hasNextPage, fetchNextPage } = useGetMyPoolsInfinityQuery({
    queries: {
      take: 5,
      filter: `network:eq:${netwokrAbbr}`,
      sort: sort ? `${sort.key}:${sort.order}` : undefined,
      walletAddress: currentAddress || '',
    },
  });
  const pools = data?.pages?.flatMap(page => page.pools) || [];

  const tableData = pools?.map(d => {
    const tokens = d.compositions.reduce((acc, cur) => {
      acc[cur.symbol] = cur.weight;
      return acc;
    }, {});

    return {
      meta: {
        id: d.id,
        network: d.network,
      },
      compositions: <TableColumnToken tokens={tokens} />,
      balance: <TableColumn value={`$${formatNumber(d.balance, 2)}`} align="flex-end" />,
      poolValue: <TableColumn value={`$${formatNumber(d.value, 2)}`} align="flex-end" />,
      apr: <TableColumn value={`${formatNumber(d.apr, 2)}%`} align="flex-end" />,
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableColumns: ColumnDef<any, ReactNode>[] = [
    { accessorKey: 'meta' },
    {
      header: () => <TableHeaderComposition />,
      cell: row => row.renderValue(),
      accessorKey: 'compositions',
    },
    {
      header: () => (
        <TableHeaderSortable sortKey="balance" label="My Balance" sort={sort} setSort={setSort} />
      ),
      cell: row => row.renderValue(),
      accessorKey: 'balance',
    },
    {
      header: () => (
        <TableHeaderSortable sortKey="value" label="Pool value" sort={sort} setSort={setSort} />
      ),
      cell: row => row.renderValue(),
      accessorKey: 'poolValue',
    },
    {
      header: () => <TableHeaderMyAPR />,
      cell: row => row.renderValue(),
      accessorKey: 'apr',
    },
  ];

  return {
    tableColumns,
    tableData,

    pools,
    hasNextPage,
    fetchNextPage,
  };
};
