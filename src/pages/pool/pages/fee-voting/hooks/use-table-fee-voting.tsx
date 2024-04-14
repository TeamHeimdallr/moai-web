import { ReactNode, useEffect, useMemo } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { strip } from 'number-precision';
import tw from 'twin.macro';
import { toHex } from 'viem';

import { useAmmInfoByAccount } from '~/api/api-contract/_xrpl/amm/amm-info';
import { useUsersLpTokenBalance } from '~/api/api-contract/_xrpl/balance/lp-token-balance';

import {
  TableColumn,
  TableColumnIconText,
  TableHeader,
  TableHeaderSortable,
} from '~/components/tables';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { truncateAddress } from '~/utils';
import { useTableFeeVotingSortStore } from '~/states/components';

export const useTableFeeVoting = () => {
  const { id } = useParams();
  const { isXrp } = useNetwork();

  const { isMD } = useMediaQuery();

  const { data: ammData } = useAmmInfoByAccount({ account: id || '', enabled: isXrp && !!id });
  const { amm } = ammData || {};
  const { vote_slots: votingSlots, lp_token: lpToken } = amm || {};
  const { value: lpTokenValue } = lpToken || {};

  const { sort, setSort } = useTableFeeVotingSortStore();

  const { data: voterLp } = useUsersLpTokenBalance({
    lpToken: lpToken?.issuer || '',
    users: votingSlots?.map(slot => slot.account) || [],
  });
  const voterLpWeight = voterLp?.map(voter => {
    const voteSlot = votingSlots?.find(slot => slot.account === voter.account);

    return {
      ...voter,
      tradingFee: Number(voteSlot?.trading_fee || 0) / 1000,
      weight: voter.balance ? (voter.balance / Number(lpTokenValue || 0)) * 100 : 0,
    };
  });

  const sortedVotingSlots = useMemo(
    () =>
      voterLpWeight?.sort((a, b) =>
        sort?.order === 'desc' ? b.weight - a.weight : a.weight - b.weight
      ),
    [sort?.order, voterLpWeight]
  );

  const tableData = useMemo(
    () =>
      sortedVotingSlots?.map((d, i) => {
        return {
          meta: {
            account: d.account,
          },
          rank: <TableColumn value={i + 1} align="flex-start" />,
          voter: (
            <TableColumnIconText
              className="voter"
              text={truncateAddress(d.account, 4)}
              icon={
                <Jazzicon
                  diameter={24}
                  seed={jsNumberForAddress(toHex(d.account || '', { size: 42 }))}
                />
              }
              address
            />
          ),
          fee: (
            <TableColumn value={`${Number(strip(d.tradingFee).toFixed(3))}%`} align="flex-end" />
          ),
          weight: <TableColumn value={`${strip(d.weight).toFixed(3)}%`} align="flex-end" />,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort?.order, sortedVotingSlots]
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
        header: () => <TableHeader label="Voter" align="flex-start" />,
        cell: row => row.renderValue(),
        accessorKey: 'voter',
      },
      {
        header: () => <TableHeader label="Fee" align="flex-end" />,
        cell: row => row.renderValue(),
        accessorKey: 'fee',
      },
      {
        header: () => (
          <TableHeaderSortable
            sortKey="weight"
            label="Weight"
            sort={sort}
            setSort={setSort}
            tableKey="fee-voting"
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'weight',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );

  const RowWrapper = useMemo(() => tw.div`flex items-center justify-between flex-1`, []);
  const mobileTableData = useMemo(
    () =>
      sortedVotingSlots?.map((d, i) => {
        return {
          meta: {
            account: d.account,
          },
          rows: [
            <RowWrapper key={i}>
              <TableColumn value={i + 1} align="flex-start" />
              <TableColumnIconText
                align="flex-end"
                text={truncateAddress(d.account, 4)}
                className="voter"
                icon={
                  <Jazzicon
                    diameter={24}
                    seed={jsNumberForAddress(toHex(d.account || '', { size: 42 }))}
                  />
                }
                address
              />
            </RowWrapper>,
          ],
          dataRows: [
            {
              label: 'Fee',
              value: (
                <TableColumn
                  value={`${Number(strip(d.tradingFee).toFixed(3))}%`}
                  align="flex-end"
                />
              ),
            },
            {
              label: 'Weight',
              value: <TableColumn value={`${strip(d.weight).toFixed(3)}%`} align="flex-end" />,
            },
          ],
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort?.order, sortedVotingSlots]
  );

  const mobileTableColumn = useMemo<ReactNode>(
    () => (
      <TableHeaderSortable
        sortKey="weight"
        label="Weight"
        sort={sort}
        setSort={setSort}
        tableKey="fee-voting"
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
  };
};
