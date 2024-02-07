import { ReactNode, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';

import { useGetLiquidityProvisionsInfinityQuery } from '~/api/api-server/pools/get-liquidity-provisions';

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
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { elapsedTime } from '~/utils/util-time';
import { useTableLiquidityPoolProvisionSortStore } from '~/states/components';
import { useTablePoolLiquidityProvisionSelectTabStore } from '~/states/components/table/tab';
import { LIQUIDITY_PROVISION_TYPE, NETWORK } from '~/types';

export const useTableLiquidityProvision = () => {
  const { network, id } = useParams();
  const { selectedNetwork, isXrp } = useNetwork();
  const { sort, setSort } = useTableLiquidityPoolProvisionSortStore();
  const { selectedTab } = useTablePoolLiquidityProvisionSelectTabStore();

  const { isMD } = useMediaQuery();

  const { t } = useTranslation();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const { currentAddress } = useConnectedWallet(currentNetwork);

  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;

  const isMyProvision = selectedTab === 'my-provision';

  const {
    data: allLiquidityProvisionData,
    hasNextPage: hasAllNextPage,
    fetchNextPage: fetchAllNextPage,
  } = useGetLiquidityProvisionsInfinityQuery(
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

  const {
    data: myLiquidityProvisionData,
    hasNextPage: hasMyNextPage,
    fetchNextPage: fetchMyNextPage,
  } = useGetLiquidityProvisionsInfinityQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
      queries: {
        take: 5,
        filter: `liquidityProvider:eq:${currentAddress}`,
        sort: sort ? `${sort.key}:${sort.order}` : undefined,
      },
    },
    {
      enabled: !!network && !!id && !!currentAddress,
      staleTime: 1000,
    }
  );

  const liquidityProvisionData = isMyProvision
    ? myLiquidityProvisionData
    : allLiquidityProvisionData;
  const hasMyLiquidityProvision =
    (myLiquidityProvisionData?.pages?.flatMap(page => page.liquidityProvisions) || []).length > 0;

  const hasNextPage = isMyProvision ? hasMyNextPage : hasAllNextPage;
  const fetchNextPage = isMyProvision ? fetchMyNextPage : fetchAllNextPage;

  const liquidityProvisions = useMemo(
    () => liquidityProvisionData?.pages?.flatMap(page => page.liquidityProvisions) || [],
    [liquidityProvisionData?.pages]
  );

  const tableData = useMemo(
    () =>
      liquidityProvisions?.map(d => {
        const value = d.liquidityProvisionTokens.reduce((acc, cur) => {
          const amount = Math.abs(cur.amounts);
          return (acc += (cur.price || 0) * amount);
        }, 0);

        const time = elapsedTime(new Date(d.time).getTime());
        const splittedTime = time.split(' ');
        const translatedTime =
          time === 'Just now'
            ? t('Just now')
            : t(`${splittedTime[1]} ${splittedTime[2]}`, { time: splittedTime[0] });

        return {
          meta: {
            id: d.id,
            network: d.network,
          },
          action: (
            <TableColumnIconText
              text={d.type === LIQUIDITY_PROVISION_TYPE.DEPOSIT ? t('Add tokens') : t('Withdrawal')}
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
                value: Math.abs(t.amounts),
                image: t.image,
              }))}
            />
          ),
          value: <TableColumn value={`$${formatNumber(value)}`} align="flex-end" />,
          time: (
            <TableColumnLink
              token={translatedTime}
              tableKey="liquidity-provision"
              align="flex-end"
              link={`${SCANNER_URL[currentNetwork]}/${
                isXrp ? 'transactions' : isRoot ? 'extrinsic' : 'tx'
              }/${d.txHash}`}
            />
          ),
        };
      }),
    [currentNetwork, isRoot, isXrp, liquidityProvisions, t]
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
          <TableHeaderSortable
            sortKey="absoluteValue"
            label="Value"
            sort={sort}
            setSort={setSort}
            tableKey="liquidity-provision"
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
            tableKey="liquidity-provision"
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
      liquidityProvisions.map((d, i) => {
        const value = d.liquidityProvisionTokens.reduce((acc, cur) => {
          const amount = Math.abs(cur.amounts);
          return (acc += (cur.price || 0) * amount);
        }, 0);

        const time = elapsedTime(new Date(d.time).getTime());
        const splittedTime = time.split(' ');
        const translatedTime =
          time === 'Just now'
            ? t('Just now')
            : t(`${splittedTime[1]} ${splittedTime[2]}`, { time: splittedTime[0] });

        return {
          rows: [
            <TableColumnIconText
              key={i}
              text={d.type === LIQUIDITY_PROVISION_TYPE.DEPOSIT ? t('Add tokens') : t('Withdrawal')}
              icon={
                d.type === LIQUIDITY_PROVISION_TYPE.DEPOSIT ? (
                  <IconPlus width={20} height={20} fill={COLOR.GREEN[50]} />
                ) : (
                  <IconMinus width={20} height={20} fill={COLOR.RED[50]} />
                )
              }
            />,
            <TableColumnTokenPair
              key={i}
              tokens={d.liquidityProvisionTokens.map(t => ({
                symbol: t.symbol,
                value: Math.abs(t.amounts),
                image: t.image,
              }))}
            />,
          ],
          dataRows: [
            {
              label: 'Value',
              value: <TableColumn value={`$${formatNumber(value)}`} align="flex-end" />,
            },
            {
              label: 'Time',
              value: (
                <TableColumnLink
                  token={translatedTime}
                  align="flex-end"
                  link={`${SCANNER_URL[currentNetwork]}/${
                    isXrp ? 'transactions' : isRoot ? 'extrinsic' : 'tx'
                  }/${d.txHash}`}
                />
              ),
            },
          ],
        };
      }),
    [currentNetwork, isRoot, isXrp, liquidityProvisions, t]
  );

  const mobileTableColumn = useMemo<ReactNode>(
    () => (
      <TableHeaderSortable
        sortKey="time"
        label="Time"
        sort={sort}
        setSort={setSort}
        tableKey="liquidity-provision"
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );

  useEffect(() => {
    if (!isMD) setSort({ key: 'time', order: 'desc' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMD]);

  return {
    tableColumns,
    tableData,

    mobileTableData,
    mobileTableColumn,

    liquidityProvisions,
    hasMyLiquidityProvision,

    hasNextPage,
    fetchNextPage,
  };
};
