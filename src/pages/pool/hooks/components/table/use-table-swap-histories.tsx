import { useMemo } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useParams } from 'react-router-dom';

import { useGetSwapHistories } from '~/api/api-contract/swap/get-swap-histories';

import { SCANNER_URL } from '~/constants';

import {
  TableColumn,
  TableColumnIconText,
  TableColumnLink,
  TableColumnTokenSwap,
  TableHeader,
  TableHeaderSortable,
} from '~/components/tables';

import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { truncateAddress } from '~/utils/util-string';
import { elapsedTime } from '~/utils/util-time';
import { useTableSwapHistoriesStore } from '~/states/components';

export const useTableSwapHistories = (id: string) => {
  const { data } = useGetSwapHistories({ id });

  const { network } = useParams();
  const { selectedNetwork, isXrp } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const { sort, setSort } = useTableSwapHistoriesStore();

  const swapData = data?.map(d => {
    const id = d?.id ?? '';

    const tradeDetail =
      d?.tokens?.map(t => ({
        symbol: t?.symbol ?? '',
        balance: t?.balance ?? 0,
        value: t?.value ?? 0,
      })) ?? [];

    const value = tradeDetail?.reduce((acc, cur) => acc + cur.value, 0) ?? 0;
    const time = d?.time ?? Date.now();
    const trader = (d?.trader ?? '') as string;
    const txHash = (d?.txHash ?? '') as string;

    return {
      id,
      trader,
      tradeDetail,
      value,
      time,
      txHash,
    };
  });

  const sortedData = swapData?.sort((a, b) => {
    if (sort?.key === 'TIME') return sort.order === 'asc' ? a.time - b.time : b.time - a.time;
    return 0;
  });

  const tableData = useMemo(
    () =>
      sortedData?.map(d => ({
        id: d.id,
        trader: (
          <TableColumnIconText
            text={truncateAddress(d.trader, 4)}
            icon={<Jazzicon diameter={24} seed={jsNumberForAddress(d.trader ?? '')} />}
            address
          />
        ),
        tradeDetail: <TableColumnTokenSwap tokens={d.tradeDetail} />,
        value: <TableColumn value={`$${formatNumber(d.value, 2)}`} align="flex-end" />,
        time: (
          <TableColumnLink
            token={`${elapsedTime(d.time)}`}
            align="flex-end"
            link={`${SCANNER_URL[currentNetwork]}/${isXrp ? 'transactions' : 'tx'}/${d.txHash}`}
          />
        ),
      })),
    [currentNetwork, isXrp, sortedData]
  );

  const columns = useMemo(
    () => [
      { accessorKey: 'id' },
      {
        header: () => <TableHeader label="Trader" align="flex-start" />,
        cell: row => row.renderValue(),
        accessorKey: 'trader',
      },
      {
        header: () => <TableHeader label="Trade details" align="flex-start" />,
        cell: row => row.renderValue(),
        accessorKey: 'tradeDetail',
      },
      {
        header: () => <TableHeader label="Value" align="flex-end" />,
        cell: row => row.renderValue(),
        accessorKey: 'value',
      },
      {
        header: () => (
          <TableHeaderSortable sortKey="TIME" label="Time" sort={sort} setSort={setSort} />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'time',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );

  return {
    columns,
    data: tableData,
  };
};
