import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';

import { COLOR } from '~/assets/colors';
import { IconMinus, IconPlus } from '~/assets/icons';
import { TableHeader, TableHeaderSortable } from '~/components/tables';
import { TableColumn } from '~/components/tables/columns';
import { TableColumnIcon } from '~/components/tables/columns/column-icon';
import { TableColumnLink } from '~/components/tables/columns/column-link';
import { TableColumnTokenPair } from '~/components/tables/columns/column-token-pair';
import { POOL_ID, TOKEN_USD_MAPPER } from '~/constants';
import { LiquidityProvisionData, LiquidityProvisionTable } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

export const useTableTotalProvision = (id: string) => {
  // TODO: connect api
  const poolAData: LiquidityProvisionData[] = [
    {
      id: 0,
      action: { key: 'add', label: 'Add tokens' },
      tokens: [
        { name: TOKEN.MOAI, balance: 162.87, value: 162.87 * TOKEN_USD_MAPPER[TOKEN.MOAI] },
        { name: TOKEN.WETH, balance: 3.37, value: 3.37 * TOKEN_USD_MAPPER[TOKEN.WETH] },
      ],
      value: 28955,
      time: '2 months',
    },
    {
      id: 1,
      action: { key: 'withdraw', label: 'Withdraw' },
      tokens: [
        { name: TOKEN.MOAI, balance: 1024, value: 1024 * TOKEN_USD_MAPPER[TOKEN.MOAI] },
        { name: TOKEN.WETH, balance: 21.19, value: 21.19 * TOKEN_USD_MAPPER[TOKEN.WETH] },
      ],
      value: 182054,
      time: '10 days',
    },
  ];

  const poolBData: LiquidityProvisionData[] = [
    {
      id: 0,
      action: { key: 'add', label: 'Add tokens' },
      tokens: [
        { name: TOKEN.WETH, balance: 0.13, value: 0.13 * TOKEN_USD_MAPPER[TOKEN.WETH] },
        { name: TOKEN.USDC, balance: 105.9, value: 105.9 * TOKEN_USD_MAPPER[TOKEN.USDC] },
        { name: TOKEN.USDT, balance: 105.89, value: 105.89 * TOKEN_USD_MAPPER[TOKEN.USDT] },
      ],
      value: 423.604,
      time: '2 months',
    },
    {
      id: 1,
      action: { key: 'add', label: 'Add tokens' },
      tokens: [
        { name: TOKEN.WETH, balance: 0.62, value: 0.62 * TOKEN_USD_MAPPER[TOKEN.WETH] },
        { name: TOKEN.USDT, balance: 505.09, value: 505.09 * TOKEN_USD_MAPPER[TOKEN.USDC] },
        { name: TOKEN.USDC, balance: 505.09, value: 505.09 * TOKEN_USD_MAPPER[TOKEN.USDC] },
      ],
      value: 2020.362,
      time: '2 months',
    },
  ];
  const data = id === POOL_ID.POOL_A ? poolAData : poolBData;

  const tableData: LiquidityProvisionTable[] = data?.map(d => ({
    id: d.id,
    action: (
      <TableColumnIcon
        text={d.action.label}
        icon={
          d.action.key === 'add' ? (
            <IconPlus width={20} height={20} fill={COLOR.RED[50]} />
          ) : (
            <IconMinus width={20} height={20} fill={COLOR.GREEN[50]} />
          )
        }
        width={160}
      />
    ),
    tokens: <TableColumnTokenPair tokens={d.tokens} />,
    value: <TableColumn value={`$${formatNumber(d.value, 2)}`} width={120} align="flex-end" />,
    time: <TableColumnLink token={`${d.time} ago`} align="flex-end" width={160} />,
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
        <TableHeaderSortable sortKey="TIME" label="Time" sorting={{ key: 'TIME', order: 'desc' }} />
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
