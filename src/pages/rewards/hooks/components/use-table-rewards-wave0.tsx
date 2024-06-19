import { ReactNode, useMemo } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import tw from 'twin.macro';
import { toHex } from 'viem';
import { usePublicClient } from 'wagmi';

import { useGetRnses } from '~/api/api-contract/_evm/rns/get-rnses';
import { useGetRewardsListInfinityQuery } from '~/api/api-server/rewards/get-reward-list-wave0';

import { COLOR } from '~/assets/colors';

import { MILLION, SCANNER_URL } from '~/constants';

import { TableColumn, TableHeader } from '~/components/tables';
import { TableColumnIconTextLink } from '~/components/tables/columns/column-icon-text-link';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull, truncateAddress } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { NETWORK } from '~/types';

export const useTableRewards = () => {
  const publicClient = usePublicClient();
  const { network } = useParams();
  const { selectedNetwork, isXrp } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);
  const { currentAddress } = useConnectedWallet(currentNetwork);
  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;

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
        walletAddress: currentAddress,
      },
    },
    {
      enabled: currentNetwork === NETWORK.THE_ROOT_NETWORK,
      staleTime: 20 * 1000,
    }
  );

  const myReward = useMemo(() => rewardListData?.pages?.[0]?.my, [rewardListData?.pages]);
  const _rewardLists = useMemo(
    () =>
      myReward
        ? [myReward, ...(rewardListData?.pages?.flatMap(page => page.participants) || [])]
        : rewardListData?.pages?.flatMap(page => page.participants) || [],
    [myReward, rewardListData?.pages]
  );

  const { data: rnses } = useGetRnses(
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      publicClient: publicClient as any,
      network: currentNetwork,
      addresses: _rewardLists?.map(d => d.address),
    },
    {
      staleTime: 1000 * 60 * 60 * 2,
    }
  );
  const rewardLists = useMemo(() => {
    if (!isRoot) return _rewardLists;
    return _rewardLists?.map((d, i) => ({
      ...d,
      rns: rnses?.[i],
    }));
  }, [isRoot, _rewardLists, rnses]);

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
            isMy: currentAddress && currentAddress === d?.address,
            className:
              i === 0 && currentAddress && currentAddress === d?.address ? 'row-my-reward' : '',
          },
          rank: (
            <TableColumn
              value={`${formatNumber(d?.rank, 0)}`}
              align="flex-start"
              style={{
                color: (d?.rank || 4) <= 3 ? COLOR.PRIMARY[50] : COLOR.NEUTRAL[100],
              }}
            />
          ),
          account: (
            <TableColumnIconTextLink
              text={d?.rns ? d?.rns : truncateAddress(d?.address, 4)}
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
          volume: <TableColumn value={`$${formatNumber(d?.volume)}`} align="flex-end" />,
          preminedToken: (
            <TableColumn
              value={`${formatNumber(d?.premined, 3, 'floor', MILLION, 3)}`}
              align="flex-end"
            />
          ),
        };
      }),
    [currentAddress, currentNetwork, isRoot, isXrp, rewardLists]
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
        header: () => <TableHeader label="Current LP volume" align="flex-end" />,
        cell: row => row.renderValue(),
        accessorKey: 'volume',
      },
      {
        header: () => <TableHeader label="Pre-mined $veMOAI" align="flex-end" />,
        cell: row => row.renderValue(),
        accessorKey: 'preminedToken',
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
            className:
              i === 0 && currentAddress && currentAddress === d?.address ? 'row-my-reward' : '',
          },
          rows: [
            <RowWrapper key={i}>
              <TableColumn
                value={`${formatNumber(d?.rank, 0)}`}
                align="flex-start"
                style={{
                  color: (d?.rank || 4) <= 3 ? COLOR.PRIMARY[50] : COLOR.NEUTRAL[100],
                }}
              />
              <TableColumnIconTextLink
                text={d?.rns ? d?.rns : truncateAddress(d?.address, 4)}
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
              label: 'Current LP volume',
              value: (
                <TableColumn
                  value={`$${formatNumber(d?.volume, 4, 'floor', 10 ** 6)}`}
                  align="flex-end"
                />
              ),
            },
            {
              label: 'Pre-mined $veMOAI',
              value: (
                <TableColumn
                  value={`${formatNumber(d?.premined, 4, 'floor', 10 ** 6)}`}
                  align="flex-end"
                />
              ),
            },
          ],
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentAddress, currentNetwork, isRoot, isXrp, rewardLists]
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
