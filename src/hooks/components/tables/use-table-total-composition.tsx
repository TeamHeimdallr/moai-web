import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';

import { TableHeader } from '~/components/tables';
import { TableColumn } from '~/components/tables/columns';
import { TableColumnTokenAddress } from '~/components/tables/columns/column-token-address';
import { TOKEN_ADDRESS } from '~/constants';
import { PoolCompositionData, PoolCompositionTable } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

export const useTableTotalComposition = () => {
  // TODO: connect api
  const data: PoolCompositionData[] = [
    {
      tokenAddress: TOKEN_ADDRESS.MOAI,
      token: TOKEN.MOAI,
      weight: 80,
      balance: 7077.75,
      value: 1006668,
      currentWeight: 79.94,
    },
    {
      tokenAddress: TOKEN_ADDRESS.WETH,
      token: TOKEN.WETH,
      weight: 20,
      balance: 147,
      value: 252612,
      currentWeight: 20.06,
    },
  ];

  const tableData: PoolCompositionTable[] = data?.map(d => ({
    tokenAddress: d.tokenAddress,
    token: <TableColumnTokenAddress token={d.token} tokenAddress={d.tokenAddress} width={216} />,
    weight: <TableColumn value={`${d.weight.toFixed(2)}%`} width={120} align="flex-end" />,
    balance: <TableColumn value={`${formatNumber(d.balance, 2)}`} width={120} align="flex-end" />,
    value: <TableColumn value={`$${formatNumber(d.value, 2)}`} width={120} align="flex-end" />,
    currentWeight: (
      <TableColumn value={`$${formatNumber(d.currentWeight, 2)}`} width={120} align="flex-end" />
    ),
  }));

  const columns: ColumnDef<PoolCompositionTable, ReactNode>[] = [
    {
      cell: row => row.renderValue(),
      accessorKey: 'tokenAddress',
    },
    {
      header: () => <TableHeader label="Token" width={216} align="flex-start" />,
      cell: row => row.renderValue(),
      accessorKey: 'token',
    },
    {
      header: () => <TableHeader label="Weight" width={120} align="flex-end" />,
      cell: row => row.renderValue(),
      accessorKey: 'weight',
    },
    {
      header: () => <TableHeader label="Balance" width={120} align="flex-end" />,
      cell: row => row.renderValue(),
      accessorKey: 'balance',
    },
    {
      header: () => <TableHeader label="Value" width={120} align="flex-end" />,
      cell: row => row.renderValue(),
      accessorKey: 'value',
    },
    {
      header: () => <TableHeader label="Token %" width={120} align="flex-end" />,
      cell: row => row.renderValue(),
      accessorKey: 'currentWeight',
    },
  ];

  return {
    columns,
    data: tableData,
  };
};
