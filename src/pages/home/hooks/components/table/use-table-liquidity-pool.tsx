import { ReactNode, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { uniqBy } from 'lodash-es';

import { useUserLpFarmsDeposited } from '~/api/api-contract/_evm/balance/lp-farm-balance';
import { useGetPoolsInfinityQuery } from '~/api/api-server/pools/get-pools';

import { IS_MAINNET, MILLION, TRILLION } from '~/constants';

import { NetworkChip } from '~/components/network-chip';
import {
  TableColumn,
  TableColumnToken,
  TableHeader,
  TableHeaderComposition,
  TableHeaderSortable,
} from '~/components/tables';
import { TableColumnApr } from '~/components/tables/columns/column-normal-icon';

import { useShowAllPoolsStore } from '~/pages/home/states';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { getNetworkAbbr, getNetworkFull } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import {
  useTableLiquidityPoolSortStore,
  useTablePoolCompositionSelectTokenStore,
} from '~/states/components';
import { IPoolList, NETWORK } from '~/types';

export const useTableLiquidityPool = () => {
  const navigate = useNavigate();

  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const { sort, setSort } = useTableLiquidityPoolSortStore();
  const { showAllPools } = useShowAllPoolsStore();

  const { isMD } = useMediaQuery();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { selectedTokens } = useTablePoolCompositionSelectTokenStore();

  // TODO: AMM remove this
  const url = window.location.href;
  const isXrpl = currentNetwork === NETWORK.XRPL;
  const isXrplPrivate = !IS_MAINNET || (IS_MAINNET && url.includes('mainnet-th'));

  const getFilter = () => {
    // show all pool 의 경우 xrpl에서는 whitelist만 보여줌. 다른 네트워크에서는 전체 풀을 보여줌
    if (showAllPools) return undefined;

    // xrpl이 아닌경우 전체 풀을 보여줌
    if (selectedNetwork !== 'XRPL') return `network:eq:${currentNetworkAbbr}`;

    // xrpl인 경우 선택된 토큰이 없으면 whitelist가 true인 풀만 보여줌
    if (selectedTokens.length === 0)
      return `network:eq:${currentNetworkAbbr}_whitelist:eq:true:boolean`;
    // xrpl인 경우 선택된 토큰이 있으면 whitelist와 관계없이 선택된 토큰이 포함된 풀을 보여줌
    return `network:eq:${currentNetworkAbbr}`;
  };
  const { data, hasNextPage, fetchNextPage } = useGetPoolsInfinityQuery(
    {
      queries: {
        take: 10,
        filter: getFilter(),
        sort: sort ? `${sort.key}:${sort.order}` : undefined,
        tokens: selectedTokens.length > 0 ? selectedTokens.map(t => t.symbol).join(',') : undefined,
      },
    },
    { enabled: isXrpl ? isXrplPrivate : true }
  );
  const pools = useMemo(
    () => (data?.pages?.flatMap(page => page.pools) || []) as IPoolList[],
    [data?.pages]
  );
  const poolTokens = useMemo(
    () => uniqBy(data?.pages?.flatMap(page => page.poolTokens) || [], 'symbol'),
    [data?.pages]
  );

  const poolWithFarm = useUserLpFarmsDeposited({ pools });

  const tableData = useMemo(
    () =>
      poolWithFarm.map(d => {
        // pool에 xrp가 있는 경우, xrp를 기준으로 가격정보를 보여줌. xrp가 없는 경우 '-'로 표시
        const hasPrice = isXrpl ? !!d.compositions.find(t => t.symbol === 'XRP') : true;

        return {
          meta: {
            id: d.id,
            poolId: d.poolId,
            network: d.network,
          },
          network: showAllPools ? (
            <TableColumn value={<NetworkChip network={d.network} />} />
          ) : null,
          compositions: (
            <TableColumnToken
              tokens={d.compositions.map(t => ({
                symbol: t.symbol,
                image: t.image,
                issuer: t.issuerOrganization,
              }))}
            />
          ),
          poolValue: (
            <TableColumn
              value={hasPrice ? `$${formatNumber(d.value, 2, 'floor', MILLION)}` : '-'}
              align="flex-end"
            />
          ),
          volume: (
            <TableColumn
              value={hasPrice ? `$${formatNumber(d.volume, 2, 'floor', MILLION)}` : '-'}
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
              align="flex-end"
              network={d.network}
            />
          ),
        };
      }),
    [poolWithFarm, showAllPools, isXrpl]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableColumns = useMemo<ColumnDef<any, ReactNode>[]>(
    () => [
      { accessorKey: 'meta' },

      showAllPools
        ? {
            header: () => <TableHeader label="Chain" />,
            cell: row => row.renderValue(),
            accessorKey: 'network',
          }
        : {
            header: () => <></>,
            accessorKey: 'null',
          },

      {
        header: () => <TableHeaderComposition />,
        cell: row => row.renderValue(),
        accessorKey: 'compositions',
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
          <TableHeaderSortable
            sortKey="volume"
            label="Volume (24h)"
            sort={sort}
            setSort={setSort}
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'volume',
      },
      {
        header: () => (
          <TableHeaderSortable sortKey="apr" label="APR" sort={sort} setSort={setSort} />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'apr',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showAllPools, sort]
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
            showAllPools ? (
              <TableColumn key={d.id} value={<NetworkChip network={d.network} />} />
            ) : (
              <></>
            ),
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
              label: 'Volume (24h)',
              value: (
                <TableColumn
                  value={hasPrice ? `$${formatNumber(d.volume, 2, 'floor', MILLION)}` : '-'}
                  align="flex-end"
                />
              ),
            },
            {
              label: 'APR',
              value: (
                <TableColumnApr
                  value={hasPrice ? `${formatNumber(d.apr)}%` : '-'}
                  value2={
                    isFinite(d.farmApr)
                      ? `${formatNumber(d.farmApr, 0, 'floor', TRILLION, 0)}%`
                      : undefined
                  }
                  align="flex-end"
                  network={d.network}
                />
              ),
            },
          ],
        };
      }),
    [poolWithFarm, showAllPools, isXrpl]
  );

  const mobileTableColumn = useMemo<ReactNode>(
    () => <TableHeaderSortable sortKey="value" label="Pool value" sort={sort} setSort={setSort} />,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );
  const handleMobileRowClick = (network: string, poolId: string) => {
    navigate(`/pools/${network}/${poolId}`);
  };

  useEffect(() => {
    if (!isMD) setSort({ key: 'value', order: 'desc' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMD]);

  return {
    tableColumns,
    tableData,

    mobileTableData,
    mobileTableColumn,
    handleMobileRowClick,

    pools: poolWithFarm,
    poolTokens,
    hasNextPage,
    fetchNextPage,
  };
};
