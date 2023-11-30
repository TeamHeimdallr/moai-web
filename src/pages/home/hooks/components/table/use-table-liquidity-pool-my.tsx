import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { isEqual } from 'lodash-es';

import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useGetMyPoolsQuery } from '~/api/api-server/pools/get-my-pools';

import {
  TableColumn,
  TableColumnToken,
  TableHeaderComposition,
  TableHeaderSortable,
} from '~/components/tables';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery, usePrevious } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { useTableMyLiquidityPoolSortStore } from '~/states/components';
import { IMyPoolList } from '~/types';

export const useTableMyLiquidityPool = () => {
  const [poolsRaw, setPools] = useState<IMyPoolList[]>();
  const [currentTake, setCurrentTake] = useState(5);

  const navigate = useNavigate();
  const { selectedNetwork } = useNetwork();
  const { sort, setSort } = useTableMyLiquidityPoolSortStore();

  const { isMD } = useMediaQuery();

  const netwokrAbbr = getNetworkAbbr(selectedNetwork);
  const { currentAddress } = useConnectedWallet(selectedNetwork);

  const { userAllTokenBalances } = useUserAllTokenBalances();
  const userLpTokens = useMemo(
    () => userAllTokenBalances.filter(item => item.isLpToken && item.balance > 0),
    [userAllTokenBalances]
  );
  const { mutateAsync } = useGetMyPoolsQuery({
    queries: {
      take: 100,
      filter: `network:eq:${netwokrAbbr}`,
      sort: sort ? `${sort.key}:${sort.order}` : undefined,
    },
  });

  const userLpTokenRequest = userLpTokens.map(item => ({
    address: item.address,
    balance: item.balance,
    totalSupply: item.totalSupply,
  }));

  const previous = usePrevious<
    {
      address: string;
      balance: number;
      totalSupply: number;
    }[]
  >(userLpTokenRequest);
  const isRequestEqual = isEqual(previous, userLpTokenRequest);

  useEffect(() => {
    if (!currentAddress) return;

    const fetch = async () => {
      const res = await mutateAsync?.({
        walletAddress: currentAddress || '',
        lpTokens: userLpTokens.map(item => ({
          address: item.address,
          balance: item.balance,
          totalSupply: item.totalSupply,
        })),
      });

      const { pools } = res || {};
      setPools(pools);
    };

    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAddress, isRequestEqual, sort?.key, sort?.order]);

  const pools = useMemo(() => poolsRaw?.slice(0, currentTake) || [], [currentTake, poolsRaw]);
  const hasNextPage = (poolsRaw?.length || 0) > currentTake;
  const fetchNextPage = () => {
    setCurrentTake(currentTake + 5);
  };

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
            disableSelectedToken
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
        header: () => (
          <TableHeaderSortable sortKey="apr" label="My APR" sort={sort} setSort={setSort} />
        ),
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
