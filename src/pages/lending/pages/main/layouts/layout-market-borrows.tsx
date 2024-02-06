import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { IconQuestion } from '~/assets/icons';

import { ButtonIconSmall } from '~/components/buttons';
import { Table } from '~/components/tables';
import { TableMobile } from '~/components/tables/table-mobile';
import { Tooltip } from '~/components/tooltips/base';

import { useTableAssetsToBorrow } from '~/pages/lending/hooks/table/use-table-assets-to-borrow';
import { useTableMyBorrows } from '~/pages/lending/hooks/table/use-table-my-borrows';

import { usePopup } from '~/hooks/components';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber } from '~/utils';
import { POPUP_ID, TOOLTIP_ID } from '~/types';

import { APYMedium } from '../components/apy';
import { Card } from '../components/card';
import { PopupApyType } from '../components/popup-apy-type';

export const LayoutMarketBorrows = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = evm?.address || fpass?.address;

  const balance = 24000;
  const apy = 0.001;
  const borrowPowerUsed = 0.6;

  const { opened: changeApyTypeOpened } = usePopup(POPUP_ID.LENDING_BORROW_CHANGE_APY_TYPE);

  const {
    tableColumns: tableColumnsMyBorrows,
    tableData: tableDataMyBorrows,
    mobileTableColumn: mobileTableColumnMyBorrows,
    mobileTableData: mobileTableDataMyBorrows,
    hasNextPage: hasNextPageMyBorrows,
    fetchNextPage: fetchNextPageMyBorrows,
  } = useTableMyBorrows();

  const {
    tableColumns: tableColumnsAssetsToBorrow,
    tableData: tableDataAssetsToBorrow,
    mobileTableColumn: mobileTableColumnAssetsToBorrow,
    mobileTableData: mobileTableDataAssetsToBorrow,
    hasNextPage: hasNextPageAssetsToBorrow,
    fetchNextPage: fetchNextPageAssetsToBorrow,
  } = useTableAssetsToBorrow();

  const { isMD } = useMediaQuery();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRowClick = (meta: any) => {
    if (!meta) return;

    const { asset } = meta;
    if (!asset) return;

    navigate(`/lending/${asset.address}`);
  };

  return (
    <Wrapper>
      {evmAddress && (
        <ContentWrapper>
          <Title>{t('My Borrows')}</Title>
          <CardWrapper>
            <Card
              title={t('lending-balance')}
              value={`$${formatNumber(balance, 4, 'round', 100000)}`}
              light
            />
            <Card
              title={t('lending-apy')}
              titleIcon={
                <ButtonIconSmall
                  icon={<IconQuestion />}
                  data-tooltip-id={TOOLTIP_ID.LENDING_BORROW_APY}
                />
              }
              value={<APYMedium apy={apy} />}
              light
            />
            <Card
              title={t('lending-borrow-power-used')}
              titleIcon={
                <ButtonIconSmall
                  icon={<IconQuestion />}
                  data-tooltip-id={TOOLTIP_ID.LENDING_BORROW_BORROW_POWER_USED}
                />
              }
              value={`${formatNumber(borrowPowerUsed, 4, 'round', 1000)}%`}
              light
            />
          </CardWrapper>

          {isMD ? (
            <Table
              data={tableDataMyBorrows}
              columns={tableColumnsMyBorrows}
              ratio={[1, 1, 1, 1, '94px']}
              type="lighter"
              emptyText={t('lending-my-borrows-empty')}
              hasMore={hasNextPageMyBorrows}
              handleRowClick={handleRowClick}
              handleMoreClick={() => fetchNextPageMyBorrows()}
            />
          ) : (
            <TableMobile
              data={mobileTableDataMyBorrows}
              columns={mobileTableColumnMyBorrows}
              emptyText={t('lending-my-borrows-empty')}
              hasMore={hasNextPageMyBorrows}
              handleMoreClick={fetchNextPageMyBorrows}
              handleClick={handleRowClick}
              overflow="visible"
            />
          )}
        </ContentWrapper>
      )}

      <ContentWrapper>
        <Title>{t('Assets to borrow')}</Title>
        {isMD ? (
          <Table
            data={tableDataAssetsToBorrow}
            columns={tableColumnsAssetsToBorrow}
            ratio={[1, 1, '317px', '94px']}
            type="lighter"
            emptyText={t('lending-assets-to-borrow-empty')}
            hasMore={hasNextPageAssetsToBorrow}
            handleRowClick={handleRowClick}
            handleMoreClick={() => fetchNextPageAssetsToBorrow()}
          />
        ) : (
          <TableMobile
            data={mobileTableDataAssetsToBorrow}
            columns={mobileTableColumnAssetsToBorrow}
            emptyText={t('lending-assets-to-borrow-empty')}
            hasMore={hasNextPageAssetsToBorrow}
            handleMoreClick={fetchNextPageAssetsToBorrow}
            handleClick={handleRowClick}
          />
        )}
      </ContentWrapper>

      <Tooltip id={TOOLTIP_ID.LENDING_BORROW_APY} place="bottom">
        <TooltipContent>{t('lending-borrow-apy-tooltip')}</TooltipContent>
      </Tooltip>

      <Tooltip id={TOOLTIP_ID.LENDING_BORROW_BORROW_POWER_USED} place="bottom">
        <TooltipContent>{t('lending-borrow-borrow-power-used-tooltip')}</TooltipContent>
      </Tooltip>

      <Tooltip id={TOOLTIP_ID.LENDING_BORROW_APY_TYPE} place="bottom">
        <TooltipContent>{t('lending-borrow-apy-type-tooltip')}</TooltipContent>
      </Tooltip>

      <Tooltip id={TOOLTIP_ID.LENDING_BORROW_AVAIABLE} place="bottom">
        <TooltipContent>{t('lending-borrow-available-tooltip')}</TooltipContent>
      </Tooltip>

      <Tooltip id={TOOLTIP_ID.LENDING_BORROW_APY_VARIABLE} place="bottom">
        <TooltipContent>{t('lending-borrow-apy-variable-tooltip')}</TooltipContent>
      </Tooltip>

      {changeApyTypeOpened && <PopupApyType />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24
`;
const ContentWrapper = tw.div`
  flex flex-col gap-24 rounded-12 bg-neutral-10
  pt-16 px-20 pb-20
  md:(px-24 pt-20 pb-24)
`;

const Title = tw.div`
  font-b-18 text-neutral-100
  md:(font-b-20)
`;

const CardWrapper = tw.div`
  flex gap-16 flex-col
  md:(flex-row)
`;

const TooltipContent = tw.div`
  w-266
`;
