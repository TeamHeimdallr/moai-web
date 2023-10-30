import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { NetworkChip } from '~/components/network-chip';
import {
  TableColumn,
  TableColumnToken,
  TableHeader,
  TableHeaderAPR,
  TableHeaderComposition,
  TableHeaderSortable,
} from '~/components/tables';

import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { useTableLiquidityPoolSortStore } from '~/states/components';
import { useShowAllPoolsStore } from '~/states/pages';
import { NETWORK } from '~/types';

interface Props {
  isChain?: boolean;
}

export const useTableLiquidityPool = ({ isChain }: Props) => {
  const { showAllPools } = useShowAllPoolsStore();

  const { network } = useParams();
  const { selectedNetwork } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { sort, setSort } = useTableLiquidityPoolSortStore();

  // TODO: connect server
  const data = [
    {
      id: 'rHxWxmYU1AkWFmp3eq2afQ4qrPE7sVqHVr',
      network: NETWORK.XRPL,
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
      network: NETWORK.THE_ROOT_NETWORK,
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
      network: NETWORK.EVM_SIDECHAIN,
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
  const filteredData = showAllPools ? data : data?.filter(d => d.network === currentNetwork);
  const sortedData = filteredData?.sort((a, b) => {
    if (sort?.key === 'POOL_VALUE')
      return sort.order === 'asc' ? a.poolValue - b.poolValue : b.poolValue - a.poolValue;

    if (sort?.key === 'VOLUME')
      return sort.order === 'asc' ? a.volume - b.volume : b.volume - a.volume;

    return 0;
  });

  const tableData = useMemo(
    () =>
      sortedData?.map(d => {
        const tokens = d.compositions.reduce((acc, cur) => {
          acc[cur.name] = cur.weight;
          return acc;
        }, {});

        return {
          meta: {
            id: d.id,
            network: d.network,
          },
          network: isChain ? <TableColumn value={<NetworkChip network={d.network} />} /> : null,
          compositions: <TableColumnToken tokens={tokens} />,
          poolValue: <TableColumn value={`$${formatNumber(d.poolValue, 2)}`} align="flex-end" />,
          volume: <TableColumn value={`$${formatNumber(d.volume, 2)}`} align="flex-end" />,
          apr: <TableColumn value={`${formatNumber(d.apr, 2)}%`} align="flex-end" />,
        };
      }),
    [sortedData, isChain]
  );

  const columns = useMemo(
    () => [
      { accessorKey: 'meta' },
      isChain
        ? {
            header: () => <TableHeader label="Chain" />,
            cell: row => row.renderValue(),
            accessorKey: 'network',
          }
        : {
            header: () => <></>,
            accessorKey: 'null',
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
            sort={sort}
            setSort={setSort}
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
            sort={sort}
            setSort={setSort}
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
    [sort, isChain]
  );

  return {
    columns,
    data: tableData,
  };
};
