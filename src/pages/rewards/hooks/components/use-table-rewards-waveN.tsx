import { ReactNode, useMemo } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import tw from 'twin.macro';
import { toHex } from 'viem';

import { useGetRewardsListInfinityQuery } from '~/api/api-server/rewards/get-reward-list-waveN';

import { COLOR } from '~/assets/colors';

import { MILLION, SCANNER_URL, THOUSAND } from '~/constants';

import { TableColumn, TableHeader } from '~/components/tables';
import { TableColumnIconTextLink } from '~/components/tables/columns/column-icon-text-link';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull, truncateAddress } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { NETWORK } from '~/types';

import { useRewardSelectWaveIdStore } from '../../states';

export const useTableRewards = () => {
  const { network } = useParams();
  const { selectedNetwork, isFpass, isXrp } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = isFpass ? fpass.address : evm?.address || '';

  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;

  const { selectedWaveId } = useRewardSelectWaveIdStore();

  const {
    data: rewardListData,
    hasNextPage,
    fetchNextPage,
  } = useGetRewardsListInfinityQuery(
    {
      params: {
        networkAbbr: currentNetworkAbbr,
      },
      queries: {
        take: 20,
        walletAddress: evmAddress,
        wave: selectedWaveId,
      },
    },
    {
      enabled: currentNetwork === NETWORK.THE_ROOT_NETWORK && !!selectedWaveId,
      staleTime: 20 * 1000,
    }
  );

  const myReward = useMemo(() => rewardListData?.pages?.[0]?.my, [rewardListData?.pages]);
  const rewardLists = useMemo(
    () =>
      myReward
        ? [myReward, ...(rewardListData?.pages?.flatMap(page => page.participants) || [])]
        : rewardListData?.pages?.flatMap(page => page.participants) || [],
    [myReward, rewardListData?.pages]
  );

  const tableData = useMemo(
    () =>
      rewardLists?.map((d, i) => {
        const getLink = () => {
          if (isXrp) return `${SCANNER_URL[currentNetwork]}/accounts/${d.address}`;
          if (isRoot) return `${SCANNER_URL[currentNetwork]}/addresses/${d.address}`;
          return `${SCANNER_URL[currentNetwork]}/address/${d.address}`;
        };

        return {
          meta: {
            isMy: evmAddress && evmAddress === d?.address,
            className: i === 0 && evmAddress && evmAddress === d?.address ? 'row-my-reward' : '',
          },
          rank: (
            <TableColumn
              value={`${!d?.rank ? '-' : formatNumber(d?.rank, 0)}`}
              align="flex-start"
              style={{
                color: !d?.rank
                  ? COLOR.NEUTRAL[100]
                  : (d?.rank || 4) <= 3
                  ? COLOR.PRIMARY[50]
                  : COLOR.NEUTRAL[100],
              }}
            />
          ),
          account: (
            <TableColumnIconTextLink
              text={truncateAddress(d?.address, 4)}
              align="flex-start"
              icon={
                <Jazzicon
                  diameter={24}
                  seed={jsNumberForAddress(
                    isXrp ? toHex(d?.address || '', { size: 42 }) : d?.address || ''
                  )}
                />
              }
              address
              tableKey="rewards"
              link={getLink()}
            />
          ),
          lpSupply: (
            <TableColumn
              value={formatNumber(d?.lpSupply, 2, 'floor', MILLION, 2)}
              align="flex-end"
            />
          ),
          lending: (
            <TableColumn
              value={formatNumber(
                (d?.lendingSupply || 0) + (d?.lendingBorrow || 0),
                2,
                'floor',
                MILLION,
                2
              )}
              align="flex-end"
            />
          ),
          referral: (
            <TableColumn
              value={formatNumber(d?.referees, 2, 'floor', MILLION, 2)}
              align="flex-end"
            />
          ),
          total: (
            <TableColumn value={formatNumber(d?.total, 2, 'floor', MILLION, 2)} align="flex-end" />
          ),
        };
      }),
    [evmAddress, currentNetwork, isRoot, isXrp, rewardLists]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableColumns = useMemo<ColumnDef<any, ReactNode>[]>(
    () => [
      { accessorKey: 'meta' },
      {
        header: () => <TableHeader label="Rank" align="flex-start" />,
        cell: row => row.renderValue(),
        accessorKey: 'rank',
      },
      {
        header: () => <TableHeader label="Account" align="flex-start" />,
        cell: row => row.renderValue(),
        accessorKey: 'account',
      },

      {
        header: () => <TableHeader label="LP Supplying" align="flex-end" />,
        cell: row => row.renderValue(),
        accessorKey: 'lpSupply',
      },
      {
        header: () => <TableHeader label="reward-lending-supplying" align="flex-end" />,
        cell: row => row.renderValue(),
        accessorKey: 'lending',
      },
      {
        header: () => <TableHeader label="referral-point" align="flex-end" />,
        cell: row => row.renderValue(),
        accessorKey: 'referral',
      },
      {
        header: () => <TableHeader label="Total Points" align="flex-end" />,
        cell: row => row.renderValue(),
        accessorKey: 'total',
      },
    ],
    []
  );

  const RowWrapper = useMemo(() => tw.div`flex items-center justify-between flex-1`, []);
  const mobileTableData = useMemo(
    () =>
      rewardLists?.map((d, i) => {
        const getLink = () => {
          if (isXrp) return `${SCANNER_URL[currentNetwork]}/accounts/${d.address}`;
          if (isRoot) return `${SCANNER_URL[currentNetwork]}/addresses/${d.address}`;
          return `${SCANNER_URL[currentNetwork]}/address/${d.address}`;
        };

        return {
          meta: {
            className: i === 0 && evmAddress && evmAddress === d?.address ? 'row-my-reward' : '',
          },
          rows: [
            <RowWrapper key={i}>
              <TableColumn
                value={`${!d?.rank ? '-' : formatNumber(d?.rank, 0)}`}
                align="flex-start"
                style={{
                  color: !d?.rank
                    ? COLOR.NEUTRAL[100]
                    : (d?.rank || 4) <= 3
                    ? COLOR.PRIMARY[50]
                    : COLOR.NEUTRAL[100],
                }}
              />
              <TableColumnIconTextLink
                text={truncateAddress(d?.address, 4)}
                icon={
                  <Jazzicon
                    diameter={24}
                    seed={jsNumberForAddress(
                      isXrp ? toHex(d?.address || '', { size: 42 }) : d?.address || ''
                    )}
                  />
                }
                address
                tableKey="rewards"
                link={getLink()}
              />
            </RowWrapper>,
          ],
          dataRows: [
            {
              label: 'LP Supplying',
              value: (
                <TableColumn
                  value={formatNumber(d?.lpSupply, 2, 'floor', MILLION, 2)}
                  align="flex-end"
                />
              ),
            },
            {
              label: 'reward-lending-supplying',
              value: (
                <TableColumn
                  value={formatNumber(
                    (d?.lendingSupply || 0) + d?.lendingBorrow || 0,
                    2,
                    'floor',
                    MILLION,
                    2
                  )}
                  align="flex-end"
                />
              ),
            },
            {
              label: 'referral-point',
              value: (
                <TableColumn
                  value={`${formatNumber(d?.referees, 1, 'floor', THOUSAND, 1)}`}
                  align="flex-end"
                />
              ),
            },
            {
              label: 'Total Points',
              value: (
                <TableColumn
                  value={formatNumber(d?.total, 2, 'floor', MILLION, 2)}
                  align="flex-end"
                />
              ),
            },
          ],
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rewardLists, evmAddress, isXrp, currentNetwork, isRoot]
  );

  const mobileTableColumn = useMemo<ReactNode>(
    () => <TableHeader label="Rank" align="flex-start" />,
    []
  );

  return {
    tableColumns,
    tableData,

    mobileTableData,
    mobileTableColumn,

    rewardLists,

    hasNextPage,
    fetchNextPage,
  };
};
