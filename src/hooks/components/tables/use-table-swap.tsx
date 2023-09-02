import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

import { TableHeader, TableHeaderSortable } from '~/components/tables';
import { TableColumn } from '~/components/tables/columns';
import { TableColumnIcon } from '~/components/tables/columns/column-icon';
import { TableColumnLink } from '~/components/tables/columns/column-link';
import { TableColumnTokenSwap } from '~/components/tables/columns/column-token-swap';
import { TOKEN_USD_MAPPER } from '~/constants';
import { SwapData, SwapTable } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';
import { truncateAddress } from '~/utils/string';

export const useTableSwap = () => {
  // TODO: connect api
  const data: SwapData[] = [
    {
      id: 0,
      trader: '0x64c3baab47c8f78dd78abc',
      tradeDetail: [
        { name: TOKEN.MOAI, balance: 84.0, value: 84.0 * TOKEN_USD_MAPPER[TOKEN.MOAI] },
        { name: TOKEN.WETH, balance: 6.95, value: 6.95 * TOKEN_USD_MAPPER[TOKEN.WETH] },
      ],
      value: 11947.32,
      time: '2 months',
    },
    {
      id: 0,
      trader: '0xb47c8f764c378abcbaa8dd',
      tradeDetail: [
        { name: TOKEN.MOAI, balance: 1.25, value: 1.25 * TOKEN_USD_MAPPER[TOKEN.MOAI] },
        { name: TOKEN.WETH, balance: 0.1, value: 0.1 * TOKEN_USD_MAPPER[TOKEN.WETH] },
      ],
      value: 177.78,
      time: '2 months',
    },
  ];

  const tableData: SwapTable[] = data?.map(d => ({
    id: d.id,
    trader: (
      <TableColumnIcon
        width={160}
        text={truncateAddress(d.trader as `0x${string}`, 4)}
        icon={<Jazzicon diameter={24} seed={jsNumberForAddress(d.trader ?? '0x')} />}
      />
    ),
    tradeDetail: <TableColumnTokenSwap tokens={d.tradeDetail} />,
    value: <TableColumn value={`$${formatNumber(d.value, 2)}`} width={120} align="flex-end" />,
    time: <TableColumnLink token={`${d.time} ago`} align="flex-end" width={160} />,
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
      header: () => <TableHeader label="Trade details" width={272} align="flex-start" />,
      cell: row => row.renderValue(),
      accessorKey: 'tradeDetail',
    },
    {
      header: () => <TableHeader label="Valule" width={120} align="flex-end" />,
      cell: row => row.renderValue(),
      accessorKey: 'value',
    },
    {
      header: () => (
        <TableHeaderSortable sortKey="TIME" label="Time" sorting={{ key: 'TIME', order: 'desc' }} />
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
