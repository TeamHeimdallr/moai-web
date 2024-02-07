import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconDivision, IconEquals, IconTriangle } from '~/assets/icons';

import { THOUSAND } from '~/constants';

import { BadgeText } from '~/components/badges';
import { Popup } from '~/components/popup';

import { calculateHealthFactorColor, formatNumber } from '~/utils';
import { POPUP_ID } from '~/types';

interface Props {
  assets: number;
  debt: number;

  criteria: number;
}
export const MarketInfoHealthFactorPopup = ({ assets, debt, criteria }: Props) => {
  const graphRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  const healthFactorRaw = assets / debt;
  const healthFactorRatio = Math.max(Math.min(healthFactorRaw / criteria, 1), 0);

  const healthFactor = formatNumber(assets / debt, 2, 'floor', THOUSAND, 2);
  const healthFactorColor = calculateHealthFactorColor(healthFactorRaw);

  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!graphRef.current) return;

    const graph = graphRef.current;
    const graphRect = graph.getBoundingClientRect();

    const userLabelWidth = i18n.language === 'en' ? 22 : 45;
    const offset = 91 / 2 - userLabelWidth / 2; // (liquidity value width / 2) + (user label width / 2)

    if (healthFactorRaw > 1) {
      const width = graphRect.width;
      const position = healthFactorRatio * width;
      const maxPosition = width - userLabelWidth;

      setPosition(position + offset > maxPosition ? maxPosition : position + offset);

      return;
    }
    if (healthFactorRaw < 1) {
      const width = 91 / 2;
      const position = healthFactorRatio * width;
      const minPosition = 0;

      setPosition(position < minPosition ? minPosition : position);
      return;
    }
    setPosition(offset);
  }, [assets, debt, criteria, i18n.language, healthFactorRaw, healthFactorRatio]);

  return (
    <Popup
      id={POPUP_ID.LENDING_HEALTH_FACTOR}
      title={t('Liquidation Health Factor')}
      maxWidth={455}
    >
      <Wrapper>
        <Description>{t('liquidation-health-factor-description')}</Description>
        <ContentWrapper>
          <ExpressWrapper>
            <NumberBadgeWrapper>
              <ExpressNumber>{`$${formatNumber(assets, 2, 'floor', THOUSAND, 2)}`}</ExpressNumber>
              <BadgeText
                text={t('health-factor-assets')}
                backgroundColor={COLOR.PRIMARY[20]}
                color={COLOR.PRIMARY[50]}
              />
            </NumberBadgeWrapper>

            <ExpressIcon>
              <IconDivision width={20} height={20} fill={COLOR.PRIMARY[50]} />
            </ExpressIcon>

            <NumberBadgeWrapper>
              <ExpressNumber>{`$${formatNumber(debt, 2, 'floor', THOUSAND, 2)}`}</ExpressNumber>
              <BadgeText
                text={t('health-factor-debt')}
                backgroundColor={COLOR.PRIMARY[20]}
                color={COLOR.PRIMARY[50]}
              />
            </NumberBadgeWrapper>

            <ExpressIcon>
              <IconEquals width={20} height={20} fill={COLOR.NEUTRAL[100]} />
            </ExpressIcon>

            <NumberBadgeWrapper>
              <ExpressNumber highlight style={{ color: healthFactorColor }}>
                {healthFactor}
              </ExpressNumber>
            </NumberBadgeWrapper>
          </ExpressWrapper>

          <GraphWrapper ref={graphRef}>
            <Graph />

            <UserLableWrapper style={{ left: `${position}px` }}>
              {t('health-factor-you')}
              <IconTriangle width={12} height={10} fill={COLOR.NEUTRAL[100]} />
            </UserLableWrapper>

            <HazardLableWrapper>
              <HazardIcon>
                <IconTriangle
                  width={12}
                  height={10}
                  fill={COLOR.RED[50]}
                  style={{ transform: 'rotate(180deg)' }}
                />
              </HazardIcon>
              <HazardLabel>1.00</HazardLabel>
              <HazardSubLabel>{t('health-factor-liquidation-value')}</HazardSubLabel>
            </HazardLableWrapper>
          </GraphWrapper>

          <ContentDescription>{t('liquidation-health-factor-description2')}</ContentDescription>
        </ContentWrapper>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  pt-4 px-24 flex flex-col gap-24
`;

const Description = tw.div`
  font-r-14 text-neutral-100
`;

const ContentWrapper = tw.div`
  flex flex-col gap-12 pt-20 px-16 pb-16 bg-neutral-15 rounded-12
`;

const ExpressWrapper = tw.div`
  flex gap-8 items-start justify-center
`;

const ExpressIcon = tw.div`
  h-24 flex flex-center flex-shrink-0
`;

const NumberBadgeWrapper = tw.div`
  flex flex-col items-center gap-4
`;

interface ExpressNumberProps {
  highlight?: boolean;
}
const ExpressNumber = styled.div<ExpressNumberProps>(({ highlight }) => [
  tw`
    font-m-18 text-neutral-100
  `,
  highlight && tw`font-b-20`,
]);

const GraphWrapper = tw.div`
  flex flex-col gap-4 relative w-full h-90 pt-34
`;

const Graph = styled.div(() => [
  tw`
    w-full h-8 rounded-8
  `,
  css`
    background: linear-gradient(270deg, #43cf9d 0%, #f5ff83 37.5%, #ff9b63 69.27%, #ff685f 100%);
  `,
]);

const UserLableWrapper = tw.div`
  absolute top-0 flex-center flex-col gap-2 font-b-12 text-neutral-100 leading-18
`;

const HazardLableWrapper = tw.div`
  absolute left-0 bottom-0 flex flex-col items-center gap-2 overflow-hidden h-44 w-91
`;
const HazardIcon = tw.div`
  flex-shrink-0 flex-center
`;
const HazardLabel = tw.div`
  font-b-12 text-red-50 leading-18 flex-shrink-0
`;
const HazardSubLabel = tw.div`
  absolute top-26 font-r-12 text-red-50 leading-18 flex-shrink-0
`;

const ContentDescription = tw.div`
  font-r-14 text-neutral-80
`;
