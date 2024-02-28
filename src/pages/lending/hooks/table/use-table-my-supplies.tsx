import { ReactNode, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';

import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

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
import { useTableLendingMySuppliesSortStore } from '~/states/components';
import { POPUP_ID, TOOLTIP_ID } from '~/types';

import { APYSmall } from '../../components/apy';
import { mySuppliesData } from '../../data';

export const useTableMySupplies = () => {
  const navigate = useNavigate();

  const { sort, setSort } = useTableLendingMySuppliesSortStore();
  const { selectedNetwork } = useNetwork();
  const { t } = useTranslation();

  const { isMD } = useMediaQuery();

  const { open: openCollateralEnable } = usePopup(POPUP_ID.LENDING_SUPPLY_ENABLE_COLLATERAL);
  const { open: openCollateralDisable } = usePopup(POPUP_ID.LENDING_SUPPLY_DISABLE_COLLATERAL);

  const hasNextPage = false;
  const fetchNextPage = () => {};

  const { data: tokenData } = useGetTokensQuery({
    queries: {
      filter: `network:eq:${getNetworkAbbr(selectedNetwork)}`,
    },
  });

  const { tokens } = tokenData || {};

  const mySupplies = useMemo(
    () =>
      (mySuppliesData?.pages?.flatMap(page => page.mySupplies) || []).map(d => {
        const { price } = tokens?.find(b => b.symbol === d.asset.symbol) || {
          price: 0,
        };
        const value = (d.asset.balance || 0) * (price || 0);

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
          if (current) {
            openCollateralDisable({ params: { asset: d.asset } });
            return;
          }
          openCollateralEnable({ params: { asset: d.asset } });
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
          collateral: <TableColumnToggle selected={d.collateral} handleSelect={handleToggle} />,
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
              />
            </TableColumnButtons>
          ),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openCollateralDisable, openCollateralEnable, sortedMySupplies, t]
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
      sortedMySupplies.map((d, i) => {
        const handleToggle = (current: boolean) => {
          if (current) {
            openCollateralDisable({ params: { asset: d.asset } });
            return;
          }
          openCollateralEnable({ params: { asset: d.asset } });
        };

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
              value: <TableColumnToggle selected={d.collateral} handleSelect={handleToggle} />,
            },
          ],
        };
      }),
    [openCollateralDisable, openCollateralEnable, sortedMySupplies, t]
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
  };
};
