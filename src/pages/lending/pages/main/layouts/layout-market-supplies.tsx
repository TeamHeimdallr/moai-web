import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { IconQuestion } from '~/assets/icons';

import { ButtonIconSmall } from '~/components/buttons';
import { Table } from '~/components/tables';
import { TableMobile } from '~/components/tables/table-mobile';
import { Toggle } from '~/components/toggle';
import { Tooltip } from '~/components/tooltips/base';

import { useTableAssetsToSupply } from '~/pages/lending/hooks/table/use-table-assets-to-suppy';
import { useTableMySupplies } from '~/pages/lending/hooks/table/use-table-my-supplies';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber } from '~/utils';
import { useShowZeroBalanceAssetsStore } from '~/states/pages/lending';
import { POPUP_ID, TOOLTIP_ID } from '~/types';

import { APYMedium } from '../components/apy';
import { Card } from '../components/card';
import { PopupCollateral } from '../components/popup-collateral';

export const LayoutMarketSupplies = () => {
  const { t } = useTranslation();

  const { setShowZeroBalances, showZeroBalances } = useShowZeroBalanceAssetsStore();
  const { selectedNetwork } = useNetwork();
  const { currentAddress } = useConnectedWallet(selectedNetwork);
  const { opened: enableCollateralPopupOpened } = usePopup(
    POPUP_ID.LENDING_SUPPLY_ENABLE_COLLATERAL
  );
  const { opened: disableCollateralPopupOpened } = usePopup(
    POPUP_ID.LENDING_SUPPLY_DISABLE_COLLATERAL
  );

  const balance = 24000;
  const apy = 0.001;
  const collateral = 24000;

  const {
    tableColumns: tableColumnsMySupplies,
    tableData: tableDataMySupplies,
    mobileTableColumn: mobileTableColumnMySupplies,
    mobileTableData: mobileTableDataMySupplies,
    hasNextPage: hasNextPageMySupplies,
    fetchNextPage: fetchNextPageMySupplies,
  } = useTableMySupplies();

  const {
    tableColumns: tableColumnsAssetsToSupply,
    tableData: tableDataAssetsToSupply,
    mobileTableColumn: mobileTableColumnAssetsToSupply,
    mobileTableData: mobileTableDataAssetsToSupply,
    hasNextPage: hasNextPageAssetsToSupply,
    fetchNextPage: fetchNextPageAssetsToSupply,
  } = useTableAssetsToSupply();

  const { isMD } = useMediaQuery();

  return (
    <Wrapper>
      {currentAddress && (
        <ContentWrapper>
          <Title>{t('My Supplies')}</Title>
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
                  data-tooltip-id={TOOLTIP_ID.LENDING_SUPPLY_APY}
                />
              }
              value={<APYMedium apy={apy} />}
              light
            />
            <Card
              title={t('lending-collateral')}
              titleIcon={
                <ButtonIconSmall
                  icon={<IconQuestion />}
                  data-tooltip-id={TOOLTIP_ID.LENDING_SUPPLY_COLLATERAL}
                />
              }
              value={`$${formatNumber(collateral, 4, 'round', 100000)}`}
              light
            />
          </CardWrapper>

          {isMD ? (
            <Table
              data={tableDataMySupplies}
              columns={tableColumnsMySupplies}
              ratio={[1, 1, 1, 1, '94px']}
              type="lighter"
              emptyText={t('lending-my-supplies-empty')}
              hasMore={hasNextPageMySupplies}
              handleMoreClick={() => fetchNextPageMySupplies()}
            />
          ) : (
            <TableMobile
              data={mobileTableDataMySupplies}
              columns={mobileTableColumnMySupplies}
              emptyText={t('lending-my-supplies-empty')}
              hasMore={hasNextPageMySupplies}
              handleMoreClick={fetchNextPageMySupplies}
            />
          )}
        </ContentWrapper>
      )}

      <ContentWrapper>
        <TitleWrapper>
          <Title>{t('Assets to supply')}</Title>
          {currentAddress && (
            <ToggleWrapper>
              <ToggleLabel>{t('lending-show-zero-balance')}</ToggleLabel>
              <Toggle selected={showZeroBalances} onClick={setShowZeroBalances} />
            </ToggleWrapper>
          )}
        </TitleWrapper>
        {isMD ? (
          <Table
            data={tableDataAssetsToSupply}
            columns={tableColumnsAssetsToSupply}
            ratio={[1, 1, 1, 1, '94px']}
            type="lighter"
            emptyText={t('lending-assets-to-supply-empty')}
            hasMore={hasNextPageAssetsToSupply}
            handleMoreClick={() => fetchNextPageAssetsToSupply()}
          />
        ) : (
          <TableMobile
            data={mobileTableDataAssetsToSupply}
            columns={mobileTableColumnAssetsToSupply}
            emptyText={t('lending-assets-to-supply-empty')}
            hasMore={hasNextPageAssetsToSupply}
            handleMoreClick={fetchNextPageAssetsToSupply}
          />
        )}
      </ContentWrapper>

      <Tooltip id={TOOLTIP_ID.LENDING_SUPPLY_APY} place="bottom">
        <TooltipContent>{t('lending-supply-apy-tooltip')}</TooltipContent>
      </Tooltip>

      <Tooltip id={TOOLTIP_ID.LENDING_SUPPLY_COLLATERAL} place="bottom">
        <TooltipContent>{t('lending-supply-collateral-tooltip')}</TooltipContent>
      </Tooltip>

      <Tooltip id={TOOLTIP_ID.LENDING_SUPPLY_MY_COLLATERAL} place="bottom">
        <TooltipContent>{t('lending-my-supply-collateral-tooltip')}</TooltipContent>
      </Tooltip>

      {enableCollateralPopupOpened && <PopupCollateral type="enable" />}
      {disableCollateralPopupOpened && <PopupCollateral type="disable" />}
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

const TitleWrapper = tw.div`
  flex justify-between
  flex-col gap-4 items-start
  md:(flex-row gap-0 items-center)
`;

const Title = tw.div`
  font-b-18 text-neutral-100
  md:(font-b-20)
`;

const ToggleWrapper = tw.div`
  flex items-center gap-10
`;

const ToggleLabel = tw.div`
  font-m-14 text-neutral-80
  md:(font-m-16)
`;

const CardWrapper = tw.div`
  flex gap-16 flex-col
  md:(flex-row)
`;

const TooltipContent = tw.div`
  w-266
`;