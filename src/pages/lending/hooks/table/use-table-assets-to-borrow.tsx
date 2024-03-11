import { ReactNode, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { formatUnits } from 'viem';

import { useUserAvailableBorrowAll } from '~/api/api-contract/_evm/lending/user-available-borrow-all';
import { useGetAllMarkets } from '~/api/api-contract/lending/get-all-markets';
import { useUserAccountSnapshotAll } from '~/api/api-contract/lending/user-account-snapshot-all';

import { IconQuestion } from '~/assets/icons';

import { ButtonIconSmall, ButtonPrimaryMedium } from '~/components/buttons';
import {
  TableColumn,
  TableColumnAmount,
  TableColumnToken,
  TableHeader,
  TableHeaderSortable,
} from '~/components/tables';
import { TableColumnButtons } from '~/components/tables/columns/column-buttons';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr } from '~/utils';
import { calcHealthFactor } from '~/utils/util-lending';
import { useTableLendingAssetsToBorrowSortStore } from '~/states/components';
import { POPUP_ID, TOOLTIP_ID } from '~/types';

import { APYSmall } from '../../components/apy';

export const useTableAssetsToBorrow = () => {
  const navigate = useNavigate();

  const { selectedNetwork, isFpass } = useNetwork();
  const { open } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { evm, fpass } = useConnectedWallet();

  const { sort, setSort } = useTableLendingAssetsToBorrowSortStore();

  const { t } = useTranslation();
  const { isMD } = useMediaQuery();

  const { markets } = useGetAllMarkets();
  const { accountSnapshots } = useUserAccountSnapshotAll();

  const hf = calcHealthFactor({
    markets: markets || [],
    snapshots: accountSnapshots || [],
  });
  const isInLiquidation = hf <= 1.0;

  // TODO: pagination later
  const hasNextPage = false;
  const fetchNextPage = () => {};

  const { availableAmountList } = useUserAvailableBorrowAll({
    mTokenAddresses: markets?.map(m => m?.address || ''),
  });

  const assetsToBorrow = useMemo(
    () =>
      markets?.map((m, i) => {
        const remain = Number(formatUnits(m.cash, m.underlyingDecimals || 18));
        const remainValue = remain * (m.price || 0);

        if (!accountSnapshots || accountSnapshots.length === 0) {
          return {
            id: i,
            address: m.address,
            asset: {
              symbol: m.underlyingSymbol || '',
              image: m.underlyingImage || '',
              balance: 0,
              availables: remain,
              value: remainValue,
              debt: 0,
              debtValue: 0,
            },
            apy: m.borrowApy || 0,
          };
        } else {
          const accountSnapshotIndex = accountSnapshots.findIndex(
            s => s.mTokenAddress === m.address
          );
          const accountSnapshot =
            accountSnapshotIndex === -1 ? undefined : accountSnapshots?.[accountSnapshotIndex];
          const underlyingBalance = Number(
            formatUnits(
              (accountSnapshot?.exchangeRate || 0n) * (accountSnapshot?.mTokenBalance || 0n),
              16 + (m.decimals || 18)
            )
          );
          const availables = availableAmountList?.[i] || 0;
          const value = availables * (m.price || 0);
          const debt = Number(
            formatUnits(accountSnapshot?.borrowBalance || 0n, m.underlyingDecimals || 18)
          );
          const debtValue = debt * (m.price || 0);
          return {
            id: i,
            address: accountSnapshot?.mTokenAddress || '',
            asset: {
              symbol: m.underlyingSymbol || '',
              image: m.underlyingImage || '',
              balance: underlyingBalance,
              availables: availables,
              value,
              debt,
              debtValue,
            },
            apy: m.borrowApy || 0,
          };
        }
      }),
    [accountSnapshots, availableAmountList, markets]
  );

  const sortedAssetsToBorrow = useMemo(() => {
    if (sort?.key === 'available') {
      return assetsToBorrow?.sort((a, b) => {
        if (sort.order === 'desc') {
          return b.asset.value - a.asset.value;
        }
        return a.asset.value - b.asset.value;
      });
    }
    if (sort?.key === 'apy') {
      return assetsToBorrow?.sort((a, b) => {
        if (sort.order === 'desc') {
          return b.apy - a.apy;
        }
        return a.apy - b.apy;
      });
    }

    return assetsToBorrow;
  }, [assetsToBorrow, sort]);

  const handleLendingBorrow = (address: string) => {
    if ((isFpass && fpass.isConnected) || evm.isConnected) {
      const link = `/lending/${getNetworkAbbr(selectedNetwork)}/${address}/borrow`;
      navigate(link);
    } else {
      open();
    }
  };

  const tableData = useMemo(
    () =>
      sortedAssetsToBorrow?.map(d => {
        return {
          meta: { id: d.id, asset: d.asset, address: d.address },
          asset: (
            <TableColumnToken
              tokens={[{ symbol: d.asset.symbol, image: d.asset.image }]}
              disableSelectedToken
            />
          ),
          available: (
            <TableColumnAmount balance={d.asset.availables} value={d.asset.value} align="center" />
          ),
          apy: <TableColumn value={<APYSmall apy={d.apy} />} align="center" />,
          buttons: (
            <TableColumnButtons align="center">
              <ButtonPrimaryMedium
                text={
                  (isFpass && fpass.isConnected) || evm.isConnected
                    ? t('lending-borrow')
                    : t('Connect wallet')
                }
                onClick={e => {
                  e.stopPropagation();
                  handleLendingBorrow(d.address);
                }}
                disabled={d.asset.availables === 0 || isInLiquidation}
              />
            </TableColumnButtons>
          ),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortedAssetsToBorrow, t]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableColumns = useMemo<ColumnDef<any, ReactNode>[]>(
    () => [
      { accessorKey: 'meta' },
      {
        header: () => <TableHeader label="lending-asset" align="flex-start" />,
        cell: row => row.renderValue(),
        accessorKey: 'asset',
      },
      {
        header: () => (
          <TableHeaderSortable
            sortKey="available"
            sort={sort}
            setSort={setSort}
            label="lending-available"
            tableKey="lending-borrows-available"
            align="center"
            tooltipIcon={
              <ButtonIconSmall
                icon={<IconQuestion />}
                data-tooltip-id={TOOLTIP_ID.LENDING_BORROW_AVAIABLE}
              />
            }
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'available',
      },
      {
        header: () => (
          <TableHeaderSortable
            sortKey="apy"
            sort={sort}
            setSort={setSort}
            label="lending-apy"
            tableKey="lending-borrows-apy"
            align="center"
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'apy',
      },
      {
        header: () => <div />,
        cell: row => row.renderValue(),
        accessorKey: 'buttons',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );

  const mobileTableData = useMemo(
    () =>
      sortedAssetsToBorrow?.map((d, i) => {
        return {
          meta: { id: d.id, asset: d.asset, address: d.address },
          rows: [
            <TableColumnToken
              key={i}
              tokens={[{ symbol: d.asset.symbol, image: d.asset.image }]}
              disableSelectedToken
            />,
          ],
          bottomRows: [
            <TableColumnButtons key={i} style={{ width: '100%' }}>
              <ButtonPrimaryMedium
                text={
                  (isFpass && fpass.isConnected) || evm.isConnected
                    ? t('lending-borrow')
                    : t('Connect wallet')
                }
                onClick={e => {
                  e.stopPropagation();
                  handleLendingBorrow(d.address);
                }}
                disabled={d.asset.availables === 0 || isInLiquidation}
              />
            </TableColumnButtons>,
          ],
          dataRows: [
            {
              label: 'lending-available',
              value: <TableColumnAmount balance={d.asset.availables} value={d.asset.value} />,
            },
            {
              label: 'lending-apy-variable',
              value: <TableColumn value={<APYSmall apy={d.apy} />} align="flex-end" />,
            },
          ],
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortedAssetsToBorrow, t]
  );

  const mobileTableColumn = useMemo<ReactNode>(
    () => (
      <TableHeaderSortable
        sortKey="available"
        label="lending-available"
        sort={sort}
        setSort={setSort}
        tableKey="lending-borrows-available"
        tooltipIcon={
          <ButtonIconSmall
            icon={<IconQuestion />}
            data-tooltip-id={TOOLTIP_ID.LENDING_BORROW_AVAIABLE}
          />
        }
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );

  useEffect(() => {
    if (!isMD) setSort({ key: 'available', order: 'desc' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMD]);

  return {
    tableColumns,
    tableData,

    mobileTableData,
    mobileTableColumn,

    assetsToBorrow,
    sortedAssetsToBorrow,

    hasNextPage,
    fetchNextPage,
  };
};
