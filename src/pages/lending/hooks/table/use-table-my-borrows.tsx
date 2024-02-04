import { ReactNode, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';

import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

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
import { TableColumnDropdownLendingApyType } from '~/components/tables/columns/column-dropdown-lending-apy-type';
import { TableHeaderTooltip } from '~/components/tables/headers/header-normal';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { getNetworkAbbr } from '~/utils';
import { useTableLendingMyBorrowsSortStore } from '~/states/components';
import { TOOLTIP_ID } from '~/types';

import { APYSmall } from '../../pages/main/components/apy';

export const useTableMyBorrows = () => {
  const { sort, setSort } = useTableLendingMyBorrowsSortStore();
  const { selectedNetwork } = useNetwork();
  const { t } = useTranslation();

  const { isMD } = useMediaQuery();

  // call contract
  const myBorrowsData = {
    pages: [
      {
        myBorrows: [
          {
            id: 1,
            asset: {
              symbol: 'XRP',
              address: '123',
              image: `${ASSET_URL}/tokens/token-xrp.png`,
              debt: 5201.102,
            },
            apy: [
              { apy: 5.49, apyType: 'variable' },
              { apy: 1.49, apyType: 'stable' },
            ],
            currentApy: { apy: 5.49, apyType: 'variable' },
          },
          {
            id: 2,
            asset: {
              symbol: 'USDC',
              address: '234',
              image: `${ASSET_URL}/tokens/token-usdc.png`,
              debt: 239005.102,
            },
            apy: [
              { apy: 0.00249, apyType: 'variable' },
              { apy: 0.00122, apyType: 'stable' },
            ],
            currentApy: { apy: 0.00122, apyType: 'stable' },
            collateral: false,
          },
        ],
      },
    ],
  };

  const hasNextPage = false;
  const fetchNextPage = () => {};

  const { data: tokenData } = useGetTokensQuery({
    queries: {
      filter: `network:eq:${getNetworkAbbr(selectedNetwork)}`,
    },
  });

  const { tokens } = tokenData || {};

  const myBorrows = useMemo(
    () =>
      (myBorrowsData?.pages?.flatMap(page => page.myBorrows) || []).map(d => {
        const { price } = tokens?.find(b => b.symbol === d.asset.symbol) || {
          price: 0,
        };
        const value = (d.asset.debt || 0) * (price || 0);

        return {
          ...d,
          asset: {
            ...d.asset,
            value,
          },
        };
      }),
    [myBorrowsData?.pages, tokens]
  );
  const sortedMyBorrows = useMemo(() => {
    if (sort?.key === 'debt') {
      return myBorrows.sort((a, b) => {
        if (sort.order === 'desc') {
          return b.asset.value - a.asset.value;
        }
        return a.asset.value - b.asset.value;
      });
    }
    if (sort?.key === 'apy') {
      return myBorrows.sort((a, b) => {
        if (sort.order === 'desc') {
          return b.currentApy.apy - a.currentApy.apy;
        }
        return a.currentApy.apy - b.currentApy.apy;
      });
    }

    return myBorrows;
  }, [myBorrows, sort]);

  const tableData = useMemo(
    () =>
      sortedMyBorrows?.map((d, i) => {
        const handleApyTypeSelect = (address: string, apyType: string) => {
          // TODO: call contract
          console.log(address, apyType);
        };

        return {
          meta: { id: d.id, asset: d.asset },
          asset: (
            <TableColumnToken
              tokens={[{ symbol: d.asset.symbol, image: d.asset.image }]}
              disableSelectedToken
            />
          ),
          debt: <TableColumnAmount balance={d.asset.debt} value={d.asset.value} align="center" />,
          apy: <TableColumn value={<APYSmall apy={d.currentApy.apy} />} align="center" />,
          apyType: (
            <TableColumnDropdownLendingApyType
              address={d.asset.address}
              type={d.currentApy}
              types={d.apy}
              handleClick={handleApyTypeSelect}
              style={{ zIndex: 20 + (sortedMyBorrows.length - i) }}
            />
          ),
          buttons: (
            <TableColumnButtons align="center">
              <ButtonPrimaryMedium text={t('lending-borrow')} onClick={() => {}} />
              <ButtonPrimaryMedium
                text={t('lending-repay')}
                onClick={() => {}}
                buttonType="outlined"
              />
            </TableColumnButtons>
          ),
        };
      }),
    [sortedMyBorrows, t]
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
            sortKey="debt"
            sort={sort}
            setSort={setSort}
            label="lending-my-debt"
            tableKey="lending-borrows-my-debt"
            align="center"
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'debt',
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
        header: () => (
          <TableHeaderTooltip
            label="lending-apy-type"
            tooltipIcon={
              <ButtonIconSmall
                icon={<IconQuestion />}
                data-tooltip-id={TOOLTIP_ID.LENDING_BORROW_APY_TYPE}
              />
            }
          />
        ),
        cell: row => row.renderValue(),
        accessorKey: 'apyType',
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
      sortedMyBorrows.map((d, i) => {
        const handleApyTypeSelect = (address: string, apyType: string) => {
          // TODO: call contract
          console.log(address, apyType);
        };

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
              <ButtonPrimaryMedium text={t('lending-borrow')} onClick={() => {}} />
              <ButtonPrimaryMedium
                text={t('lending-repay')}
                onClick={() => {}}
                buttonType="outlined"
              />
            </TableColumnButtons>,
          ],
          dataRows: [
            {
              label: 'lending-my-debt',
              value: <TableColumnAmount balance={d.asset.debt} value={d.asset.value} />,
            },
            {
              label: 'lending-apy',
              value: <TableColumn value={<APYSmall apy={d.currentApy.apy} />} align="flex-end" />,
            },
            {
              label: (
                <TableHeaderTooltip
                  label="lending-apy-type"
                  tooltipIcon={
                    <IconQuestion
                      width={16}
                      height={16}
                      data-tooltip-id={TOOLTIP_ID.LENDING_BORROW_APY_TYPE}
                    />
                  }
                />
              ),
              value: (
                <TableColumnDropdownLendingApyType
                  address={d.asset.address}
                  type={d.currentApy}
                  types={d.apy}
                  handleClick={handleApyTypeSelect}
                  style={{ zIndex: 20 + (sortedMyBorrows.length - i) }}
                />
              ),
            },
          ],
        };
      }),
    [sortedMyBorrows, t]
  );

  const mobileTableColumn = useMemo<ReactNode>(
    () => (
      <TableHeaderSortable
        sortKey="debt"
        label="lending-my-debt"
        sort={sort}
        setSort={setSort}
        tableKey="lending-borrows-my-debt"
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );

  useEffect(() => {
    if (!isMD) setSort({ key: 'debt', order: 'desc' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMD]);

  return {
    tableColumns,
    tableData,

    mobileTableData,
    mobileTableColumn,

    myBorrows,
    sortedMyBorrows,

    hasNextPage,
    fetchNextPage,
  };
};
