import { useTranslation } from 'react-i18next';
import { css } from '@emotion/react';
import { LinearGradient } from '@visx/gradient';
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import tw, { styled } from 'twin.macro';

import { ASSET_URL } from '~/constants';

import { useMediaQuery } from '~/hooks/utils';
import { formatNumber } from '~/utils';
import { ITokenComposition } from '~/types';

interface Props {
  data: ITokenComposition[];
  poolId?: string;
}

export const PoolCompositionsChart = ({ data, poolId }: Props) => {
  const { t } = useTranslation();
  const { isMD } = useMediaQuery();

  const nullPrice = data?.some(d => !d.price);

  const chartData = data.map(d => ({
    id: d.symbol,
    value: nullPrice ? 0.5 : d.currentWeight || 0.5,
  }));

  const totalValue = data?.reduce((acc, cur) => acc + (cur?.value || 0), 0) || 0;

  const width = isMD ? 190 : 144;
  return (
    <Wrapper>
      <ChartWrapper>
        {nullPrice ? (
          <UndefinedValue
            style={{ backgroundImage: `url(${ASSET_URL}/images/image-composition-undefined.png)` }}
          />
        ) : (
          <svg width={'100%'} height={isMD ? '190px' : '144px'}>
            <LinearGradient
              id={`pool-pie-gradient-left-${poolId}`}
              from="#FCFFD6"
              to="rgba(252, 255, 214, 0.10)"
              toOffset={'100%'}
            />
            <LinearGradient
              id={`pool-pie-gradient-right-${poolId}`}
              from="#A3B6FF"
              to="rgba(163, 182, 255, 0.10)"
              toOffset={'100%'}
            />

            <Group top={isMD ? 190 : 144} left={isMD ? 190 : 144}>
              <Pie
                data={chartData}
                pieValue={d => d.value}
                outerRadius={width}
                innerRadius={isMD ? width - 34 : width - 26}
                padAngle={0.015}
                pieSort={(a, b) => a.id.localeCompare(b.id)}
                startAngle={-(Math.PI / 2)}
                endAngle={Math.PI / 2}
                cornerRadius={5}
              >
                {pie =>
                  pie.arcs.map((arc, i) => {
                    const data = arc.data;
                    const key = `arc-${data.id}-${i}`;
                    const d = pie.path(arc) || '';
                    const color =
                      i === 0
                        ? `url('#pool-pie-gradient-left-${poolId}')`
                        : `url('#pool-pie-gradient-right-${poolId}')`;

                    return (
                      <Group key={key}>
                        <path
                          d={d}
                          fill={color}
                          style={{
                            boxShadow: '1px 1px 2px 0px rgba(255, 255, 255, 0.20) inset',
                          }}
                        />
                      </Group>
                    );
                  })
                }
              </Pie>
            </Group>
          </svg>
        )}
      </ChartWrapper>
      <TotalValue>
        {nullPrice ? (
          <>
            <NullPriceText>{t('No Reliable Price')}</NullPriceText>
            <NullPriceDescription>{t('reliable-pool-value')}</NullPriceDescription>
          </>
        ) : (
          <>
            <Amount>${formatNumber(totalValue)}</Amount>
            <ValueTitle>{t('Pool Value')}</ValueTitle>
          </>
        )}
      </TotalValue>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative flex-center
  w-288 h-144
  md:(w-380 h-194)
`;

const ChartWrapper = tw.div`
  absolute z-1 w-full h-full flex-center
`;

const TotalValue = tw.div`
  flex-center flex-col gap-2 absolute absolute-center-x bottom-16
  md:(bottom-30)
`;
const Amount = tw.div`
  font-b-24 text-neutral-100
  md:(font-b-28)
`;
const ValueTitle = tw.div`
  font-m-14 text-neutral-80
  md:(font-m-16)
`;

const UndefinedValue = styled.div(() => [
  tw`
    w-full bg-contain bg-center bg-no-repeat
  `,
  css`
    height: calc(100% - 4px);
  `,
]);

const NullPriceText = tw.div`
  font-m-18 text-neutral-100
`;

const NullPriceDescription = tw.div`
  font-m-16 text-neutral-60
`;
