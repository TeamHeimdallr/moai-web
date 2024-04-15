import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { isEqual } from 'lodash-es';

import { useUserLpFarmsDeposited } from '~/api/api-contract/_evm/balance/lp-farm-balance';
import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useGetMyPoolsQuery } from '~/api/api-server/pools/get-my-pools';
import { useGetPoolsQuery } from '~/api/api-server/pools/get-pools';

import { IS_MAINNET, MILLION, TRILLION } from '~/constants';

import {
  TableColumn,
  TableColumnToken,
  TableHeaderComposition,
  TableHeaderSortable,
} from '~/components/tables';
import { TableColumnApr } from '~/components/tables/columns/column-normal-icon';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery, usePrevious } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { useTableMyLiquidityPoolSortStore } from '~/states/components';
import { IMyPoolList, NETWORK } from '~/types';

export const useTableMyLiquidityPool = () => {
  const [poolsRaw, setPools] = useState<IMyPoolList[]>();
  const [currentTake, setCurrentTake] = useState(5);

  const navigate = useNavigate();
  const { selectedNetwork } = useNetwork();
  const { sort, setSort } = useTableMyLiquidityPoolSortStore();

  const { isMD } = useMediaQuery();

  const networkAbbr = getNetworkAbbr(selectedNetwork);
  const { currentAddress } = useConnectedWallet(selectedNetwork);

  const { userAllTokenBalances } = useUserAllTokenBalances();

  const { data: allPoolsData } = useGetPoolsQuery(
    { queries: { filter: `network:eq:${networkAbbr}` } },
    { enabled: !!networkAbbr }
  );
  const allPools = allPoolsData?.pools;

  // TODO: AMM remove this
  const url = window.location.href;
  const isXrpl = selectedNetwork === NETWORK.XRPL;
  const isXrplPrivate = !IS_MAINNET || (IS_MAINNET && url.includes('mainnet-th'));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _poolWithDeposited = useUserLpFarmsDeposited({ pools: allPools as any });
  const poolWithDeposited = _poolWithDeposited
    ?.map(pool => {
      const balance = (pool.balance || 0) + (pool.deposited || 0);
      const value = pool.value + (pool.totalDepositedValue || 0);
      return {
        ...pool,
        balance,
        value,
      };
    })
    ?.filter(pool => pool.balance > 0)
    ?.map(pool => ({
      address: (pool.address || '') as string,
      balance: (pool.balance || 0) as number,
      totalSupply: (pool?.totalSupply || 0) as number, // not used
    }));

  const userLpTokens = useMemo(
    () => userAllTokenBalances?.filter(item => item.isLpToken),
    [userAllTokenBalances]
  );
  const { mutateAsync } = useGetMyPoolsQuery({
    queries: {
      take: 100,
      filter: `network:eq:${networkAbbr}`,
      sort: sort ? `${sort.key}:${sort.order}` : undefined,
    },
  });

  const userLpTokenRequest = userLpTokens
    ?.map(item => {
      const depositedPool = poolWithDeposited?.find(pool => pool.address === item.address);
      const deposited = depositedPool?.balance || 0;

      return {
        address: item.address,
        balance: item.balance + deposited,
        totalSupply: item.totalSupply,
      };
    })
    ?.filter(item => item.balance > 0);

  const previous = usePrevious<
    {
      address: string;
      balance: number;
      totalSupply: number;
    }[]
  >(poolWithDeposited);
  const isRequestEqual = isEqual(previous, poolWithDeposited);

  useEffect(() => {
    if (!currentAddress || !isXrplPrivate) {
      setPools([]);
      return;
    }

    const fetch = async () => {
      const res = await mutateAsync?.({
        walletAddress: currentAddress || '',
        lpTokens: userLpTokenRequest.map(item => ({
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
  }, [networkAbbr, currentAddress, isRequestEqual, sort?.key, sort?.order, isXrplPrivate]);

  const pools = useMemo(
    () => (poolsRaw?.slice(0, currentTake) || []) as IMyPoolList[],
    [currentTake, poolsRaw]
  );
  const hasNextPage = (poolsRaw?.length || 0) > currentTake;
  const fetchNextPage = () => {
    setCurrentTake(currentTake + 5);
  };

  const poolWithFarm = useUserLpFarmsDeposited({ pools });

  const tableData = useMemo(
    () =>
      poolWithFarm?.map(d => {
        // pool에 xrp가 있는 경우, xrp를 기준으로 가격정보를 보여줌. xrp가 없는 경우 '-'로 표시
        const hasPrice = isXrpl ? !!d.compositions.find(t => t.symbol === 'XRP') : true;

        return {
          meta: {
            id: d.id,
            poolId: d.poolId,
            network: d.network,
          },
          compositions: (
            <TableColumnToken
              tokens={d.compositions.map(t => ({
                symbol: t.symbol,
                image: t.image,
                issuer: t.issuerOrganization,
              }))}
              disableSelectedToken
            />
          ),
          balance: (
            <TableColumn
              value={hasPrice ? `$${formatNumber(d.balance, 2, 'floor', MILLION)}` : '-'}
              align="flex-end"
            />
          ),
          poolValue: (
            <TableColumn
              value={hasPrice ? `$${formatNumber(d.value, 2, 'floor', MILLION)}` : '-'}
              align="flex-end"
            />
          ),
          apr: (
            <TableColumnApr
              value={hasPrice ? `${formatNumber(d.apr)}%` : '-'}
              value2={
                isFinite(d.farmApr)
                  ? `${formatNumber(d.farmApr, 0, 'floor', TRILLION, 0)}%`
                  : undefined
              }
              network={d.network}
              align="flex-end"
            />
          ),
        };
      }),
    [isXrpl, poolWithFarm]
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
      poolWithFarm.map(d => {
        // pool에 xrp가 있는 경우, xrp를 기준으로 가격정보를 보여줌. xrp가 없는 경우 '-'로 표시
        const hasPrice = isXrpl ? !!d.compositions.find(t => t.symbol === 'XRP') : true;

        return {
          meta: {
            poolId: d.poolId,
            network: getNetworkAbbr(d.network),
          },
          rows: [
            <TableColumnToken
              key={d.id}
              tokens={d.compositions.map(t => ({
                symbol: t.symbol,
                image: t.image,
                issuer: t.issuerOrganization,
              }))}
            />,
          ],
          dataRows: [
            {
              label: 'Pool value',
              value: (
                <TableColumn
                  value={hasPrice ? `$${formatNumber(d.value, 2, 'floor', MILLION)}` : '-'}
                  align="flex-end"
                />
              ),
            },
            {
              label: 'My Balance',
              value: (
                <TableColumn
                  value={hasPrice ? `$${formatNumber(d.balance, 2, 'floor', MILLION)}` : '-'}
                  align="flex-end"
                />
              ),
            },
            {
              label: 'My APR',
              value: (
                <TableColumnApr
                  value={hasPrice ? `${formatNumber(d.apr)}%` : '-'}
                  value2={
                    isFinite(d.farmApr)
                      ? `${formatNumber(d.farmApr, 0, 'floor', TRILLION, 0)}%`
                      : undefined
                  }
                  network={d.network}
                  align="flex-end"
                />
              ),
            },
          ],
        };
      }),
    [isXrpl, poolWithFarm]
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

    pools: poolWithFarm,
    hasNextPage,
    fetchNextPage,
  };
};
