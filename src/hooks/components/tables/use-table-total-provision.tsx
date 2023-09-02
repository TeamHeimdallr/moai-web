import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';

import { COLOR } from '~/assets/colors';
import { IconMinus, IconPlus } from '~/assets/icons';
import { TableHeader, TableHeaderSortable } from '~/components/tables';
import { TableColumn } from '~/components/tables/columns';
import { TableColumnIcon } from '~/components/tables/columns/column-icon';
import { TableColumnLink } from '~/components/tables/columns/column-link';
import { TableColumnTokenPair } from '~/components/tables/columns/column-token-pair';
import { TOKEN_USD_MAPPER } from '~/constants';
import { LiquidityProvisionData, LiquidityProvisionTable } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

export const useTableTotalProvision = () => {
  // TODO: connect api
  const data: LiquidityProvisionData[] = [
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
      header: () => <TableHeader label="Tokens" width={272} align="flex-start" />,
      cell: row => row.renderValue(),
      accessorKey: 'tokens',
    },
    {
      header: () => <TableHeader label="Valule" width={120} align="flex-end" />,
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
