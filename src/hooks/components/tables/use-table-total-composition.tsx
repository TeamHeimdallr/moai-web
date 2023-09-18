import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';
import { Address } from 'viem';

import { usePoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';
import { TableHeader } from '~/components/tables';
import { TableColumn } from '~/components/tables/columns';
import { TableColumnTokenAddress } from '~/components/tables/columns/column-token-address';
import { PoolCompositionData, PoolCompositionTable } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

export const useTableTotalComposition = (id: Address) => {
  const { compositions } = usePoolBalance(id);
  const totalBalance = compositions?.reduce((acc, cur) => acc + cur.balance, 0);
  const poolData: PoolCompositionData[] = compositions?.map(composition => {
    const { name, balance, price, weight } = composition;
    return {
      tokenAddress: '0x',
      token: name as TOKEN,
      weight,
      balance,
      value: balance * price,
      currentWeight: (balance / totalBalance) * 100,
    };
  });

  const tableData: PoolCompositionTable[] = poolData?.map(d => ({
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
