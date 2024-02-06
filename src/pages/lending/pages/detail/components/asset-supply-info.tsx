import { useTranslation } from 'react-i18next';
import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconQuestion } from '~/assets/icons';

import { ButtonIconSmall } from '~/components/buttons';
import { Tooltip } from '~/components/tooltips/base';

import { APYMedium } from '~/pages/lending/components/apy';

import { formatNumber } from '~/utils';
import { TOOLTIP_ID } from '~/types';

export const AssetSupplyInfo = () => {
  const { t } = useTranslation();

  const totalSupply = 2000000000;
  const currentSupply = 739845000;
  const ratio = (currentSupply / totalSupply) * 100;

  const apy = 0.0239;

  return (
    <Wrapper>
      <HeaderTitle>{t('Supply info')}</HeaderTitle>
      <InfoWrapper>
        <InfoWrapper>
          <InfoCard>
            <Subtitle>
              {t('Total supplied')}
              <ButtonIconSmall
                icon={<IconQuestion />}
                data-tooltip-id={TOOLTIP_ID.LENDING_DETAIL_TOTAL_SUPPLIED}
              />
            </Subtitle>
            <InfoTextWrapper>
              <InfoText>{formatNumber(currentSupply, 2, 'floor', 1000)}</InfoText>
              <InfoTextSmall>of</InfoTextSmall>
              <InfoText>{formatNumber(totalSupply, 2, 'floor', 1000)}</InfoText>
            </InfoTextWrapper>
            <InfoBarWrapper>
              <InfoBar value={ratio} />
              <InfoBarLabel>{`${formatNumber(ratio, 2, 'floor')}%`}</InfoBarLabel>
            </InfoBarWrapper>
          </InfoCard>
          <InfoCard>
            <Subtitle>{t('APY')}</Subtitle>
            <APYMedium apy={apy} style={{ justifyContent: 'flex-start' }} />
          </InfoCard>
        </InfoWrapper>
      </InfoWrapper>
      <ChartWrapper></ChartWrapper>
      <CollateralWrapper></CollateralWrapper>

      <Tooltip id={TOOLTIP_ID.LENDING_DETAIL_TOTAL_SUPPLIED} place="bottom">
        <TooltipContent>{t('total-supplied-description')}</TooltipContent>
      </Tooltip>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 rounded-12 px-24 pt-20 pb-24 min-h-808 gap-32
`;

const HeaderTitle = tw.div`
  font-b-18 text-neutral-100 clickable
  md:(font-b-20)
`;

const Subtitle = tw.div`
  flex items-center gap-4 text-primary-80
  font-b-16
`;

const InfoWrapper = tw.div`
  flex gap-16 w-full
`;

const InfoCard = tw.div`
  flex flex-col gap-16 w-254 justify-start text-neutral-100
  pr-24 pb-20
`;

const InfoTextWrapper = tw.div`
  flex gap-4 items-center
`;
const InfoText = tw.div`
  font-m-18
`;
const InfoTextSmall = tw.div`
  font-r-16
`;

const InfoBarWrapper = tw.div`
  flex flex-col gap-4
`;

interface InfoBarProps {
  value: number;
}
const InfoBar = styled.div<InfoBarProps>(({ value }) => [
  tw`
    w-full h-4 bg-neutral-30 rounded-4 relative
  `,
  css`
    &:after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;

      min-width: 2px;
      width: ${value > 99 ? 100 : value}%;
      height: 4px;
      background: ${COLOR.GREEN[50]};

      border-top-left-radius: ${value > 0 ? '99999px' : '0'};
      border-bottom-left-radius: ${value > 0 ? '99999px' : '0'};

      border-top-right-radius: ${value > 99 ? '99999px' : '0'};
      border-bottom-right-radius: ${value > 99 ? '99999px' : '0'};
    }
  `,
]);

const InfoBarLabel = tw.div`
  text-neutral-90
  font-r-14
`;

const ChartWrapper = tw.div``;

const CollateralWrapper = tw.div``;

const TooltipContent = tw.div`
  w-266
`;
