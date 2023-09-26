import { ReactNode } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { TableHeader } from '~/components/tables';
import { TableColumn } from '~/components/tables/columns';
import { TableColumnTokenAddress } from '~/components/tables/columns/column-token-address';

import { formatNumber } from '~/utils/number';
import { useSelectedLiquidityPoolCompositionTabStore } from '~/states/pages/selected-liquidity-pool-composition-tab';

import { useLiquidityPoolBalance } from '~/moai-xrp-ledger/api/api-contract/pool/get-liquidity-pool-balance';

import { AMM, SCANNER_URL } from '~/moai-xrp-ledger/constants';

import { PoolCompositionData, PoolCompositionTable } from '~/moai-xrp-ledger/types/components';

export const useTableTotalComposition = (poolId: string) => {
  const { selected: selectedTab } = useSelectedLiquidityPoolCompositionTabStore();

  const isMyComposition = selectedTab === 'my-composition';

  const {
    poolInfo: { balance: poolBalance, tokenTotalSupply, compositions },
    liquidityPoolTokenBalance,
  } = useLiquidityPoolBalance(AMM[poolId]);

  const poolShareRatio = tokenTotalSupply === 0 ? 0 : liquidityPoolTokenBalance / tokenTotalSupply;

  const poolData: PoolCompositionData[] = compositions?.map(composition => {
    const { tokenIssuer, name, balance: compositionBalance, price, weight } = composition;
    const userBalance = compositionBalance * poolShareRatio;
    const balance = isMyComposition ? userBalance : compositionBalance;

    return {
      tokenIssuer: tokenIssuer ?? '',
      token: name,
      weight,
      value: balance * price,
      currentWeight: (balance / poolBalance) * 100,

      userBalance,
    };
  });

  const tableData: PoolCompositionTable[] = poolData?.map(d => ({
    tokenIssuer: d.tokenIssuer,
    token: (
      <TableColumnTokenAddress
        token={d.token}
        width={216}
        onClick={() => window.open(`${SCANNER_URL}/token/${d.token}.${d.tokenIssuer}`)}
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
      accessorKey: 'tokenIssuer',
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
