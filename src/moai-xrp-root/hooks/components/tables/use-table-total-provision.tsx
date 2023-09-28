import { ReactNode } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Address, isAddressEqual } from 'viem';

import { COLOR } from '~/assets/colors';
import { IconMinus, IconPlus } from '~/assets/icons';

import {
  TableColumn,
  TableColumnIcon,
  TableColumnLink,
  TableColumnTokenPair,
  TableHeader,
  TableHeaderSortable,
} from '~/components/tables';

import { useConnectEvmWallet } from '~/hooks/data/use-connect-evm-wallet';
import { formatNumber } from '~/utils/number';
import { elapsedTime } from '~/utils/time';
import { useTableLiquidityPoolProvisionStore } from '~/states/components/table-liquidity-pool-provision';
import { useSelectedLiquidityPoolProvisionTabStore } from '~/states/pages/selected-liquidity-pool-provision-tab';

import { useGetLiquidityPoolProvisions } from '~/moai-xrp-root/api/api-contract/pool/get-liquidity-pool-provisions';

import { SCANNER_URL } from '~/moai-xrp-root/constants';

import { LiquidityProvisionData, LiquidityProvisionTable } from '~/moai-xrp-root/types/components';

export const useTableTotalProvision = (poolId: Address) => {
  const { address } = useConnectEvmWallet();
  const { data } = useGetLiquidityPoolProvisions({ poolId });

  const { selected: selectedTab } = useSelectedLiquidityPoolProvisionTabStore();

  const isMyProvision = selectedTab === 'my-provision';

  const poolData = data?.map(d => {
    const id = d?.poolId ?? '0x0';
    const label = d?.type === 'deposit' ? 'Add tokens' : d?.type === 'withdraw' ? 'Withdraw' : '';

    const action = { key: d?.type ?? '', label };

    const tokens =
      d?.tokens?.map(t => ({
        name: t?.name ?? '',
        balance: t?.balance ?? 0,
        value: t?.value ?? 0,
      })) ?? [];

    const value = tokens?.reduce((acc, cur) => acc + cur.value, 0);
    const time = d?.time ?? Date.now();
    const liquidityProvider = d?.liquidityProvider ?? '0x0';
    const txHash = d?.txHash ?? '0x0';

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

  const { sorting, setSorting } = useTableLiquidityPoolProvisionStore();
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
