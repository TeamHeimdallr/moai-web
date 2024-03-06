import { ReactNode, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { formatUnits } from 'viem';

import { useGetAllMarkets } from '~/api/api-contract/lending/get-all-markets';
import { useUserAccountSnapshotAll } from '~/api/api-contract/lending/user-account-snapshot-all';

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
import { calcHealthFactor } from '~/utils/util-lending';
import { useTableLendingMyBorrowsSortStore } from '~/states/components';

import { APYSmall } from '../../components/apy';

export const useTableMyBorrows = () => {
  const navigate = useNavigate();

  const { sort, setSort } = useTableLendingMyBorrowsSortStore();
  const { selectedNetwork } = useNetwork();
  const { t } = useTranslation();

  const { isMD } = useMediaQuery();

  const { accountSnapshots } = useUserAccountSnapshotAll();
  const { markets } = useGetAllMarkets();

  const hf = calcHealthFactor({
    markets,
    snapshots: accountSnapshots,
  });
  const isInLiquidation = hf <= 1.0;

  // TODO: pagenation logic 은 추후 Market 이 많아지면 추가
  const hasNextPage = false;
  const fetchNextPage = () => {};

  const myBorrows = useMemo(
    () =>
      accountSnapshots
        .map(d => {
          const makrketIndex = markets.findIndex(m => m.address === d.mTokenAddress);
          const market = makrketIndex === -1 ? undefined : markets[makrketIndex];
          const debt = Number(formatUnits(d.borrowBalance, market?.underlyingDecimals || 18));
          const price = market?.price;
          const debtValue = debt * (price || 0);

          return {
            id: makrketIndex,
            address: d.mTokenAddress,
            asset: {
              symbol: market?.underlyingSymbol || '',
              image: market?.underlyingImage || '',
              address: market?.underlyingAsset || '',
              debt,
              value: debtValue,
            },
            apy: market?.borrowApy || 0,
          };
        })
        .filter(d => d.asset.debt > 0),
    [accountSnapshots, markets]
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
          return b.apy - a.apy;
        }
        return a.apy - b.apy;
      });
    }

    return myBorrows;
  }, [myBorrows, sort]);

  const handleLendingBorrow = (address: string) => {
    const link = `/lending/${getNetworkAbbr(selectedNetwork)}/${address}/borrow`;
    navigate(link);
  };

  const handleLendingRepay = (address: string) => {
    const link = `/lending/${getNetworkAbbr(selectedNetwork)}/${address}/repay`;
    navigate(link);
  };

  const tableData = useMemo(
    () =>
      sortedMyBorrows?.map(d => {
        return {
          meta: { id: d.id, asset: d.asset, address: d.address },
          asset: (
            <TableColumnToken
              tokens={[{ symbol: d.asset.symbol, image: d.asset.image }]}
              disableSelectedToken
            />
          ),
          debt: <TableColumnAmount balance={d.asset.debt} value={d.asset.value} align="center" />,
          apy: <TableColumn value={<APYSmall apy={d.apy} />} align="center" />,
          buttons: (
            <TableColumnButtons align="center">
              <ButtonPrimaryMedium
                text={t('lending-borrow')}
                onClick={e => {
                  e.stopPropagation();
                  handleLendingBorrow(d.address);
                }}
                disabled={isInLiquidation}
              />
              <ButtonPrimaryMedium
                text={t('lending-repay')}
                onClick={e => {
                  e.stopPropagation();
                  handleLendingRepay(d.address);
                }}
                buttonType="outlined"
              />
            </TableColumnButtons>
          ),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                text={t('lending-borrow')}
                onClick={e => {
                  e.stopPropagation();
                  handleLendingBorrow(d.address);
                }}
                disabled={isInLiquidation}
              />
              <ButtonPrimaryMedium
                text={t('lending-repay')}
                onClick={e => {
                  e.stopPropagation();
                  handleLendingRepay(d.address);
                }}
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
              value: <TableColumn value={<APYSmall apy={d.apy} />} align="flex-end" />,
            },
          ],
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
