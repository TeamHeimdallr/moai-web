import { ReactNode, useMemo } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';
import { useGetSwapHistoriesInfinityQuery } from '~/api/api-server/pools/get-swap-histories';

import { SCANNER_URL } from '~/constants';

import {
  TableColumn,
  TableColumnIconText,
  TableColumnLink,
  TableColumnTokenSwap,
  TableHeader,
  TableHeaderSortable,
} from '~/components/tables';

import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { truncateAddress } from '~/utils/util-string';
import { elapsedTime } from '~/utils/util-time';
import { useTableSwapHistoriesStore } from '~/states/components';

export const useTableSwapHistories = () => {
  const { network, id } = useParams();
  const { selectedNetwork, isXrp } = useNetwork();
  const { sort, setSort } = useTableSwapHistoriesStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
    },
    {
      enabled: !!network && !!id,
      staleTime: 1000,
    }
  );
  const {
    data: swapHistoriesData,
    hasNextPage,
    fetchNextPage,
  } = useGetSwapHistoriesInfinityQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
      queries: {
        take: 5,
        sort: sort ? `${sort.key}:${sort.order}` : undefined,
      },
    },
    {
      enabled: !!network && !!id,
      staleTime: 1000,
    }
  );

  const { pool } = poolData || {};
  const { compositions } = pool || {};

  const swapHistories = useMemo(
    () => swapHistoriesData?.pages?.flatMap(page => page.swapHistories) || [],
    [swapHistoriesData?.pages]
  );

  const tableData = useMemo(
    () =>
      swapHistories?.map(d => {
        const value = d.swapHistoryTokens.reduce((acc, cur) => {
          const price = compositions?.find(c => c.symbol === cur.symbol)?.price || 0;
          const amount = cur.amount;

          return (acc += price * amount);
        }, 0);

        return {
          meta: {
            id: d.id,
            network: d.network,
          },
          trader: (
            <TableColumnIconText
              text={truncateAddress(d.trader, 4)}
              icon={<Jazzicon diameter={24} seed={jsNumberForAddress(d.trader ?? '')} />}
              address
            />
          ),
          tradeDetail: (
            <TableColumnTokenSwap
              tokens={d.swapHistoryTokens.map(t => ({
                symbol: t.symbol,
                value: t.amount,
                image: t.image,
              }))}
            />
          ),
          value: <TableColumn value={`$${formatNumber(value, 4)}`} align="flex-end" />,
          time: (
            <TableColumnLink
              token={`${elapsedTime(new Date(d.time).getTime())}`}
              align="flex-end"
              link={`${SCANNER_URL[currentNetwork]}/${isXrp ? 'transactions' : 'tx'}/${d.txHash}`}
            />
          ),
        };
      }),
    [compositions, currentNetwork, isXrp, swapHistories]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableColumns = useMemo<ColumnDef<any, ReactNode>[]>(
    () => [
      { accessorKey: 'meta' },
      {
        header: () => <TableHeader label="Trader" align="flex-start" />,
        cell: row => row.renderValue(),
        accessorKey: 'trader',
      },
      {
        header: () => <TableHeader label="Trade details" align="flex-start" />,
        cell: row => row.renderValue(),
        accessorKey: 'tradeDetail',
      },
      {
        header: () => (
          <TableHeaderSortable sortKey="value" label="Value" sort={sort} setSort={setSort} />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'value',
      },
      {
        header: () => (
          <TableHeaderSortable sortKey="time" label="Time" sort={sort} setSort={setSort} />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'time',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );

  return {
    tableColumns,
    tableData,

    swapHistories,
    hasNextPage,
    fetchNextPage,
  };
};
