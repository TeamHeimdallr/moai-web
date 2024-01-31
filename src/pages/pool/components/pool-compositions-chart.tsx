import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { ScriptableContext } from 'chart.js';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';

import { formatNumber } from '~/utils';
import { ITokenComposition } from '~/types';

interface Props {
  data: ITokenComposition[];
}

export const PoolCompositionsChart = ({ data }: Props) => {
  const { t } = useTranslation();

  const handleGradient = (context: ScriptableContext<'doughnut'>) => {
    const { dataIndex } = context;
    const { ctx, chartArea } = context.chart;
    if (!chartArea) return;

    const gradient1 = ctx.createLinearGradient(190, 100, 0, 290);
    gradient1.addColorStop(0, COLOR.PRIMARY[80]);
    gradient1.addColorStop(1, 'rgba(252, 255, 214, 0.1)');

    const gradient2 = ctx.createLinearGradient(190, 100, 380, 290);
    gradient2.addColorStop(0, '#A3B6FF');
    gradient2.addColorStop(1, 'rgba(163, 182, 255, 0.1)');

    return dataIndex === 0 ? gradient1 : gradient2;
  };
  const totalValue = data?.reduce((acc, cur) => acc + (cur?.value || 0), 0) || 0;

  return (
    <Wrapper>
      <ChartWrapper>
        <Doughnut
          data={{
            datasets: [
              {
                data: data.map(d => d?.currentWeight || 0),
                backgroundColor: ctx => handleGradient(ctx),
                borderWidth: 0,
                circumference: 180,
                rotation: -90,
                spacing: 3,
                borderRadius: 3,
              },
            ],
          }}
          options={{
            cutout: '83%',
            animation: false,
            plugins: {
              tooltip: {
                enabled: false,
              },
            },
          }}
        />
      </ChartWrapper>
      <TotalValue>
        <Amount>${formatNumber(totalValue, 4, 'round', 1000000)}</Amount>
        <ValueTitle>{t('Pool Value')}</ValueTitle>
      </TotalValue>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative flex items-end justify-center
  w-288 h-288
  md:(w-380 h-380)
`;

const ChartWrapper = tw.div`
  absolute z-1 w-full h-full
  md:(top-15)
`;

const TotalValue = tw.div`
  flex-center flex-col gap-2 absolute absolute-center-x bottom-85
  md:(bottom-120)
`;
const Amount = tw.div`
  font-b-24 text-neutral-100
  md:(font-b-28)
`;
const ValueTitle = tw.div`
  font-m-14 text-neutral-80
  md:(font-m-16)
`;
