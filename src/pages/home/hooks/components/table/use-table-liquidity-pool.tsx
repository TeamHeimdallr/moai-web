import { ReactNode, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';

import { useGetPoolsInfinityQuery } from '~/api/api-server/pools/get-pools';

import { NetworkChip } from '~/components/network-chip';
import {
  TableColumn,
  TableColumnToken,
  TableHeader,
  TableHeaderAPR,
  TableHeaderComposition,
  TableHeaderSortable,
} from '~/components/tables';

import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkAbbr, getNetworkFull } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { useTableLiquidityPoolSortStore } from '~/states/components';
import { useShowAllPoolsStore } from '~/states/pages';

interface Props {
  showNetworkColumn?: boolean;
}

export const useTableLiquidityPool = ({ showNetworkColumn }: Props) => {
  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const { sort, setSort } = useTableLiquidityPoolSortStore();
  const { showAllPools } = useShowAllPoolsStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetwokrAbbr = getNetworkAbbr(currentNetwork);

  const { data, hasNextPage, fetchNextPage } = useGetPoolsInfinityQuery({
    queries: {
      take: 10,
      filter: showAllPools && currentNetwokrAbbr ? `network:eq:${currentNetwokrAbbr}` : undefined,
      sort: sort ? `${sort.key}:${sort.order}` : undefined,
    },
  });
  const pools = useMemo(() => data?.pages?.flatMap(page => page.pools) || [], [data?.pages]);
  const poolTokens = useMemo(
    () => data?.pages?.flatMap(page => page.poolTokens) || [],
    [data?.pages]
  );

  const tableData = useMemo(
    () =>
      pools.map(d => {
        const tokens = d.compositions.reduce((acc, cur) => {
          acc[cur.symbol] = cur.currentWeight || 0;
          return acc;
        }, {});

        return {
          meta: {
            id: d.id,
            network: d.network,
          },
          network: showNetworkColumn ? (
            <TableColumn value={<NetworkChip network={d.network} />} />
          ) : null,
          compositions: <TableColumnToken tokens={tokens} />,
          poolValue: <TableColumn value={`$${formatNumber(d.value, 2)}`} align="flex-end" />,
          volume: <TableColumn value={`$${formatNumber(d.volume, 2)}`} align="flex-end" />,
          apr: <TableColumn value={`${formatNumber(d.apr, 2)}%`} align="flex-end" />,
        };
      }),
    [pools, showNetworkColumn]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableColumns = useMemo<ColumnDef<any, ReactNode>[]>(
    () => [
      { accessorKey: 'meta' },

      showNetworkColumn
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
        header: () => <TableHeaderAPR />,
        cell: row => row.renderValue(),
        accessorKey: 'apr',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showNetworkColumn, sort]
  );

  return {
    tableColumns,
    tableData,

    pools,
    poolTokens,
    hasNextPage,
    fetchNextPage,
  };
};
