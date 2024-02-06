import { ReactNode, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';

import { IconQuestion } from '~/assets/icons';

import { ASSET_URL } from '~/constants';

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

import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { useTableLendingAssetsToSupplySortStore } from '~/states/components';
import { useShowZeroBalanceAssetsStore } from '~/states/pages/lending';
import { TOOLTIP_ID } from '~/types';

import { APYSmall } from '../../components/apy';

export const useTableAssetsToSupply = () => {
  const { sort, setSort } = useTableLendingAssetsToSupplySortStore();
  const { showZeroBalances } = useShowZeroBalanceAssetsStore();

  const { t } = useTranslation();

  const { isMD } = useMediaQuery();
  const { selectedNetwork } = useNetwork();
  const { currentAddress } = useConnectedWallet(selectedNetwork);

  // TODO: similar to my pools. get user balance, and call POST with user balances.
  const assetsToSupplyData = {
    pages: [
      {
        assetsToSupply: [
          {
            id: 1,
            asset: {
              symbol: 'XRP',
              image: `${ASSET_URL}/tokens/token-xrp.png`,

              balance: currentAddress ? 123123 : 0,
              price: 0.5,
              value: currentAddress ? 123123 * 0.5 : 0,

              address: '0xCCCCcCCc00000002000000000000000000000000',
            },
            apy: 5.49,
            collateral: true,
          },
          {
            id: 2,
            asset: {
              symbol: 'USDC',
              image: `${ASSET_URL}/tokens/token-usdc.png`,

              balance: currentAddress ? 2000 : 0,
              price: 0.99998,
              value: currentAddress ? 2000 * 0.99998 : 0,

              address: '0xcCcCCCCc00000864000000000000000000000000',
            },
            apy: 0.00249,
            collateral: false,
          },
          {
            id: 3,
            asset: {
              symbol: 'ASTO',
              image: `${ASSET_URL}/tokens/token-asto.png`,

              balance: 0,
              price: 0.037040386348962784,
              value: 0,

              address: '0xcCcCCccC00004464000000000000000000000000',
            },
            apy: 0.0081,
            collateral: false,
          },
        ].filter(d => (showZeroBalances || !currentAddress ? true : d.asset.balance > 0)),
      },
    ],
  };

  const hasNextPage = false;
  const fetchNextPage = () => {};

  const assetsToSupply = useMemo(
    () => assetsToSupplyData?.pages?.flatMap(page => page.assetsToSupply) || [],
    [assetsToSupplyData?.pages]
  );

  const sortedAssetsToSupply = useMemo(() => {
    if (sort?.key === 'balance') {
      return assetsToSupply.sort((a, b) => {
        if (sort.order === 'desc') {
          return b.asset.value - a.asset.value;
        }
        return a.asset.value - b.asset.value;
      });
    }
    if (sort?.key === 'apy') {
      return assetsToSupply.sort((a, b) => {
        if (sort.order === 'desc') {
          return b.apy - a.apy;
        }
        return a.apy - b.apy;
      });
    }

    return assetsToSupply;
  }, [assetsToSupply, sort]);

  const tableData = useMemo(
    () =>
      sortedAssetsToSupply?.map(d => {
        return {
          meta: { id: d.id, asset: d.asset },
          asset: (
            <TableColumnToken
              tokens={[{ symbol: d.asset.symbol, image: d.asset.image }]}
              disableSelectedToken
            />
          ),
          balance: (
            <TableColumnAmount
              balance={d.asset.balance}
              value={d.asset.value}
              align="center"
              empty={!currentAddress}
            />
          ),
          apy: <TableColumn value={<APYSmall apy={d.apy} />} align="center" />,
          collateral: <TableColumnCheck active={d.collateral} align="center" />,
          buttons: (
            <TableColumnButtons align="flex-end">
              <ButtonPrimaryMedium
                text={t('lending-supply')}
                onClick={() => {}}
                style={{ width: '94px' }}
              />
            </TableColumnButtons>
          ),
        };
      }),
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
      sortedAssetsToSupply.map((d, i) => {
        return {
          meta: { id: d.id, asset: d.asset },
          rows: [
            <TableColumnToken
              key={i}
              tokens={[{ symbol: d.asset.symbol, image: d.asset.image }]}
              disableSelectedToken
            />,
          ],
          bottomRows: [
            <TableColumnButtons key={i} style={{ width: '100%' }}>
              <ButtonPrimaryMedium text={t('lending-supply')} onClick={() => {}} />
              <ButtonPrimaryMedium
                text={t('lending-withdraw')}
                onClick={() => {}}
                buttonType="outlined"
              />
            </TableColumnButtons>,
          ],
          dataRows: [
            {
              label: 'lending-my-balance',
              value: <TableColumnAmount balance={d.asset.balance} value={d.asset.value} />,
            },
            {
              label: 'lending-apy',
              value: <TableColumn value={<APYSmall apy={d.apy} />} align="flex-end" />,
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
              value: <TableColumnCheck active={d.collateral} />,
            },
          ],
        };
      }),
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

    hasNextPage,
    fetchNextPage,
  };
};
