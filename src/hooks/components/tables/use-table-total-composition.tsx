import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';
import { Address } from 'viem';

import { usePoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';
import { TableHeader } from '~/components/tables';
import { TableColumn } from '~/components/tables/columns';
import { TableColumnTokenAddress } from '~/components/tables/columns/column-token-address';
import { useConnectWallet } from '~/hooks/data/use-connect-wallet';
import { useSelectedLiquidityPoolCompositionTabStore } from '~/states/pages/selected-liquidity-pool-composition-tab';
import { PoolCompositionData, PoolCompositionTable } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

export const useTableTotalComposition = (poolAddress: Address) => {
  const { selected: selectedTab } = useSelectedLiquidityPoolCompositionTabStore();
  const { address } = useConnectWallet();

  const isMyComposition = selectedTab === 'my-composition';

  const { compositions, tokenTotalSupply, liquidityPoolTokenBalance } = usePoolBalance(
    poolAddress,
    address
  );

  const totalBalance = compositions?.reduce((acc, cur) => acc + cur.balance, 0);
  const poolShareRatio = tokenTotalSupply === 0 ? 0 : liquidityPoolTokenBalance / tokenTotalSupply;

  const poolData: PoolCompositionData[] = compositions?.map(composition => {
    const { tokenAddress, name, balance: compositoinBalance, price, weight } = composition;
    const balance = isMyComposition ? compositoinBalance * poolShareRatio : compositoinBalance;

    return {
      tokenAddress,
      token: name as TOKEN,
      weight,
      balance,
      value: balance * price,
      currentWeight: (compositoinBalance / totalBalance) * 100,
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
