import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';

import { TableHeader } from '~/components/tables';
import { TableColumn } from '~/components/tables/columns';
import { TOKEN_USD_MAPPER } from '~/constants';
import { LiquidityProvisionData, LiquidityProvisionTable } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

export const useTableTotalProvision = () => {
  // TODO: connect api
  const data: LiquidityProvisionData[] = [
    {
      id: 0,
      action: 'withdraw',
      tokens: [
        { name: TOKEN.MOAI, balance: 162.87, value: 162.87 * TOKEN_USD_MAPPER[TOKEN.MOAI] },
        { name: TOKEN.WETH, balance: 3.37, value: 3.37 * TOKEN_USD_MAPPER[TOKEN.WETH] },
      ],
      value: 28955,
      time: '2 months',
    },
    {
      id: 1,
      action: 'add',
      tokens: [
        { name: TOKEN.MOAI, balance: 1024, value: 1024 * TOKEN_USD_MAPPER[TOKEN.MOAI] },
        { name: TOKEN.WETH, balance: 21.19, value: 21.19 * TOKEN_USD_MAPPER[TOKEN.WETH] },
      ],
      value: 182054,
      time: '10 days',
    },
  ];

  const tableData: LiquidityProvisionTable[] = data?.map(d => ({
    id: d.id,
    action: <></>,
    tokens: <></>,
    value: <TableColumn value={`$${formatNumber(d.value, 2)}`} width={120} align="flex-end" />,
    time: <></>,
  }));

  const columns: ColumnDef<LiquidityProvisionTable, ReactNode>[] = [
    {
      cell: row => row.renderValue(),
      accessorKey: 'id',
    },
    {
      header: () => <TableHeader label="Action" width={160} align="flex-start" />,
      cell: row => row.renderValue(),
      accessorKey: 'action',
    },
    {
      header: () => <TableHeader label="Tokens" width={272} align="flex-start" />,
      cell: row => row.renderValue(),
      accessorKey: 'tokens',
    },
    {
      header: () => <TableHeader label="Valule" width={120} align="flex-end" />,
      cell: row => row.renderValue(),
      accessorKey: 'value',
    },
    {
      header: () => <TableHeader label="Time" width={160} align="flex-end" />,
      cell: row => row.renderValue(),
      accessorKey: 'time',
    },
  ];

  return {
    columns,
    data: tableData,
  };
};
