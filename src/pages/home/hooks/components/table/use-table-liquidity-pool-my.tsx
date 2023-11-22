import { ReactNode, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { useTableMyLiquidityPoolSortStore } from '~/states/components';

export const useTableMyLiquidityPool = () => {
  const navigate = useNavigate();
  const { selectedNetwork } = useNetwork();
  const { sort, setSort } = useTableMyLiquidityPoolSortStore();

  const { isMD } = useMediaQuery();

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
  const pools = useMemo(() => data?.pages?.flatMap(page => page.pools) || [], [data?.pages]);

  const tableData = useMemo(
    () =>
      pools?.map(d => ({
        meta: {
          id: d.id,
          poolId: d.poolId,
          network: d.network,
        },
        compositions: (
          <TableColumnToken
            tokens={d.compositions.map(t => ({ symbol: t.symbol, image: t.image }))}
          />
        ),
        balance: <TableColumn value={`$${formatNumber(d.balance, 2)}`} align="flex-end" />,
        poolValue: <TableColumn value={`$${formatNumber(d.value, 2)}`} align="flex-end" />,
        apr: <TableColumn value={`${formatNumber(d.apr, 2)}%`} align="flex-end" />,
      })),
    [pools]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableColumns = useMemo<ColumnDef<any, ReactNode>[]>(
    () => [
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );

  const mobileTableData = useMemo(
    () =>
      pools.map(d => ({
        meta: {
          poolId: d.poolId,
          network: getNetworkAbbr(d.network),
        },
        rows: [
          <TableColumnToken
            key={d.id}
            tokens={d.compositions.map(t => ({ symbol: t.symbol, image: t.image }))}
          />,
        ],
        dataRows: [
          {
            label: 'Pool value',
            value: <TableColumn value={`$${formatNumber(d.value, 2)}`} align="flex-end" />,
          },
          {
            label: 'My Balance',
            value: <TableColumn value={`$${formatNumber(d.balance, 2)}`} align="flex-end" />,
          },
          {
            label: 'My APR',
            value: <TableColumn value={`${formatNumber(d.apr, 2)}%`} align="flex-end" />,
          },
        ],
      })),
    [pools]
  );

  const mobileTableColumn = useMemo<ReactNode>(
    () => (
      <TableHeaderSortable sortKey="balance" label="My Balance" sort={sort} setSort={setSort} />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );
  const handleMobileRowClick = (network: string, poolId: string) => {
    navigate(`/pools/${network}/${poolId}`);
  };

  useEffect(() => {
    if (!isMD) setSort({ key: 'balance', order: 'desc' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMD]);

  return {
    tableColumns,
    tableData,

    mobileTableData,
    mobileTableColumn,
    handleMobileRowClick,

    pools,
    hasNextPage,
    fetchNextPage,
  };
};
