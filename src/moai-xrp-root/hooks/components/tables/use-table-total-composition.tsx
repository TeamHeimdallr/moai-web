import { ReactNode } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Address } from 'viem';

import { TableColumn, TableColumnTokenAddress, TableHeader } from '~/components/tables';

import { formatNumber } from '~/utils/number';
import { useSelectedLiquidityPoolCompositionTabStore } from '~/states/pages/selected-liquidity-pool-composition-tab';

import { useLiquidityPoolBalance } from '~/moai-xrp-root/api/api-contract/pool/get-liquidity-pool-balance';

import { SCANNER_URL } from '~/moai-xrp-root/constants';

import { PoolCompositionData, PoolCompositionTable } from '~/moai-xrp-root/types/components';

import { TOKEN } from '~/moai-xrp-root/types/contracts';

export const useTableTotalComposition = (poolId: Address) => {
  const { selected: selectedTab } = useSelectedLiquidityPoolCompositionTabStore();

  const isMyComposition = selectedTab === 'my-composition';

  const {
    poolInfo: { balance: poolBalance, tokenTotalSupply, compositions },
    liquidityPoolTokenBalance,
  } = useLiquidityPoolBalance(poolId);

  const poolShareRatio = tokenTotalSupply === 0 ? 0 : liquidityPoolTokenBalance / tokenTotalSupply;

  const poolData: PoolCompositionData[] = compositions?.map(composition => {
    const { tokenAddress, name, balance: compositionBalance, price, weight } = composition;
    const userBalance = compositionBalance * poolShareRatio;
    const balance = isMyComposition ? userBalance : compositionBalance;

    return {
      tokenAddress,
      token: name as TOKEN,
      weight,
      value: balance * price,
      currentWeight: poolBalance ? (balance / poolBalance) * 100 : 0,

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
