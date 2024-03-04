import { ReactNode, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';

import { useGetAllMarkets } from '~/api/api-contract/lending/get-all-markets';

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
import { TableColumnCheck } from '~/components/tables/columns/column-check';
import { TableHeaderTooltip } from '~/components/tables/headers/header-normal';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr } from '~/utils';
import { useTableLendingAssetsToSupplySortStore } from '~/states/components';
import { useShowZeroBalanceAssetsStore } from '~/states/pages/lending';
import { POPUP_ID, TOOLTIP_ID } from '~/types';

import { APYSmall } from '../../components/apy';

export const useTableAssetsToSupply = () => {
  const navigate = useNavigate();

  const { sort, setSort } = useTableLendingAssetsToSupplySortStore();
  const { showZeroBalances } = useShowZeroBalanceAssetsStore();

  const { t } = useTranslation();

  const { isMD } = useMediaQuery();
  const { selectedNetwork, isFpass } = useNetwork();
  const { currentAddress, evm, fpass } = useConnectedWallet(selectedNetwork);

  const { open } = usePopup(POPUP_ID.CONNECT_WALLET);

  const { markets } = useGetAllMarkets();
  const assetsToSupply = markets?.filter(m =>
    showZeroBalances || !currentAddress ? true : (m.underlyingBalance ?? 0) > 0
  );

  const sortedAssetsToSupply = useMemo(() => {
    if (sort?.key === 'balance') {
      return assetsToSupply?.sort((a, b) => {
        if (sort.order === 'desc') {
          return (b.underlyingBalance ?? 0) - (a.underlyingBalance ?? 0);
        }
        return (a.underlyingBalance ?? 0) - (b.underlyingBalance ?? 0);
      });
    }
    if (sort?.key === 'apy') {
      return assetsToSupply?.sort((a, b) => {
        if (sort.order === 'desc') {
          return b.supplyApy - a.supplyApy;
        }
        return a.supplyApy - b.supplyApy;
      });
    }

    return assetsToSupply;
  }, [assetsToSupply, sort]);

  const handleLendingSupply = (address: string) => {
    if ((isFpass && fpass.isConnected) || evm.isConnected) {
      const link = `/lending/${getNetworkAbbr(selectedNetwork)}/${address}/supply`;
      navigate(link);
    } else {
      open();
    }
  };

  const tableData = useMemo(
    () =>
      sortedAssetsToSupply?.map(d => {
        return {
          meta: { address: d.address },
          asset: (
            <TableColumnToken
              tokens={[{ symbol: d.underlyingSymbol ?? '', image: d.underlyingImage }]}
              disableSelectedToken
            />
          ),
          balance: (
            <TableColumnAmount
              balance={d.underlyingBalance ?? 0}
              value={(d.underlyingBalance ?? 0) * (d.price || 0)}
              align="center"
              empty={!currentAddress}
            />
          ),
          apy: <TableColumn value={<APYSmall apy={d.supplyApy} />} align="center" />,
          collateral: (
            <TableColumnCheck active={d.collateralFactorsMantissa !== 0n} align="center" />
          ),
          buttons: (
            <TableColumnButtons align="flex-end">
              <ButtonPrimaryMedium
                text={
                  (isFpass && fpass.isConnected) || evm.isConnected
                    ? t('lending-supply')
                    : t('Connect wallet')
                }
                onClick={e => {
                  e.stopPropagation();
                  handleLendingSupply(d.address);
                }}
              />
            </TableColumnButtons>
          ),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentAddress, sortedAssetsToSupply, t]
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
            sortKey="balance"
            sort={sort}
            setSort={setSort}
            label="lending-wallet-balance"
            tableKey="lending-supplies-wallet-balance"
            align="center"
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'balance',
      },
      {
        header: () => (
          <TableHeaderSortable
            sortKey="apy"
            sort={sort}
            setSort={setSort}
            label="lending-apy"
            tableKey="lending-supplies-my-balance"
            align="center"
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'apy',
      },
      {
        header: () => (
          <TableHeaderTooltip
            label="lending-collateral"
            tooltipIcon={
              <ButtonIconSmall
                icon={<IconQuestion />}
                data-tooltip-id={TOOLTIP_ID.LENDING_SUPPLY_MY_COLLATERAL}
              />
            }
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'collateral',
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
      sortedAssetsToSupply?.map((d, i) => {
        return {
          meta: { address: d.address },
          rows: [
            <TableColumnToken
              key={i}
              tokens={[{ symbol: d.underlyingSymbol ?? '', image: d.underlyingImage }]}
              disableSelectedToken
            />,
          ],
          bottomRows: [
            <TableColumnButtons key={i} style={{ width: '100%' }}>
              <ButtonPrimaryMedium
                text={
                  (isFpass && fpass.isConnected) || evm.isConnected
                    ? t('lending-supply')
                    : t('Connect wallet')
                }
                onClick={e => {
                  e.stopPropagation();
                  handleLendingSupply(d.address);
                }}
              />
            </TableColumnButtons>,
          ],
          dataRows: [
            {
              label: 'lending-my-balance',
              value: (
                <TableColumnAmount
                  balance={d.underlyingBalance ?? 0}
                  value={d.underlyingBalance ?? 0 * (d.price || 0)}
                />
              ),
            },
            {
              label: 'lending-apy',
              value: <TableColumn value={<APYSmall apy={d.supplyApy} />} align="flex-end" />,
            },
            {
              label: (
                <TableHeaderTooltip
                  label="lending-collateral"
                  tooltipIcon={
                    <IconQuestion
                      width={16}
                      height={16}
                      data-tooltip-id={TOOLTIP_ID.LENDING_SUPPLY_MY_COLLATERAL}
                    />
                  }
                />
              ),
              value: <TableColumnCheck active={d.collateralFactorsMantissa !== 0n} />,
            },
          ],
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortedAssetsToSupply, t]
  );

  const mobileTableColumn = useMemo<ReactNode>(
    () => (
      <TableHeaderSortable
        sortKey="balance"
        label="My balance"
        sort={sort}
        setSort={setSort}
        tableKey="lending-supplies-my-balance"
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );

  useEffect(() => {
    if (!isMD) setSort({ key: 'balance', order: 'desc' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMD]);

  return {
    tableColumns,
    tableData,

    mobileTableData,
    mobileTableColumn,

    assetsToSupply,
  };
};
