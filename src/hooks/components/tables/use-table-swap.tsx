import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { Address } from 'viem';

import { useGetSwapHistories } from '~/api/api-contract/swap/get-swap-histories';
import { TableHeader, TableHeaderSortable } from '~/components/tables';
import { TableColumn } from '~/components/tables/columns';
import { TableColumnIcon } from '~/components/tables/columns/column-icon';
import { TableColumnLink } from '~/components/tables/columns/column-link';
import { TableColumnTokenSwap } from '~/components/tables/columns/column-token-swap';
import { SCANNER_URL, TOKEN_USD_MAPPER } from '~/constants';
import { useGetRootPrice } from '~/hooks/data/use-root-price';
import { useTableSwapHistoriesStore } from '~/states/components/table-swap-histories';
import { SwapData, SwapTable } from '~/types/components';
import { formatNumber } from '~/utils/number';
import { truncateAddress } from '~/utils/string';
import { elapsedTime } from '~/utils/time';

export const useTableSwap = (poolAddress: Address) => {
  const { sorting, setSorting } = useTableSwapHistoriesStore();
  const { data } = useGetSwapHistories({ poolAddress });
  const rootPrice = useGetRootPrice();

  const swapData = data?.map(d => {
    const poolId = d?.poolId ?? '0x';
    const tradeDetail =
      d?.tokens?.map(t => ({
        name: t?.symbol,
        balance: t?.amount ?? 0,
        value:
          (t?.amount ?? 0) * (t?.symbol == 'ROOT' ? rootPrice : TOKEN_USD_MAPPER[t?.symbol] ?? 0),
      })) ?? [];
    const value = tradeDetail?.reduce((acc, cur) => acc + cur.value, 0) ?? 0;
    const time = d?.time ?? Date.now();
    const trader = d?.trader ?? '0x';
    const txHash = d?.txHash ?? '0x';

    return {
      poolId,
      trader,
      tradeDetail,
      value,
      time,
      txHash,
    } as SwapData;
  });

  const sortedData = swapData?.sort((a, b) => {
    if (sorting?.key === 'TIME') return sorting.order === 'asc' ? a.time - b.time : b.time - a.time;
    return 0;
  });

  const tableData: SwapTable[] = sortedData?.map(d => ({
    poolId: d.poolId,
    trader: (
      <TableColumnIcon
        width={160}
        text={truncateAddress(d.trader, 4)}
        icon={<Jazzicon diameter={24} seed={jsNumberForAddress(d.trader ?? '0x')} />}
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
        link={`${SCANNER_URL}/tx/${d.txHash}`}
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
