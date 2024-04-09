import { ReactNode, useEffect, useMemo } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { strip } from 'number-precision';
import tw from 'twin.macro';
import { toHex } from 'viem';

import { useAmmInfoByAccount } from '~/api/api-contract/_xrpl/amm/amm-info';

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
  const { vote_slots: votingSlots } = amm || {};

  const { sort, setSort } = useTableFeeVotingSortStore();

  const sortedVotingSlots = useMemo(
    () =>
      votingSlots?.sort((a, b) =>
        sort?.order === 'desc' ? b.vote_weight - a.vote_weight : a.vote_weight - b.vote_weight
      ),
    [sort?.order, votingSlots]
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
          fee: <TableColumn value={`${strip(d.trading_fee / 1000)}%`} align="flex-end" />,
          weight: <TableColumn value={`${strip(d.vote_weight / 1000)}%`} align="flex-end" />,
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
                text={truncateAddress(d.account, 4)}
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
              value: <TableColumn value={`${strip(d.trading_fee / 1000)}%`} align="flex-end" />,
            },
            {
              label: 'Weight',
              value: <TableColumn value={`${strip(d.vote_weight / 1000)}%`} align="flex-end" />,
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