import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconDivision, IconEquals, IconTriangle } from '~/assets/icons';

import { THOUSAND } from '~/constants';

import { BadgeText } from '~/components/badges';
import { Popup } from '~/components/popup';

import { calculateCurrentLTVColor, formatNumber } from '~/utils';
import { POPUP_ID } from '~/types';

interface Props {
  assets: number;
  debt: number;

  criteria: number;
}
export const MarketInfoCurrentLTVPopup = ({ assets, debt, criteria }: Props) => {
  const graphRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  const ltvRaw = assets ? debt / assets : 0;
  const ltvPercent = (debt / assets) * 100;

  const ltv = ltvPercent.toFixed(2);
  const ltvColor = calculateCurrentLTVColor(ltvPercent);

  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!graphRef.current) return;

    const graph = graphRef.current;
    const graphRect = graph.getBoundingClientRect();

    const userLabelWidth = i18n.language === 'en' ? 22 : 45;
    const offset = 117 / 2 - userLabelWidth / 2; // (liquidity value width / 2) + (user label width / 2)

    if (ltvRaw <= 0.75) {
      const width = graphRect.width - 117 / 2;
      const position = (ltvRaw / 0.75) * width - userLabelWidth / 2;
      const minPosition = 0;

      setPosition(position < minPosition ? minPosition : position);

      return;
    }
    if (ltvRaw > 0.75) {
      const graphWidth = graphRect.width;
      const width = 117 / 2;
      const position = ltvRaw * (graphWidth - width) + (ltvRaw - 0.75) * width;
      const maxPosition = graphWidth - userLabelWidth;

      setPosition(position + offset > maxPosition ? maxPosition : position + offset);
      return;
    }
    setPosition(offset);
  }, [assets, debt, criteria, i18n.language, ltvRaw]);

  return (
    <Popup id={POPUP_ID.LENDING_CURRENT_LTV} title={t('Current LTV')} maxWidth={455}>
      <Wrapper>
        <Description>{t('current-ltv-description')}</Description>
        <ContentWrapper>
          <ExpressWrapper>
            <NumberBadgeWrapper>
              <ExpressNumber>{`$${formatNumber(debt, 2, 'floor', THOUSAND, 2)}`}</ExpressNumber>
              <BadgeText
                text={t('current-ltv-debt')}
                backgroundColor={COLOR.PRIMARY[20]}
                color={COLOR.PRIMARY[50]}
              />
            </NumberBadgeWrapper>

            <ExpressIcon>
              <IconDivision width={20} height={20} fill={COLOR.PRIMARY[50]} />
            </ExpressIcon>

            <NumberBadgeWrapper>
              <ExpressNumber>{`$${formatNumber(assets, 2, 'floor', THOUSAND, 2)}`}</ExpressNumber>
              <BadgeText
                text={t('current-ltv-assets')}
                backgroundColor={COLOR.PRIMARY[20]}
                color={COLOR.PRIMARY[50]}
              />
            </NumberBadgeWrapper>

            <ExpressIcon>
              <IconEquals width={20} height={20} fill={COLOR.NEUTRAL[100]} />
            </ExpressIcon>

            <NumberBadgeWrapper>
              <ExpressNumber highlight style={{ color: ltvColor }}>
                {`${formatNumber(ltv)}%`}
              </ExpressNumber>
            </NumberBadgeWrapper>
          </ExpressWrapper>

          <GraphWrapper ref={graphRef}>
            <Graph />

            <UserLableWrapper style={{ left: `${position}px` }}>
              {t('current-ltv-you')}
              <IconTriangle width={12} height={10} fill={COLOR.NEUTRAL[100]} />
            </UserLableWrapper>

            {/* <HazardLableWrapper>
              <HazardIcon>
                <IconTriangle
                  width={12}
                  height={10}
                  fill={COLOR.RED[50]}
                  style={{ transform: 'rotate(180deg)' }}
                />
              </HazardIcon>
              <HazardLabel>75.00%</HazardLabel>
              <HazardSubLabel>{t('current-ltv-liquidation-threshold')}</HazardSubLabel>
            </HazardLableWrapper> */}
          </GraphWrapper>

          <ContentDescription>{t('current-ltv-description2')}</ContentDescription>
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
  flex flex-col gap-4 relative w-full h-60 pt-34
`;

const Graph = styled.div(() => [
  tw`
    w-full h-8 rounded-8
  `,
  css`
    background: linear-gradient(90deg, #43cf9d 0%, #f5ff83 37.5%, #ff9b63 69.27%, #ff685f 100%);
  `,
]);

const UserLableWrapper = tw.div`
  absolute top-0 flex-center flex-col gap-2 font-b-12 text-neutral-100 leading-18
`;

const HazardLableWrapper = tw.div`
  absolute right-0 bottom-0 flex flex-col items-center gap-2 overflow-hidden h-44 w-117
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
