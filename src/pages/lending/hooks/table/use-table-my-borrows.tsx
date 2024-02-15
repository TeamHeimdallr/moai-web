import { ReactNode, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';

import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

import { ButtonPrimaryMedium } from '~/components/buttons';
import {
  TableColumn,
  TableColumnAmount,
  TableColumnToken,
  TableHeader,
  TableHeaderSortable,
} from '~/components/tables';
import { TableColumnButtons } from '~/components/tables/columns/column-buttons';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { getNetworkAbbr } from '~/utils';
import { useTableLendingMyBorrowsSortStore } from '~/states/components';

import { APYSmall } from '../../components/apy';
import { myBorrowsData } from '../../data';

export const useTableMyBorrows = () => {
  const { sort, setSort } = useTableLendingMyBorrowsSortStore();
  const { selectedNetwork } = useNetwork();
  const { t } = useTranslation();

  const { isMD } = useMediaQuery();

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
    [tokens]
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
      sortedMyBorrows?.map(d => {
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
