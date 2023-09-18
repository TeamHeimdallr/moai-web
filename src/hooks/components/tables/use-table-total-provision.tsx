import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';
import { Address, isAddressEqual } from 'viem';

import { useGetLiquidityPoolProvisions } from '~/api/api-contract/pool/get-liquidity-pool-provisions';
import { COLOR } from '~/assets/colors';
import { IconMinus, IconPlus } from '~/assets/icons';
import { TableHeader, TableHeaderSortable } from '~/components/tables';
import { TableColumn } from '~/components/tables/columns';
import { TableColumnIcon } from '~/components/tables/columns/column-icon';
import { TableColumnLink } from '~/components/tables/columns/column-link';
import { TableColumnTokenPair } from '~/components/tables/columns/column-token-pair';
import { SCANNER_URL, TOKEN_USD_MAPPER } from '~/constants';
import { useConnectWallet } from '~/hooks/data/use-connect-wallet';
import { useTableLiquidityPoolProvisionStore } from '~/states/components/table-liquidity-pool-provision';
import { useSelectedLiquidityPoolProvisionTabStore } from '~/states/pages/selected-liquidity-pool-provision-tab';
import { LiquidityProvisionData, LiquidityProvisionTable } from '~/types/components';
import { formatNumber } from '~/utils/number';
import { elapsedTime } from '~/utils/time';

export const useTableTotalProvision = (poolAddress: Address) => {
  const { address } = useConnectWallet();
  const { sorting, setSorting } = useTableLiquidityPoolProvisionStore();
  const { selected: selectedTab } = useSelectedLiquidityPoolProvisionTabStore();

  const isMyProvision = selectedTab === 'my-provision';

  const { data } = useGetLiquidityPoolProvisions({ poolAddress });

  const poolData = data?.map(d => {
    const id = d?.poolId ?? '0x';
    const label = d?.type === 'deposit' ? 'Add tokens' : d?.type === 'withdraw' ? 'Withdraw' : '';
    const action = { key: d?.type ?? '', label };
    const tokens =
      d?.tokens?.map(t => ({
        name: t?.symbol,
        balance: t?.amount ?? 0,
        value: (t?.amount ?? 0) * (TOKEN_USD_MAPPER[t?.symbol] ?? 0),
      })) ?? [];
    const value = tokens?.reduce((acc, cur) => acc + cur.value, 0);
    const time = d?.timestamp ?? Date.now();
    const liquidityProvider = d?.liquidityProvider ?? '0x';
    const txHash = d?.txHash ?? '0x';

    return {
      id,
      action,
      tokens,
      value,
      time,
      liquidityProvider,
      txHash,
    } as LiquidityProvisionData;
  });

  const sortedData = poolData?.sort((a, b) => {
    if (sorting?.key === 'TIME') return sorting.order === 'asc' ? a.time - b.time : b.time - a.time;
    return 0;
  });

  const filteredData =
    isMyProvision && address
      ? sortedData?.filter(d => isAddressEqual(d.liquidityProvider, address))
      : sortedData;

  const tableData: LiquidityProvisionTable[] = filteredData?.map(d => ({
    id: d.id,
    action: (
      <TableColumnIcon
        text={d.action.label}
        icon={
          d.action.key === 'deposit' ? (
            <IconPlus width={20} height={20} fill={COLOR.GREEN[50]} />
          ) : (
            <IconMinus width={20} height={20} fill={COLOR.RED[50]} />
          )
        }
        width={160}
      />
    ),
    tokens: <TableColumnTokenPair tokens={d.tokens} />,
    value: <TableColumn value={`$${formatNumber(d.value, 2)}`} width={120} align="flex-end" />,
    time: (
      <TableColumnLink
        token={`${elapsedTime(d.time)}`}
        align="flex-end"
        width={160}
        link={`${SCANNER_URL}/tx/${d.txHash}`}
      />
    ),
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
      header: () => <TableHeader label="Tokens" width="full" align="flex-start" />,
      cell: row => row.renderValue(),
      accessorKey: 'tokens',
    },
    {
      header: () => <TableHeader label="Value" width={120} align="flex-end" />,
      cell: row => row.renderValue(),
      accessorKey: 'value',
    },
    {
      header: () => (
        <TableHeaderSortable
          sortKey="TIME"
          label="Time"
          sorting={sorting}
          setSorting={setSorting}
        />
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
