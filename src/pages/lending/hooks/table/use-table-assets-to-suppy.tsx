import { ReactNode, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';

import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';

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

import { useMediaQuery } from '~/hooks/utils';
import { useTableLendingAssetsToSupplySortStore } from '~/states/components';
import { TOOLTIP_ID } from '~/types';

import { APYSmall } from '../../pages/main/components/apy';

export const useTableAssetsToSupply = () => {
  const { sort, setSort } = useTableLendingAssetsToSupplySortStore();
  const { t } = useTranslation();

  const { isMD } = useMediaQuery();

  const { userAllTokenBalances } = useUserAllTokenBalances();

  const assetsToSupplyData = {
    pages: [
      {
        assetsToSupply: [
          {
            id: 1,
            asset: {
              symbol: 'XRP',
              image: `${ASSET_URL}/tokens/token-xrp.png`,
            },
            apy: 5.49,
            collateral: true,
          },
          {
            id: 2,
            asset: {
              symbol: 'USDC',
              image: `${ASSET_URL}/tokens/token-usdc.png`,
            },
            apy: 0.00249,
            collateral: false,
          },
        ],
      },
    ],
  };

  const hasNextPage = false;
  const fetchNextPage = () => {};

  const assetsToSupply = useMemo(
    () =>
      (assetsToSupplyData?.pages?.flatMap(page => page.assetsToSupply) || []).map(d => {
        const { balance, price } = userAllTokenBalances?.find(b => b.symbol === d.asset.symbol) || {
          balance: 0,
          price: 0,
        };
        const value = balance * (price || 0);

        return {
          ...d,
          asset: {
            ...d.asset,
            balance,
            value,
          },
        };
      }),
    [assetsToSupplyData?.pages, userAllTokenBalances]
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
            <TableColumnAmount balance={d.asset.balance} value={d.asset.value} align="flex-end" />
          ),
          apy: <TableColumn value={<APYSmall apy={d.apy} />} align="flex-end" />,
          collateral: <TableColumnCheck active={d.collateral} />,
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
    [sortedAssetsToSupply, t]
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
