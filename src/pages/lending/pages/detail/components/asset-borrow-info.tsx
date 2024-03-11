import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { Address, formatUnits } from 'viem';

import { useGetMarket } from '~/api/api-contract/_evm/lending/get-market';
import { useGetMTokenMetadata } from '~/api/api-contract/_evm/lending/mtoken-metadata';

import { IconQuestion } from '~/assets/icons';

import { THOUSAND } from '~/constants';

import { ButtonIconSmall } from '~/components/buttons';
import { Tooltip } from '~/components/tooltips/base';

import { APYMedium } from '~/pages/lending/components/apy';
import { InfoCard } from '~/pages/lending/components/info-card';

import { formatNumber } from '~/utils';
import { TOOLTIP_ID } from '~/types';

import { AssetBorrowInfoChart } from './asset-borrow-info-chart';
import { AssetSupplyBorrowInfoCard } from './asset-supply-borrow-info-card';

export const AssetBorrowInfo = () => {
  const { t } = useTranslation();

  const { address } = useParams();
  const { market } = useGetMarket({
    marketAddress: address as Address,
  });
  const { mTokenMetadata } = useGetMTokenMetadata({
    mTokenAddress: address as Address,
    enabled: address !== undefined,
  });

  const { borrowApy, price } = market || {};
  const {
    totalBorrows,
    underlyingDecimals,
    borrowCap: borrowCapRaw,
    reserveFactorMantissa,
  } = mTokenMetadata || {};

  const borrowCap = Number(formatUnits(borrowCapRaw || 0n, Number(underlyingDecimals) || 18));
  const totalBorrowNum = Number(formatUnits(totalBorrows || 0n, Number(underlyingDecimals) || 18));
  const borrowApyNum = Number(borrowApy);
  const reserveFactorNum = Number(formatUnits(reserveFactorMantissa || 0n, 18)) * 100;

  const ratio = (totalBorrowNum / borrowCap) * 100;
  const totalBorrowUsd = totalBorrowNum * price;
  const borrowCapUsd = borrowCap * price;

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
              <InfoTextWrapper>
                <InfoText>{formatNumber(totalBorrowNum, 2, 'floor', THOUSAND, 2)}</InfoText>
                <InfoSubText>${formatNumber(totalBorrowUsd, 2, 'floor', THOUSAND, 2)}</InfoSubText>
              </InfoTextWrapper>
            }
            barChart
            barChartValue={ratio}
            barChartLabel={`${formatNumber(ratio, 2, 'floor', THOUSAND, 2)}%`}
            barChartSubLabel={
              <InfoTextWrapper>
                <BarChartSubLabelText>
                  {formatNumber(borrowCap, 2, 'floor', THOUSAND, 2)}
                </BarChartSubLabelText>
                <BarChartSubLabelSubText>
                  ${formatNumber(borrowCapUsd, 2, 'floor', THOUSAND, 2)}
                </BarChartSubLabelSubText>
              </InfoTextWrapper>
            }
          />
          <AssetSupplyBorrowInfoCard
            title={t('APY')}
            value={<APYMedium apy={borrowApyNum} style={{ justifyContent: 'flex-start' }} />}
          />
          {borrowCap !== 0 && (
            <AssetSupplyBorrowInfoCard
              title={t('Borrow cap')}
              value={<InfoText>{formatNumber(borrowCap)}</InfoText>}
              caption={`$${formatNumber(borrowCap * (price || 0))}`}
            />
          )}
        </InfoWrapper>

        <ChartWrapper>
          <AssetBorrowInfoChart />
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
              value={`${formatNumber(reserveFactorNum)}%`}
              light
            />
          </CollectorCards>
        </CollectorWrapper>
      </Wrapper>

      <Tooltip id={TOOLTIP_ID.LENDING_DETAIL_TOTAL_BORROWED} place="bottom">
        <TooltipContent>{t('total-borrowed-description')}</TooltipContent>
      </Tooltip>
      <Tooltip id={TOOLTIP_ID.LENDING_DETAIL_BORROW_RESERVE_FACTOR} place="bottom">
        <TooltipContent>{t('reserve-factor-description')}</TooltipContent>
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

const InfoWrapper = tw.div`
  w-full grid grid-cols-2 gap-16
  md:(grid grid-cols-3 gap-16)
`;

const InfoText = tw.div`
  font-m-16
  md:(font-m-18)
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

const InfoTextWrapper = tw.div`
  gap-6 items-center flex
`;

const InfoSubText = tw.div`
  text-neutral-70 font-r-12
  md:(font-r-14)
`;

const BarChartSubLabelText = tw.div`
  text-neutral-90 font-m-12
  md:(font-m-14)
`;

const BarChartSubLabelSubText = tw.div`
  text-neutral-70 font-m-12
  md:(font-m-12)
`;
