import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconCheck, IconQuestion } from '~/assets/icons';

import { THOUSAND } from '~/constants';

import { ButtonIconSmall } from '~/components/buttons';
import { Tooltip } from '~/components/tooltips/base';

import { APYMedium } from '~/pages/lending/components/apy';
import { InfoCard } from '~/pages/lending/components/info-card';

import { formatNumber } from '~/utils';
import { TOOLTIP_ID } from '~/types';

import { AssetSupplyBorrowInfoCard } from './asset-supply-borrow-info-card';
import { AssetSupplyInfoChart } from './asset-supply-info-chart';

export const AssetSupplyInfo = () => {
  const { t } = useTranslation();

  // TODO: connect api
  const totalSupply = 2000000000;
  const currentSupply = 739845000;
  const ratio = (currentSupply / totalSupply) * 100;

  const apy = 0.0239;
  const collateral = true;

  const maxLTV = 70;
  const liquidationThreshold = 75;
  const liquidationPenalty = 12.123;

  return (
    <OuterWrapper>
      <Wrapper>
        <HeaderTitle>{t('Supply info')}</HeaderTitle>

        <InfoWrapper>
          <AssetSupplyBorrowInfoCard
            title={t('Total supplied')}
            titleIcon={
              <ButtonIconSmall
                icon={<IconQuestion />}
                data-tooltip-id={TOOLTIP_ID.LENDING_DETAIL_TOTAL_SUPPLIED}
              />
            }
            value={
              <>
                <InfoText>{formatNumber(currentSupply, 2, 'floor', THOUSAND, 2)}</InfoText>
                <InfoTextSmall>of</InfoTextSmall>
                <InfoText>{formatNumber(totalSupply, 2, 'floor', THOUSAND, 2)}</InfoText>
              </>
            }
            barChart
            barChartValue={ratio}
            barChartLabel={`${formatNumber(ratio, 2, 'floor', THOUSAND, 2)}%`}
          />
          <AssetSupplyBorrowInfoCard
            title={t('APY')}
            value={<APYMedium apy={apy} style={{ justifyContent: 'flex-start' }} />}
          />
        </InfoWrapper>

        <ChartWrapper>
          <AssetSupplyInfoChart />
        </ChartWrapper>

        <CollateralWrapper>
          <ContentTitle>
            {t('Collateral usage')}
            <ContentTitleCaptionWrapper collateral={collateral}>
              {collateral ? <IconCheck /> : <IconCancel />}
              {collateral ? t('Can be collateral') : t('Can not be collateral')}
            </ContentTitleCaptionWrapper>
          </ContentTitle>
          <CollateralCards>
            <InfoCard
              title={t('Max LTV')}
              titleIcon={
                <ButtonIconSmall
                  icon={<IconQuestion />}
                  data-tooltip-id={TOOLTIP_ID.LENDING_DETAIL_MAX_LTV}
                />
              }
              value={`${formatNumber(maxLTV, 2, 'floor', THOUSAND, 2)}%`}
              light
            />
            <InfoCard
              title={t('Liquidation threshold')}
              titleIcon={
                <ButtonIconSmall
                  icon={<IconQuestion />}
                  data-tooltip-id={TOOLTIP_ID.LENDING_DETAIL_LIQUIDATION_THRESHOLD}
                />
              }
              value={`${formatNumber(liquidationThreshold, 2, 'floor', THOUSAND, 2)}%`}
              light
            />
            <InfoCard
              title={t('Liquidation penalty')}
              titleIcon={
                <ButtonIconSmall
                  icon={<IconQuestion />}
                  data-tooltip-id={TOOLTIP_ID.LENDING_DETAIL_LIQUIDATION_PENALTY}
                />
              }
              value={`${formatNumber(liquidationPenalty, 2, 'floor', THOUSAND, 2)}%`}
              light
            />
          </CollateralCards>
        </CollateralWrapper>
      </Wrapper>

      <Tooltip id={TOOLTIP_ID.LENDING_DETAIL_TOTAL_SUPPLIED} place="bottom">
        <TooltipContent>{t('total-supplied-description')}</TooltipContent>
      </Tooltip>
      <Tooltip id={TOOLTIP_ID.LENDING_DETAIL_MAX_LTV} place="bottom">
        <TooltipContent>{t('max-ltv-description')}</TooltipContent>
      </Tooltip>
      <Tooltip id={TOOLTIP_ID.LENDING_DETAIL_LIQUIDATION_THRESHOLD} place="bottom">
        <TooltipContent>{t('liquidity-threshold-description')}</TooltipContent>
      </Tooltip>
      <Tooltip id={TOOLTIP_ID.LENDING_DETAIL_LIQUIDATION_PENALTY} place="bottom">
        <TooltipContent>{t('liquidity-penalty-description')}</TooltipContent>
      </Tooltip>
    </OuterWrapper>
  );
};

const OuterWrapper = tw.div``;

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 rounded-12 px-24 pt-20 pb-24 min-h-808 gap-32
`;

const HeaderTitle = tw.div`
  font-b-18 text-neutral-100
  md:(font-b-20)
`;

const ContentTitle = tw.div`
  flex items-center text-primary-80 font-b-14 gap-16
  md:(font-b-16)
`;

interface ContentTitleCaptionWrapperProps {
  collateral?: boolean;
}
const ContentTitleCaptionWrapper = styled.div<ContentTitleCaptionWrapperProps>(({ collateral }) => [
  tw`
    flex items-center gap-4 font-m-14
    md:(font-m-16)
  `,
  collateral ? tw`text-green-50` : tw`text-orange-50`,
  collateral
    ? css`
        & svg {
          fill: ${COLOR.GREEN[50]};
        }
      `
    : css`
        & svg {
          fill: ${COLOR.ORANGE[50]};
        }
      `,
]);

const InfoWrapper = tw.div`
  w-full grid grid-cols-2 gap-16
  md:(grid-cols-3)
`;

const InfoText = tw.div`
  font-m-16
  md:(font-m-18)
`;
const InfoTextSmall = tw.div`
  font-r-14
  md:(font-r-16)
`;

const ChartWrapper = tw.div``;

const CollateralWrapper = tw.div`
  flex flex-col gap-16
`;

const CollateralCards = tw.div`
  flex gap-16 flex-col
  md:(grid grid-cols-3 gap-16)
`;

const TooltipContent = tw.div`
  w-266
`;
