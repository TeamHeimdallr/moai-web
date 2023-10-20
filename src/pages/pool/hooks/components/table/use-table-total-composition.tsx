import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useLiquidityPoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';

import { SCANNER_URL } from '~/constants';

import { TableColumn, TableColumnTokenAddress, TableHeader } from '~/components/tables';

import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { useTablePoolCompositionSelectTabStore } from '~/states/components/table/tab';

export const useTableTotalComposition = (id: string) => {
  const { selectedTab } = useTablePoolCompositionSelectTabStore();
  const { network } = useParams();
  const { selectedNetwork } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const isMyComposition = selectedTab === 'my-composition';

  const {
    pool: { lpTokenTotalSupply, compositions, value: poolTotalValue },
    lpTokenBalance,
  } = useLiquidityPoolBalance(id);

  const poolShareRatio = lpTokenTotalSupply === 0 ? 0 : lpTokenBalance / lpTokenTotalSupply;
  const poolData = compositions?.map(composition => {
    const { address, symbol, balance: compositionBalance, price, weight } = composition;
    const userBalance = (compositionBalance ?? 0) * poolShareRatio;
    const balance = isMyComposition ? userBalance : compositionBalance ?? 0;

    return {
      id: address,
      address,
      symbol,
      weight,
      value: balance * (price ?? 0),
      currentWeight: ((balance * (price ?? 0)) / poolTotalValue) * 100,

      balance,
    };
  });

  const tableData = useMemo(
    () =>
      poolData?.map(d => ({
        id: d.id,
        token: (
          <TableColumnTokenAddress
            token={d.symbol}
            width={216}
            onClick={() => window.open(`${SCANNER_URL[currentNetwork]}/address/${d.address ?? ''}`)}
          />
        ),
        weight: <TableColumn value={`${d.weight.toFixed(2)}%`} width={120} align="flex-end" />,
        balance: (
          <TableColumn value={`${formatNumber(d.balance, 2)}`} width={120} align="flex-end" />
        ),
        value: <TableColumn value={`$${formatNumber(d.value, 2)}`} width={120} align="flex-end" />,
        currentWeight: (
          <TableColumn
            value={`${formatNumber(d.currentWeight, 2)}%`}
            width={120}
            align="flex-end"
          />
        ),
      })),
    [currentNetwork, poolData]
  );

  const columns = useMemo(
    () => [
      { accessorKey: 'id' },
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
    ],
    []
  );

  return {
    columns,
    data: tableData,
  };
};
