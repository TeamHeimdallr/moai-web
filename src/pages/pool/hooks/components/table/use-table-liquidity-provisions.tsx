import { ReactNode, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';

import { useGetLiquidityProvisionsInfinityQuery } from '~/api/api-server/pools/get-liquidity-provisions';
import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { COLOR } from '~/assets/colors';
import { IconMinus, IconPlus } from '~/assets/icons';

import { SCANNER_URL } from '~/constants';

import {
  TableColumn,
  TableColumnIconText,
  TableColumnLink,
  TableColumnTokenPair,
  TableHeader,
  TableHeaderSortable,
} from '~/components/tables';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { elapsedTime } from '~/utils/util-time';
import { useTableLiquidityPoolProvisionSortStore } from '~/states/components';
import { useTablePoolLiquidityProvisionSelectTabStore } from '~/states/components/table/tab';
import { LIQUIDITY_PROVISION_TYPE } from '~/types';

export const useTableLiquidityProvision = () => {
  const { network, id } = useParams();
  const { selectedNetwork, isXrp } = useNetwork();
  const { sort, setSort } = useTableLiquidityPoolProvisionSortStore();
  const { selectedTab } = useTablePoolLiquidityProvisionSelectTabStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const { currentAddress } = useConnectedWallet(currentNetwork);

  const isMyProvision = selectedTab === 'my-provision';

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
    data: liquidityProvisionData,
    hasNextPage,
    fetchNextPage,
  } = useGetLiquidityProvisionsInfinityQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
      queries: {
        take: 5,
        filter: isMyProvision ? `liquidityProvider:eq:${currentAddress}` : undefined,
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

  const liquidityProvisions = useMemo(
    () => liquidityProvisionData?.pages?.flatMap(page => page.liquidityProvisions) || [],
    [liquidityProvisionData?.pages]
  );

  const tableData = useMemo(
    () =>
      liquidityProvisions?.map(d => {
        const value = d.liquidityProvisionTokens.reduce((acc, cur) => {
          const price = compositions?.find(c => c.symbol === cur.symbol)?.price || 0;
          const amount = cur.amount;

          return (acc += price * amount);
        }, 0);

        return {
          meta: {
            id: d.id,
            network: d.network,
          },
          action: (
            <TableColumnIconText
              text={d.type === LIQUIDITY_PROVISION_TYPE.DEPOSIT ? 'Add tokens' : 'Withdraw'}
              icon={
                d.type === LIQUIDITY_PROVISION_TYPE.DEPOSIT ? (
                  <IconPlus width={20} height={20} fill={COLOR.GREEN[50]} />
                ) : (
                  <IconMinus width={20} height={20} fill={COLOR.RED[50]} />
                )
              }
            />
          ),
          tokens: (
            <TableColumnTokenPair
              tokens={d.liquidityProvisionTokens.map(t => ({
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
    [compositions, currentNetwork, isXrp, liquidityProvisions]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableColumns = useMemo<ColumnDef<any, ReactNode>[]>(
    () => [
      { accessorKey: 'meta' },

      {
        header: () => <TableHeader label="Action" align="flex-start" />,
        cell: row => row.renderValue(),
        accessorKey: 'action',
      },
      {
        header: () => <TableHeader label="Tokens" align="flex-start" />,
        cell: row => row.renderValue(),
        accessorKey: 'tokens',
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

    liquidityProvisions,
    hasNextPage,
    fetchNextPage,
  };
};
