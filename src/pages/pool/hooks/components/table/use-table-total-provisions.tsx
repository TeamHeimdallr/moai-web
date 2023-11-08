import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useGetLiquidityPoolProvisions } from '~/api/api-contract/pool/get-liquidity-pool-provisions';

import { COLOR } from '~/assets/colors';
import { IconMinus, IconPlus } from '~/assets/icons';

import { SCANNER_URL } from '~/constants';

import {
  TableColumn,
  TableColumnIconText,
  TableColumnLink,
  TableColumnTokenPair,
  TableHeader,
  TableHeaderSortable,
} from '~/components/tables';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { elapsedTime } from '~/utils/util-time';
import { useTableLiquidityPoolProvisionSortStore } from '~/states/components';
import { useTablePoolLiquidityProvisionSelectTabStore } from '~/states/components/table/tab';

export const useTableTotalProvision = (id: string) => {
  const { network } = useParams();

  const { data } = useGetLiquidityPoolProvisions({ id });

  const { selectedTab } = useTablePoolLiquidityProvisionSelectTabStore();
  const { sort, setSort } = useTableLiquidityPoolProvisionSortStore();

  const { selectedNetwork, isXrp } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { currentAddress } = useConnectedWallet(currentNetwork);

  const isMyProvision = selectedTab === 'my-provision';

  const poolData = data?.map(d => {
    const id = d?.id ?? '';
    const label = d?.type === 'deposit' ? 'Add tokens' : d?.type === 'withdraw' ? 'Withdrawal' : '';

    const action = { key: d?.type ?? '', label };

    const tokens =
      d?.tokens?.map(t => ({
        symbol: t?.symbol ?? '',
        balance: t?.balance ?? 0,
        value: t?.value ?? 0,
      })) ?? [];

    const value = tokens?.reduce((acc, cur) => acc + cur.value, 0);
    const time = d?.time ?? Date.now();
    const liquidityProvider = d?.liquidityProvider ?? '';
    const txHash = d?.txHash ?? '';

    return {
      id,
      action,
      tokens,
      value,
      time,
      liquidityProvider,
      txHash,
    };
  });

  const sortedData = poolData?.sort((a, b) => {
    if (sort?.key === 'TIME') return sort.order === 'asc' ? a.time - b.time : b.time - a.time;
    return 0;
  });

  const filteredData =
    isMyProvision && currentAddress
      ? sortedData?.filter(d => d.liquidityProvider === currentAddress)
      : sortedData;

  const tableData = useMemo(
    () =>
      filteredData?.map(d => ({
        id: d.id,
        action: (
          <TableColumnIconText
            text={d.action.label}
            icon={
              d.action.key === 'deposit' ? (
                <IconPlus width={20} height={20} fill={COLOR.GREEN[50]} />
              ) : (
                <IconMinus width={20} height={20} fill={COLOR.RED[50]} />
              )
            }
          />
        ),
        tokens: <TableColumnTokenPair tokens={d.tokens} />,
        value: <TableColumn value={`$${formatNumber(d.value, 2)}`} align="flex-end" />,
        time: (
          <TableColumnLink
            token={`${elapsedTime(d.time)}`}
            align="flex-end"
            link={`${SCANNER_URL[currentNetwork]}/${isXrp ? 'transactions' : 'tx'}/${d.txHash}`}
          />
        ),
      })),
    [currentNetwork, filteredData, isXrp]
  );

  const columns = useMemo(
    () => [
      { accessorKey: 'id' },
      {
        header: () => <TableHeader label="Action" align="flex-start" />,
        cell: row => row.renderValue(),
        accessorKey: 'action',
      },
      {
        header: () => <TableHeader label="Tokens" align="flex-start" />,
        cell: row => row.renderValue(),
        accessorKey: 'tokens',
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

    filteredData,
  };
};
