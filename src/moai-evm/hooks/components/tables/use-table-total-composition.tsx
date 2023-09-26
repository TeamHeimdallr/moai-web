import { ReactNode } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Address } from 'viem';

import { TableColumn, TableColumnTokenAddress, TableHeader } from '~/components/tables';

import { formatNumber } from '~/utils/number';
import { useSelectedLiquidityPoolCompositionTabStore } from '~/states/pages/selected-liquidity-pool-composition-tab';

import { useLiquidityPoolBalance } from '~/moai-evm/api/api-contract/pool/get-liquidity-pool-balance';

import { SCANNER_URL } from '~/moai-evm/constants';

import { PoolCompositionData, PoolCompositionTable } from '~/moai-evm/types/components';

import { TOKEN } from '~/moai-evm/types/contracts';

export const useTableTotalComposition = (poolId: Address) => {
  const { selected: selectedTab } = useSelectedLiquidityPoolCompositionTabStore();

  const isMyComposition = selectedTab === 'my-composition';

  const { poolInfo, liquidityPoolTokenBalance } = useLiquidityPoolBalance(poolId);

  const balance = poolInfo.balance;
  const poolShareRatio =
    poolInfo.tokenTotalSupply === 0 ? 0 : liquidityPoolTokenBalance / poolInfo.tokenTotalSupply;

  const poolData: PoolCompositionData[] = poolInfo?.compositions?.map(composition => {
    const { tokenAddress, name, balance: compositoinBalance, price, weight } = composition;
    const userBalance = isMyComposition ? compositoinBalance * poolShareRatio : compositoinBalance;

    return {
      tokenAddress,
      token: name as TOKEN,
      weight,
      value: balance * price,
      currentWeight: (compositoinBalance / balance) * 100,

      userBalance,
    };
  });

  const tableData: PoolCompositionTable[] = poolData?.map(d => ({
    tokenAddress: d.tokenAddress,
    token: (
      <TableColumnTokenAddress
        token={d.token}
        width={216}
        onClick={() => window.open(`${SCANNER_URL}/address/${d.tokenAddress}`)}
      />
    ),
    weight: <TableColumn value={`${d.weight.toFixed(2)}%`} width={120} align="flex-end" />,
    balance: (
      <TableColumn value={`${formatNumber(d.userBalance, 2)}`} width={120} align="flex-end" />
    ),
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
