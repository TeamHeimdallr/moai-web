import { ReactNode, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { uniqBy } from 'lodash-es';

import { useUserLpFarmsDeposited } from '~/api/api-contract/_evm/balance/lp-farm-balance';
import { useGetPoolsInfinityQuery } from '~/api/api-server/pools/get-pools';

import { MILLION, TRILLION } from '~/constants';

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
import { IPoolList } from '~/types';

export const useTableLiquidityPool = () => {
  const navigate = useNavigate();

  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const { sort, setSort } = useTableLiquidityPoolSortStore();
  const { showAllPools } = useShowAllPoolsStore();

  const { isMD } = useMediaQuery();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetwokrAbbr = getNetworkAbbr(currentNetwork);

  const { selectedTokens } = useTablePoolCompositionSelectTokenStore();

  const { data, hasNextPage, fetchNextPage } = useGetPoolsInfinityQuery({
    queries: {
      take: 10,
      filter: showAllPools ? undefined : `network:eq:${currentNetwokrAbbr}`,
      sort: sort ? `${sort.key}:${sort.order}` : undefined,
      tokens: selectedTokens.length > 0 ? selectedTokens.join(',') : undefined,
    },
  });
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
      poolWithFarm.map(d => ({
        meta: {
          id: d.id,
          poolId: d.poolId,
          network: d.network,
        },
        network: showAllPools ? <TableColumn value={<NetworkChip network={d.network} />} /> : null,
        compositions: (
          <TableColumnToken
            tokens={d.compositions.map(t => ({ symbol: t.symbol, image: t.image }))}
          />
        ),
        poolValue: (
          <TableColumn value={`$${formatNumber(d.value, 2, 'floor', MILLION)}`} align="flex-end" />
        ),
        volume: (
          <TableColumn value={`$${formatNumber(d.volume, 2, 'floor', MILLION)}`} align="flex-end" />
        ),
        apr: (
          <TableColumnApr
            value={`${formatNumber(d.apr)}%`}
            value2={
              isFinite(d.farmApr)
                ? `${formatNumber(d.farmApr, 0, 'floor', TRILLION, 0)}%`
                : undefined
            }
            align="flex-end"
            network={d.network}
          />
        ),
      })),
    [poolWithFarm, showAllPools]
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
      pools.map(d => ({
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
            tokens={d.compositions.map(t => ({ symbol: t.symbol, image: t.image }))}
          />,
        ],
        dataRows: [
          {
            label: 'Pool value',
            value: (
              <TableColumn
                value={`$${formatNumber(d.value, 2, 'floor', MILLION)}`}
                align="flex-end"
              />
            ),
          },
          {
            label: 'Volume (24h)',
            value: (
              <TableColumn
                value={`$${formatNumber(d.volume, 2, 'floor', MILLION)}`}
                align="flex-end"
              />
            ),
          },
          {
            label: 'APR',
            value: (
              <TableColumnApr
                value={`${formatNumber(d.apr)}%`}
                network={d.network}
                align="flex-end"
              />
            ),
          },
        ],
      })),
    [pools, showAllPools]
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

    pools,
    poolTokens,
    hasNextPage,
    fetchNextPage,
  };
};
