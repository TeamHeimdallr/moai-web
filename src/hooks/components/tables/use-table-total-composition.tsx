import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';

import { TableHeader } from '~/components/tables';
import { TableColumn } from '~/components/tables/columns';
import { TableColumnTokenAddress } from '~/components/tables/columns/column-token-address';
import { POOL_ID, TOKEN_ADDRESS } from '~/constants';
import { PoolCompositionData, PoolCompositionTable } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

export const useTableTotalComposition = (id: string) => {
  // TODO: connect api
  const poolAData: PoolCompositionData[] = [
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
  const poolBData: PoolCompositionData[] = [
    {
      tokenAddress: TOKEN_ADDRESS.WETH,
      token: TOKEN.WETH,
      weight: 50,
      balance: 12.24,
      value: 19893.06,
      currentWeight: 50,
    },
    {
      tokenAddress: TOKEN_ADDRESS.USDC,
      token: TOKEN.USDC,
      weight: 25,
      balance: 9946.45,
      value: 9946.91,
      currentWeight: 25.02,
    },
    {
      tokenAddress: TOKEN_ADDRESS.USDT,
      token: TOKEN.USDT,
      weight: 25,
      balance: 9945.98,
      value: 9946.15,
      currentWeight: 24.98,
    },
  ];
  const data = id === POOL_ID.POOL_A ? poolAData : poolBData;

  const tableData: PoolCompositionTable[] = data?.map(d => ({
    tokenAddress: d.tokenAddress,
    token: <TableColumnTokenAddress token={d.token} tokenAddress={d.tokenAddress} width={216} />,
    weight: <TableColumn value={`${d.weight.toFixed(2)}%`} width={120} align="flex-end" />,
    balance: <TableColumn value={`${formatNumber(d.balance, 2)}`} width={120} align="flex-end" />,
    value: <TableColumn value={`$${formatNumber(d.value, 2)}`} width={120} align="flex-end" />,
    currentWeight: (
      <TableColumn value={`${formatNumber(d.currentWeight, 2)}%`} width={120} align="flex-end" />
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
