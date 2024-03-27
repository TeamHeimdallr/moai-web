import { ReactNode, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { formatUnits } from 'viem';

import { useGetAllMarkets } from '~/api/api-contract/lending/get-all-markets';
import { useGetAssetsIn } from '~/api/api-contract/lending/get-markets-in';
import { useUserAccountSnapshotAll } from '~/api/api-contract/lending/user-account-snapshot-all';

import { IconQuestion } from '~/assets/icons';

import { ButtonIconSmall, ButtonPrimaryMedium } from '~/components/buttons';
import {
  TableColumn,
  TableColumnAmount,
  TableColumnToggle,
  TableColumnToken,
  TableHeader,
  TableHeaderSortable,
} from '~/components/tables';
import { TableColumnButtons } from '~/components/tables/columns/column-buttons';
import { TableHeaderTooltip } from '~/components/tables/headers/header-normal';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { getNetworkAbbr } from '~/utils';
import { calcHealthFactor } from '~/utils/util-lending';
import { useTableLendingMySuppliesSortStore } from '~/states/components';
import { POPUP_ID, TOOLTIP_ID } from '~/types';

import { APYSmall } from '../../components/apy';

export const useTableMySupplies = () => {
  const navigate = useNavigate();

  const { sort, setSort } = useTableLendingMySuppliesSortStore();
  const { selectedNetwork } = useNetwork();
  const { t } = useTranslation();

  const { isMD } = useMediaQuery();

  const { open: openCollateralEnable } = usePopup(POPUP_ID.LENDING_SUPPLY_ENABLE_COLLATERAL);
  const { open: openCollateralDisable } = usePopup(POPUP_ID.LENDING_SUPPLY_DISABLE_COLLATERAL);

  const { accountSnapshots } = useUserAccountSnapshotAll();
  const { markets } = useGetAllMarkets();
  const { enteredMarkets, refetch: refetchGetAssetsIn } = useGetAssetsIn();

  const hf = calcHealthFactor({
    markets,
    snapshots: accountSnapshots,
  });
  const isInLiquidation = hf <= 1.0;

  // TODO: pagenation logic 은 추후 Market 이 많아지면 추가
  const hasNextPage = false;
  const fetchNextPage = () => {};

  const mySupplies = useMemo(
    () =>
      accountSnapshots
        ?.map(d => {
          const marketIndex = markets?.findIndex(m => m.address === d.mTokenAddress) || -1;
          const market = marketIndex === -1 ? undefined : markets?.[marketIndex];
          const price = market?.price || 0;
          const underlyingBalance = Number(
            formatUnits(
              (d.exchangeRate || 0n) * (d.mTokenBalance || 0n),
              16 + (market?.decimals || 18)
            )
          );
          const value = underlyingBalance * (price || 0);
          const isCollateralEnabled = enteredMarkets?.includes(d.mTokenAddress) || false;
          const isCollateral = (market?.collateralFactorsMantissa || 0n) > 0n;

          return {
            id: marketIndex,
            address: d?.mTokenAddress || '0x0',
            asset: {
              symbol: market?.underlyingSymbol || '',
              image: market?.underlyingImage || '',
              balance: underlyingBalance,
              value,
            },
            apy: market?.supplyApy || 0,
            collateral: isCollateralEnabled,
            isCollateral,
          };
        })
        ?.filter(d => (d?.asset?.balance || 0) > 0) || [],
    [accountSnapshots, enteredMarkets, markets]
  );

  const sortedMySupplies = useMemo(() => {
    if (sort?.key === 'balance') {
      return mySupplies.sort((a, b) => {
        if (sort.order === 'desc') {
          return b.asset.value - a.asset.value;
        }
        return a.asset.value - b.asset.value;
      });
    }
    if (sort?.key === 'apy') {
      return mySupplies.sort((a, b) => {
        if (sort.order === 'desc') {
          return b.apy - a.apy;
        }
        return a.apy - b.apy;
      });
    }

    return mySupplies;
  }, [mySupplies, sort]);

  const handleLendingSupply = (address: string) => {
    const link = `/lending/${getNetworkAbbr(selectedNetwork)}/${address}/supply`;
    navigate(link);
  };

  const handleLendingWithdraw = (address: string) => {
    const link = `/lending/${getNetworkAbbr(selectedNetwork)}/${address}/withdraw`;
    navigate(link);
  };

  const tableData = useMemo(
    () =>
      sortedMySupplies?.map(d => {
        const handleToggle = (current: boolean) => {
          if (!d.isCollateral) return;

          if (current) {
            openCollateralDisable({ params: { asset: d.asset, address: d.address } });
            return;
          }
          openCollateralEnable({ params: { asset: d.asset, address: d.address } });
        };

        return {
          meta: { id: d.id, asset: d.asset, address: d.address },
          asset: (
            <TableColumnToken
              tokens={[{ symbol: d.asset.symbol, image: d.asset.image }]}
              disableSelectedToken
            />
          ),
          balance: (
            <TableColumnAmount balance={d.asset.balance} value={d.asset.value} align="center" />
          ),
          apy: <TableColumn value={<APYSmall apy={d.apy} />} align="center" />,
          collateral: (
            <TableColumnToggle
              selected={d.collateral}
              handleSelect={handleToggle}
              disabled={!d.isCollateral || isInLiquidation}
            />
          ),
          buttons: (
            <TableColumnButtons>
              <ButtonPrimaryMedium
                text={t('lending-supply')}
                onClick={e => {
                  e.stopPropagation();
                  handleLendingSupply(d.address);
                }}
              />
              <ButtonPrimaryMedium
                text={t('lending-withdraw')}
                onClick={e => {
                  e.stopPropagation();
                  handleLendingWithdraw(d.address);
                }}
                buttonType="outlined"
                disabled={isInLiquidation}
              />
            </TableColumnButtons>
          ),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortedMySupplies, t]
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
            label="lending-my-balance"
            tableKey="lending-supplies-my-balance"
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
            tableKey="lending-supplies-my-apy"
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
      sortedMySupplies?.map((d, i) => {
        const handleToggle = (current: boolean) => {
          if (current) {
            openCollateralDisable({ params: { asset: d.asset, address: d.address } });
            return;
          }
          openCollateralEnable({ params: { asset: d.asset, address: d.address } });
        };

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
                text={t('lending-supply')}
                onClick={e => {
                  e.stopPropagation();
                  handleLendingSupply(d.address);
                }}
              />
              <ButtonPrimaryMedium
                text={t('lending-withdraw')}
                onClick={e => {
                  e.stopPropagation();
                  handleLendingWithdraw(d.address);
                }}
                buttonType="outlined"
                disabled={isInLiquidation}
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
              value: (
                <TableColumnToggle
                  selected={d.collateral}
                  handleSelect={handleToggle}
                  disabled={!d.isCollateral || isInLiquidation}
                />
              ),
            },
          ],
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortedMySupplies, t]
  );

  const mobileTableColumn = useMemo<ReactNode>(
    () => (
      <TableHeaderSortable
        sortKey="balance"
        label="lending-my-balance"
        sort={sort}
        setSort={setSort}
        tableKey="lending-supplies-my-balance"
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort]
  );

  const balance = mySupplies?.map(d => d.asset.value).reduce((acc, cur) => acc + cur, 0) || 0;
  const apySum =
    mySupplies?.map(d => d.asset.value * d.apy).reduce((acc, cur) => acc + cur, 0) || 0;
  const apy = balance === 0 ? 0 : apySum / balance;
  const collateral =
    mySupplies
      ?.map(d => {
        if (!d.isCollateral) return 0;
        return d.collateral ? d.asset.value : 0;
      })
      ?.reduce((acc, cur) => acc + cur, 0) || 0;

  useEffect(() => {
    if (!isMD) setSort({ key: 'balance', order: 'desc' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMD]);

  return {
    tableColumns,
    tableData,

    mobileTableData,
    mobileTableColumn,

    mySupplies,
    sortedMySupplies,

    hasNextPage,
    fetchNextPage,

    refetchGetAssetsIn,

    balance,
    apy,
    collateral,
  };
};
