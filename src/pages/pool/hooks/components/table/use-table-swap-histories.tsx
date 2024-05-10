import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { toHex } from 'viem';

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
import { ISwapHistoryToken, NETWORK, SWAP_HISTORY_TOKEN_TYPE } from '~/types';

export const useTableSwapHistories = () => {
  const { network, id } = useParams();
  const { selectedNetwork, isXrp } = useNetwork();
  const { sort, setSort } = useTableSwapHistoriesStore();

  const { t } = useTranslation();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;

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

  const { data } = useGetPoolQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
    },
    {
      enabled: !!network && !!id,
      staleTime: Infinity,
    }
  );

  const { pool } = data || {};
  const { compositions } = pool || {};
  const hasPrice = compositions?.every(c => !!c.price);

  const swapHistories = useMemo(
    () => swapHistoriesData?.pages?.flatMap(page => page.swapHistories) || [],
    [swapHistoriesData?.pages]
  );

  const tableData = useMemo(
    () =>
      swapHistories
        ? swapHistories?.map(d => {
            const valueDoubleVol = d.value
              ? d.value
              : d.swapHistoryTokens.reduce((acc, cur) => {
                  const amount = cur.amounts;
                  return (acc += (cur.price || 0) * amount);
                }, 0);

            // TODO: remove /2 when server updated
            const value = valueDoubleVol / 2;

            const tokens = ([
              d.swapHistoryTokens?.find(t => t.type === SWAP_HISTORY_TOKEN_TYPE.FROM),
              d.swapHistoryTokens?.find(t => t.type === SWAP_HISTORY_TOKEN_TYPE.TO),
            ] || []) as ISwapHistoryToken[];

            const time = elapsedTime(new Date(d.time).getTime());
            const splittedTime = time.split(' ');
            const translatedTime =
              time === 'Just now'
                ? t('Just now')
                : t(`${splittedTime[1]} ${splittedTime[2]}`, { time: splittedTime[0] });

            const getLink = () => {
              const hash = d.txHash;
              const isExtrinsic = !hash.startsWith('0x');

              if (isXrp) return `${SCANNER_URL[currentNetwork]}/transactions/${hash}`;
              if (isRoot) {
                if (isExtrinsic) return `${SCANNER_URL[currentNetwork]}/extrinsics/${hash}`;
                return `${SCANNER_URL[currentNetwork]}/tx/${hash}`;
              }
              return `${SCANNER_URL[currentNetwork]}/tx/${hash}`;
            };

            return {
              meta: {
                id: d.id,
                network: d.network,
              },
              trader: (
                <TableColumnIconText
                  text={truncateAddress(d.trader, 3)}
                  icon={
                    <Jazzicon
                      diameter={24}
                      seed={jsNumberForAddress(
                        isXrp ? toHex(d.trader || '', { size: 42 }) : d.trader || ''
                      )}
                    />
                  }
                  address
                />
              ),
              tradeDetail: (
                <TableColumnTokenSwap
                  tokens={tokens.map(t => ({
                    symbol: t.symbol,
                    value: t.amounts,
                    image: t.image,
                  }))}
                />
              ),
              value: (
                <TableColumn
                  value={value && hasPrice ? `$${formatNumber(value)}` : '-'}
                  align="flex-end"
                />
              ),
              time: (
                <TableColumnLink
                  token={translatedTime}
                  align="flex-end"
                  tableKey="swap-histories"
                  link={getLink()}
                />
              ),
            };
          })
        : [],
    [currentNetwork, hasPrice, isRoot, isXrp, swapHistories, t]
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
          <TableHeaderSortable
            sortKey="absoluteValue"
            label="Value"
            sort={sort}
            setSort={setSort}
            tableKey="swap-histories"
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'value',
      },
      {
        header: () => (
          <TableHeaderSortable
            sortKey="time"
            label="Time"
            sort={sort}
            setSort={setSort}
            tableKey="swap-histories"
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'time',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );

  const mobileTableData = useMemo(
    () =>
      swapHistories.map((d, i) => {
        const valueDoubleVol = d.swapHistoryTokens.reduce((acc, cur) => {
          const amount = cur.amounts;
          return (acc += (cur.price || 0) * amount);
        }, 0);

        // TODO: remove /2 when server updated
        const value = valueDoubleVol / 2;

        const tokens = ([
          d.swapHistoryTokens?.find(t => t.type === SWAP_HISTORY_TOKEN_TYPE.FROM),
          d.swapHistoryTokens?.find(t => t.type === SWAP_HISTORY_TOKEN_TYPE.TO),
        ] || []) as ISwapHistoryToken[];

        const time = elapsedTime(new Date(d.time).getTime());
        const splittedTime = time.split(' ');
        const translatedTime =
          time === 'Just now'
            ? t('Just now')
            : t(`${splittedTime[1]} ${splittedTime[2]}`, { time: splittedTime[0] });

        const getLink = () => {
          const hash = d.txHash;
          const isExtrinsic = !hash.startsWith('0x');

          if (isXrp) return `${SCANNER_URL[currentNetwork]}/transactions/${hash}`;
          if (isRoot) {
            if (isExtrinsic) return `${SCANNER_URL[currentNetwork]}/extrinsics/${hash}`;
            return `${SCANNER_URL[currentNetwork]}/tx/${hash}`;
          }
          return `${SCANNER_URL[currentNetwork]}/tx/${hash}`;
        };

        return {
          rows: [
            <TableColumnIconText
              key={i}
              text={truncateAddress(d.trader, 4)}
              icon={
                <Jazzicon
                  diameter={24}
                  seed={jsNumberForAddress(
                    isXrp ? toHex(d.trader || '', { size: 42 }) : d.trader || ''
                  )}
                />
              }
              address
            />,
            <TableColumnTokenSwap
              key={i}
              tokens={tokens.map(t => ({
                symbol: t.symbol,
                value: t.amounts,
                image: t.image,
              }))}
            />,
          ],
          dataRows: [
            {
              label: 'Value',
              value: (
                <TableColumn
                  value={value && hasPrice ? `$${formatNumber(value)}` : '-'}
                  align="flex-end"
                />
              ),
            },
            {
              label: 'Time',
              value: (
                <TableColumnLink
                  token={translatedTime}
                  align="flex-end"
                  tableKey="swap-histories"
                  link={getLink()}
                />
              ),
            },
          ],
        };
      }),
    [currentNetwork, hasPrice, isRoot, isXrp, swapHistories, t]
  );

  const mobileTableColumn = useMemo<ReactNode>(
    () => (
      <TableHeaderSortable
        sortKey="time"
        label="Time"
        sort={sort}
        setSort={setSort}
        tableKey="swap-histories"
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );

  return {
    tableColumns,
    tableData,

    mobileTableColumn,
    mobileTableData,

    swapHistories,
    hasNextPage,
    fetchNextPage,
  };
};
