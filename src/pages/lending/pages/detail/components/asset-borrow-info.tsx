import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { IconLink, IconQuestion } from '~/assets/icons';

import { SCANNER_URL, THOUSAND } from '~/constants';

import { ButtonIconMedium, ButtonIconSmall } from '~/components/buttons';
import { Tooltip } from '~/components/tooltips/base';

import { APYMedium } from '~/pages/lending/components/apy';
import { InfoCard } from '~/pages/lending/components/info-card';

import { useNetwork } from '~/hooks/contexts/use-network';
import { formatNumber } from '~/utils';
import { IToken, NETWORK, TOOLTIP_ID } from '~/types';

import { AssetBorrowInfoChart } from './asset-borrow-info-chart';
import { AssetSupplyBorrowInfoCard } from './asset-supply-borrow-info-card';

interface Props {
  token?: IToken;
}
export const AssetBorrowInfo = ({ token }: Props) => {
  const { t } = useTranslation();
  const { selectedNetwork } = useNetwork();
  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;

  // TODO: connect api
  const totalBorrow = 2000000000;
  const currentBorrow = 739845000;
  const ratio = (currentBorrow / totalBorrow) * 100;

  const apyType: string = 'variable'; // 'stable' | 'variable';
  const apy = 2.239;
  const borrowCap = 1410000;
  const { price } = token || {};

  const reserveFactor = 15;
  const collectorContract = '0x48DBa2D1b6C89Bf8234C2B63554369aDC7Ae3258';

  const handleLinkToContract = () => {
    if (isRoot)
      return window.open(`${SCANNER_URL[selectedNetwork]}/addresses/${collectorContract}`);
    window.open(`${SCANNER_URL[selectedNetwork]}/address/${collectorContract}`);
  };

  return (
    <OuterWrapper>
      <Wrapper>
        <HeaderTitle>{t('Borrow info')}</HeaderTitle>

        <InfoWrapper>
          <AssetSupplyBorrowInfoCard
            title={t('Total borrowed')}
            titleIcon={
              <ButtonIconSmall
                icon={<IconQuestion />}
                data-tooltip-id={TOOLTIP_ID.LENDING_DETAIL_TOTAL_BORROWED}
              />
            }
            value={
              <>
                <InfoText>{formatNumber(currentBorrow, 2, 'floor', THOUSAND, 2)}</InfoText>
                <InfoTextSmall>of</InfoTextSmall>
                <InfoText>{formatNumber(totalBorrow, 2, 'floor', THOUSAND, 2)}</InfoText>
              </>
            }
            barChart
            barChartValue={ratio}
            barChartLabel={`${formatNumber(ratio, 2, 'floor', THOUSAND, 2)}%`}
          />
          <AssetSupplyBorrowInfoCard
            title={`${t('APY')}, ${t(`${apyType}-small`)}`}
            titleIcon={
              <ButtonIconSmall
                icon={<IconQuestion />}
                data-tooltip-id={
                  apyType === 'variable'
                    ? TOOLTIP_ID.LENDING_DETAIL_BORROW_APY_VARIABLE
                    : TOOLTIP_ID.LENDING_DETAIL_BORROW_APY_STABLE
                }
              />
            }
            value={<APYMedium apy={apy} style={{ justifyContent: 'flex-start' }} />}
          />
          <AssetSupplyBorrowInfoCard
            title={t('Borrow cap')}
            value={formatNumber(borrowCap, 2, 'floor', THOUSAND, 2)}
            caption={`$${formatNumber(borrowCap * (price || 0), 2, 'floor', THOUSAND, 2)}`}
          />
        </InfoWrapper>

        <ChartWrapper>
          <AssetBorrowInfoChart apyType={apyType} />
        </ChartWrapper>

        <CollectorWrapper>
          <ContentTitle>{t('Collector info')}</ContentTitle>
          <CollectorCards>
            <InfoCard
              title={t('Reserve factor')}
              titleIcon={
                <ButtonIconSmall
                  icon={<IconQuestion />}
                  data-tooltip-id={TOOLTIP_ID.LENDING_DETAIL_BORROW_RESERVE_FACTOR}
                />
              }
              value={`${formatNumber(reserveFactor, 2, 'floor', THOUSAND, 2)}%`}
              light
            />
            <InfoCard
              title={t('Collector contract')}
              value={t('View contract')}
              valueIcon={<ButtonIconMedium icon={<IconLink />} onClick={handleLinkToContract} />}
              light
            />
          </CollectorCards>
        </CollectorWrapper>
      </Wrapper>

      <Tooltip id={TOOLTIP_ID.LENDING_DETAIL_TOTAL_BORROWED} place="bottom">
        <TooltipContent>{t('total-borrowed-description')}</TooltipContent>
      </Tooltip>
      <Tooltip id={TOOLTIP_ID.LENDING_DETAIL_BORROW_APY_VARIABLE} place="bottom">
        <TooltipContent>{t('borrow-apy-description-variable')}</TooltipContent>
      </Tooltip>
      <Tooltip id={TOOLTIP_ID.LENDING_DETAIL_BORROW_APY_STABLE} place="bottom">
        <TooltipContent>{t('borrow-apy-description-stable')}</TooltipContent>
      </Tooltip>
      <Tooltip id={TOOLTIP_ID.LENDING_DETAIL_BORROW_RESERVE_FACTOR} place="bottom">
        <TooltipContent>{t('reserve-factor-description')}</TooltipContent>
      </Tooltip>
    </OuterWrapper>
  );
};

const OuterWrapper = tw.div``;
const Wrapper = tw.div`
  flex flex-col bg-neutral-10 rounded-12 px-20 pt-20 pb-24 min-h-808 gap-32
`;

const HeaderTitle = tw.div`
  font-b-18 text-neutral-100 clickable
  md:(font-b-20)
`;

const ContentTitle = tw.div`
  flex items-center text-primary-80 font-b-14 gap-16
  md:(font-b-16)
`;

const InfoWrapper = tw.div`
  w-full grid grid-cols-2 gap-16
  md:(grid grid-cols-3 gap-16)
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

const CollectorWrapper = tw.div`
  flex flex-col gap-16
`;

const CollectorCards = tw.div`
  flex gap-16 flex-col
  md:(grid grid-cols-3 gap-16)
`;

const TooltipContent = tw.div`
  w-266
`;
