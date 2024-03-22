import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { IconQuestion } from '~/assets/icons';

import { MILLION } from '~/constants';

import { ButtonIconSmall } from '~/components/buttons';
import { Table } from '~/components/tables';
import { TableMobile } from '~/components/tables/table-mobile';
import { Toggle } from '~/components/toggle';
import { Tooltip } from '~/components/tooltips/base';

import { APYMedium } from '~/pages/lending/components/apy';
import { InfoCard } from '~/pages/lending/components/info-card';
import { useTableAssetsToSupply } from '~/pages/lending/hooks/table/use-table-assets-to-suppy';
import { useTableMySupplies } from '~/pages/lending/hooks/table/use-table-my-supplies';
import { useShowZeroBalanceAssetsStore } from '~/pages/lending/states';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber, getNetworkAbbr } from '~/utils';
import { POPUP_ID, TOOLTIP_ID } from '~/types';

import { PopupCollateral } from '../components/popup-collateral';

export const LayoutMarketSupplies = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { setShowZeroBalances, showZeroBalances } = useShowZeroBalanceAssetsStore();
  const { selectedNetwork } = useNetwork();
  const { currentAddress } = useConnectedWallet(selectedNetwork);
  const networkAbbr = getNetworkAbbr(selectedNetwork);

  const { opened: enableCollateralPopupOpened } = usePopup(
    POPUP_ID.LENDING_SUPPLY_ENABLE_COLLATERAL
  );
  const { opened: disableCollateralPopupOpened } = usePopup(
    POPUP_ID.LENDING_SUPPLY_DISABLE_COLLATERAL
  );

  const {
    balance,
    apy,
    collateral,
    tableColumns: tableColumnsMySupplies,
    tableData: tableDataMySupplies,
    mobileTableColumn: mobileTableColumnMySupplies,
    mobileTableData: mobileTableDataMySupplies,
    hasNextPage: hasNextPageMySupplies,
    fetchNextPage: fetchNextPageMySupplies,
    refetchGetAssetsIn,
  } = useTableMySupplies();

  const {
    tableColumns: tableColumnsAssetsToSupply,
    tableData: tableDataAssetsToSupply,
    mobileTableColumn: mobileTableColumnAssetsToSupply,
    mobileTableData: mobileTableDataAssetsToSupply,
  } = useTableAssetsToSupply();

  const { isMD } = useMediaQuery();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRowClick = (meta: any) => {
    if (!meta) return;

    const { address } = meta;
    if (!address) return;

    navigate(`/lending/${networkAbbr}/${address}`);
  };

  const handleSuccess = () => {
    refetchGetAssetsIn();
  };

  return (
    <Wrapper>
      {currentAddress && (
        <ContentWrapper>
          <Title>{t('My Supplies')}</Title>
          <CardWrapper>
            <InfoCard
              title={t('lending-balance')}
              value={`$${formatNumber(balance, 2, 'floor', MILLION, 2)}`}
              light
            />
            <InfoCard
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
            <InfoCard
              title={t('lending-collateral')}
              titleIcon={
                <ButtonIconSmall
                  icon={<IconQuestion />}
                  data-tooltip-id={TOOLTIP_ID.LENDING_SUPPLY_COLLATERAL}
                />
              }
              value={`$${formatNumber(collateral, 2, 'floor', MILLION, 2)}`}
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
              handleRowClick={handleRowClick}
              handleMoreClick={() => fetchNextPageMySupplies()}
            />
          ) : (
            <TableMobile
              data={mobileTableDataMySupplies}
              columns={mobileTableColumnMySupplies}
              type="lighter"
              emptyText={t('lending-my-supplies-empty')}
              hasMore={hasNextPageMySupplies}
              handleClick={handleRowClick}
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
            ratio={currentAddress ? [1, 1, 1, 1, '94px'] : [1, 1, 1, 1, '128px']}
            type="lighter"
            emptyText={t('lending-assets-to-supply-empty')}
            handleRowClick={handleRowClick}
          />
        ) : (
          <TableMobile
            data={mobileTableDataAssetsToSupply}
            columns={mobileTableColumnAssetsToSupply}
            type="lighter"
            emptyText={t('lending-assets-to-supply-empty')}
            handleClick={handleRowClick}
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

      {enableCollateralPopupOpened && (
        <PopupCollateral type="enable" handleSuccess={handleSuccess} />
      )}
      {disableCollateralPopupOpened && (
        <PopupCollateral type="disable" handleSuccess={handleSuccess} />
      )}
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
