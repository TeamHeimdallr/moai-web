import { useMemo } from 'react';

import { TOKEN } from '~/constants';

import { NetworkChip } from '~/components/network-chip';
import {
  TableColumn,
  TableColumnBadge,
  TableColumnToken,
  TableColumnTokenIcon,
  TableHeader,
  TableHeaderAPR,
  TableHeaderAssets,
  TableHeaderComposition,
  TableHeaderSortable,
} from '~/components/tables';

import { formatNumber } from '~/utils/util-number';
import { useTableLiquidityPoolStore } from '~/states/components/table-liquidity-pool';

export const useTableLiquidityPool = () => {
  const { sorting, setSorting } = useTableLiquidityPoolStore();

  // TODO: connect server
  const data = [
    {
      id: 'rHxWxmYU1AkWFmp3eq2afQ4qrPE7sVqHVr',
      chain: 'XRPL',
      assets: ['XRP', 'MOAI'],
      compositions: [
        {
          name: 'XRP',
          balance: 3493.294,
          price: 1.749,
          value: 100000,
          tokenAddress: 'XRP',
          weight: 50,
        },
        {
          name: 'MOAI',
          balance: 3493.294,
          price: 1.749,
          value: 100000,
          tokenAddress: 'MOAI',
          weight: 50,
        },
      ],
      poolValue: 730008,
      volume: 58137,
      apr: 5.49,
    },
    {
      id: '0x291af6e1b841cad6e3dcd66f2aa0790a007578ad000200000000000000000000',
      chain: 'ROOT',
      assets: ['XRP', 'ROOT'],
      compositions: [
        {
          name: 'XRP',
          balance: 3493.294,
          price: 1.749,
          value: 100000,
          tokenAddress: 'XRP',
          weight: 50,
        },
        {
          name: 'ROOT',
          balance: 3493.294,
          price: 1.749,
          value: 100000,
          tokenAddress: 'ROOT',
          weight: 50,
        },
      ],
      poolValue: 1259280,
      volume: 78086,
      apr: 6.79,
    },
    {
      id: '0xe73749250390c51e029cfab3d0488e08c183a671000200000000000000000001',
      chain: 'XRPEVM',
      assets: ['XRP', 'WETH'],
      compositions: [
        {
          name: 'XRP',
          balance: 3493.294,
          price: 1.749,
          value: 100000,
          tokenAddress: 'MOAI',
          weight: 50,
        },
        {
          name: 'WETH',
          balance: 3493.294,
          price: 1.749,
          value: 100000,
          tokenAddress: 'WETH',
          weight: 50,
        },
      ],
      poolValue: 948822,
      volume: 17669,
      apr: 8.94,
    },
  ];

  const sortedData = data?.sort((a, b) => {
    if (sorting?.key === 'POOL_VALUE')
      return sorting.order === 'asc' ? a.poolValue - b.poolValue : b.poolValue - a.poolValue;

    if (sorting?.key === 'VOLUME')
      return sorting.order === 'asc' ? a.volume - b.volume : b.volume - a.volume;

    return 0;
  });

  const tableData = useMemo(
    () =>
      sortedData?.map(d => {
        const tokens = d.compositions.reduce((acc, cur) => {
          acc[cur.name as TOKEN] = cur.weight;
          return acc;
        }, {});

        return {
          'id-raw': d.id,
          'chain-raw': d.chain,
          chain: <TableColumnBadge value={<NetworkChip network={d.chain} />} width={216} />,
          assets: <TableColumnTokenIcon tokens={d.assets} />,
          compositions: <TableColumnToken tokens={tokens} />,
          poolValue: (
            <TableColumn value={`$${formatNumber(d.poolValue, 2)}`} width={160} align="flex-end" />
          ),
          volume: (
            <TableColumn value={`$${formatNumber(d.volume, 2)}`} width={160} align="flex-end" />
          ),
          apr: <TableColumn value={`${formatNumber(d.apr, 2)}%`} width={160} align="flex-end" />,
        };
      }),
    [sortedData]
  );

  const columns = useMemo(
    () => [
      { accessorKey: 'id-raw' },
      { accessorKey: 'chain-raw' },
      {
        header: () => <TableHeader width={216} label="Chain" />,
        cell: row => row.renderValue(),
        accessorKey: 'chain',
      },
      {
        header: () => <TableHeaderAssets />,
        cell: row => row.renderValue(),
        accessorKey: 'assets',
      },
      {
        header: () => <TableHeaderComposition />,
        cell: row => row.renderValue(),
        accessorKey: 'compositions',
      },
      {
        header: () => (
          <TableHeaderSortable
            sortKey="POOL_VALUE"
            label="Pool value"
            sorting={sorting}
            setSorting={setSorting}
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'poolValue',
      },
      {
        header: () => (
          <TableHeaderSortable
            sortKey="VOLUME"
            label="Volume (24h)"
            sorting={sorting}
            setSorting={setSorting}
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'volume',
      },
      {
        header: () => <TableHeaderAPR />,
        cell: row => row.renderValue(),
        accessorKey: 'apr',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sorting]
  );

  return {
    columns,
    data: tableData,
  };
};
