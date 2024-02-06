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

import { useMediaQuery } from '~/hooks/utils';
import { useTableLendingAssetsToBorrowSortStore } from '~/states/components';
import { TOOLTIP_ID } from '~/types';

import { APYSmall } from '../../components/apy';

export const useTableAssetsToBorrow = () => {
  const { sort, setSort } = useTableLendingAssetsToBorrowSortStore();

  const { t } = useTranslation();
  const { isMD } = useMediaQuery();

  // TODO: call server
  const assetsToBorrowData = {
    pages: [
      {
        assetsToBorrow: [
          {
            id: 1,
            asset: {
              symbol: 'XRP',
              image: `${ASSET_URL}/tokens/token-xrp.png`,

              availables: 123123,
              price: 0.5,
              value: 123123 * 0.5,

              address: '0xCCCCcCCc00000002000000000000000000000000',
            },
            apy: 5.49,
          },
          {
            id: 2,
            asset: {
              symbol: 'USDC',
              image: `${ASSET_URL}/tokens/token-usdc.png`,

              availables: 2000,
              price: 0.99998,
              value: 2000 * 0.99998,

              address: '0xcCcCCCCc00000864000000000000000000000000',
            },
            apy: 0.00249,
          },
        ],
      },
    ],
  };

  const hasNextPage = false;
  const fetchNextPage = () => {};

  const assetsToBorrow = useMemo(
    () => assetsToBorrowData?.pages?.flatMap(page => page.assetsToBorrow) || [],
    [assetsToBorrowData?.pages]
  );

  const sortedAssetsToBorrow = useMemo(() => {
    if (sort?.key === 'available') {
      return assetsToBorrow.sort((a, b) => {
        if (sort.order === 'desc') {
          return b.asset.value - a.asset.value;
        }
        return a.asset.value - b.asset.value;
      });
    }
    if (sort?.key === 'apy') {
      return assetsToBorrow.sort((a, b) => {
        if (sort.order === 'desc') {
          return b.apy - a.apy;
        }
        return a.apy - b.apy;
      });
    }

    return assetsToBorrow;
  }, [assetsToBorrow, sort]);

  const tableData = useMemo(
    () =>
      sortedAssetsToBorrow?.map(d => {
        return {
          meta: { id: d.id, asset: d.asset },
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
                text={t('lending-borrow')}
                onClick={() => {}}
                style={{ width: '94px' }}
              />
            </TableColumnButtons>
          ),
        };
      }),
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
            label="lending-apy-variable"
            tableKey="lending-borrows-apy-variables"
            align="center"
            tooltipIcon={
              <ButtonIconSmall
                icon={<IconQuestion />}
                data-tooltip-id={TOOLTIP_ID.LENDING_BORROW_APY_VARIABLE}
              />
            }
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
      sortedAssetsToBorrow.map((d, i) => {
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
              <ButtonPrimaryMedium text={t('lending-borrow')} onClick={() => {}} />
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
