import { ReactNode } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { ColumnDef } from '@tanstack/react-table';
import { Address } from 'viem';

import {
  TableColumn,
  TableColumnIcon,
  TableColumnLink,
  TableColumnTokenSwap,
  TableHeader,
  TableHeaderSortable,
} from '~/components/tables';

import { formatNumber } from '~/utils/util-number';
import { truncateAddress } from '~/utils/util-string';
import { elapsedTime } from '~/utils/util-time';
import { useTableSwapHistoriesStore } from '~/states/components/table-swap-histories';

import { useGetSwapHistories } from '~/moai-xrp-ledger/api/api-contract/swap/get-swap-histories';

import { SCANNER_URL } from '~/moai-xrp-ledger/constants';

import { SwapData, SwapTable } from '~/moai-xrp-ledger/types/components';

export const useTableSwap = (account: string) => {
  const { data } = useGetSwapHistories(account);

  const swapData = data?.map(d => {
    const account = d?.account ?? '';

    const tradeDetail =
      d?.tokens?.map(t => ({
        name: t?.name ?? '',
        balance: t?.balance ?? 0,
        value: t?.value ?? 0,
      })) ?? [];

    const value = tradeDetail?.reduce((acc, cur) => acc + cur.value, 0) ?? 0;
    const time = d?.time ?? Date.now();
    const trader = d?.trader ?? '';
    const txHash = d?.txHash ?? '';

    return {
      account,
      trader,
      tradeDetail,
      value,
      time,
      txHash,
    } as SwapData;
  });

  const { sorting, setSorting } = useTableSwapHistoriesStore();
  const sortedData = swapData?.sort((a, b) => {
    if (sorting?.key === 'TIME') return sorting.order === 'asc' ? a.time - b.time : b.time - a.time;
    return 0;
  });

  const tableData: SwapTable[] = sortedData?.map(d => ({
    account: d.account,
    trader: (
      <TableColumnIcon
        width={160}
        text={truncateAddress(d.trader as Address, 4)}
        icon={<Jazzicon diameter={24} seed={jsNumberForAddress(d.trader ?? '0x0')} />}
        isAddress
      />
    ),
    tradeDetail: <TableColumnTokenSwap tokens={d.tradeDetail} />,
    value: <TableColumn value={`$${formatNumber(d.value, 2)}`} width={120} align="flex-end" />,
    time: (
      <TableColumnLink
        token={`${elapsedTime(d.time)}`}
        align="flex-end"
        width={160}
        link={`${SCANNER_URL}/transactions/${d.txHash}`}
      />
    ),
  }));

  const columns: ColumnDef<SwapTable, ReactNode>[] = [
    {
      cell: row => row.renderValue(),
      accessorKey: 'id',
    },
    {
      header: () => <TableHeader label="Trader" width={160} align="flex-start" />,
      cell: row => row.renderValue(),
      accessorKey: 'trader',
    },
    {
      header: () => <TableHeader label="Trade details" width="full" align="flex-start" />,
      cell: row => row.renderValue(),
      accessorKey: 'tradeDetail',
    },
    {
      header: () => <TableHeader label="Value" width={120} align="flex-end" />,
      cell: row => row.renderValue(),
      accessorKey: 'value',
    },
    {
      header: () => (
        <TableHeaderSortable
          sortKey="TIME"
          label="Time"
          sorting={sorting}
          setSorting={setSorting}
        />
      ),
      cell: row => row.renderValue(),
      accessorKey: 'time',
    },
  ];

  return {
    columns,
    data: tableData,
  };
};
