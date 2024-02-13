import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { scaleBand, scaleLinear } from '@visx/scale';
import { BarRounded } from '@visx/shape';
import { format } from 'date-fns';
import { upperFirst } from 'lodash-es';
import tw, { styled } from 'twin.macro';

import { useGetChartQuery } from '~/api/api-server/pools/get-charts';

import { COLOR } from '~/assets/colors';

import { THOUSAND } from '~/constants';

import { ButtonChipSmall } from '~/components/buttons';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { formatNumber } from '~/utils';
import {
  usePoolInfoChartSelectedRangeStore,
  usePoolInfoChartSelectedTabStore,
} from '~/states/components/chart/tab';
import { IChartData } from '~/types';

export const PoolInfoChart = () => {
  const { ref } = useGAInView({ name: 'pool-detail-info-chart' });
  const { gaAction } = useGAAction();

  const chartRef = useRef<HTMLDivElement>(null);

  const [leftLabelWidth, setLeftLabelWidth] = useState(0);
  const { network, id } = useParams();
  const { t } = useTranslation();

  const { selectedTab, selectTab } = usePoolInfoChartSelectedTabStore();
  const { selectedTab: selectedRange, selectTab: selectRange } =
    usePoolInfoChartSelectedRangeStore();

  const tabs = [
    { key: 'volume', name: 'Volume' },
    { key: 'tvl', name: 'TVL' },
    { key: 'fees', name: 'Fees' },
  ];
  const ranges = [
    { key: '90', name: t('90d') },
    { key: '180', name: t('180d') },
    { key: '365', name: t('365d') },
    { key: 'all', name: t('All') },
  ];

  const queryEnabled = !!network && !!id;
  const { data } = useGetChartQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
      queries: {
        range: selectedRange || '90',
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 60 * 1000, // 5 minutes
    }
  );

  const { VOLUME: volumeData, TVL: tvlData, FEE: feeData } = data || {};

  const chartData = useMemo(
    () =>
      (selectedTab === 'volume' ? volumeData : selectedTab === 'tvl' ? tvlData : feeData) ||
      ([] as IChartData[]),
    [selectedTab, feeData, tvlData, volumeData]
  );
  const totalValueSum = chartData?.reduce((acc, cur) => acc + cur.value, 0) || 0;
  const totalValue =
    selectedTab === 'tvl' ? chartData?.[(chartData?.length || 0) - 1].value : totalValueSum;
  const totalValueCaption =
    selectedTab === 'tvl'
      ? t(`current ${selectedTab}`)
      : t(`days ${selectedTab}`, { days: upperFirst(selectedRange) });

  useEffect(() => {
    const wrapper = chartRef.current;
    if (!wrapper) return;

    const tickLabels = wrapper.querySelectorAll('.chart-tick-left svg');

    const max = (Object.values(tickLabels) as SVGSVGElement[])
      .map(element => Math.ceil(element?.getBBox()?.width ?? 0))
      .reduce((res, curr) => (curr >= res ? curr : res), 0);

    setLeftLabelWidth(max);
  }, [chartData]);

  return (
    <Wrapper ref={ref}>
      <Header>
        <HeaderTitleWrapper>
          {tabs.map(tab => (
            <HeaderTitle
              key={tab.key}
              selected={selectedTab === tab.key}
              onClick={() => {
                gaAction({
                  action: 'pool-detail-chart-tab',
                  data: { page: 'pool-detail', component: 'pool-info-chart', tab: tab.key },
                });
                selectTab(tab.key);
              }}
            >
              {t(tab.name || 'Volume')}
            </HeaderTitle>
          ))}
        </HeaderTitleWrapper>
        <HeaderValueWrapper>
          <HeaderValue>${formatNumber(totalValue)}</HeaderValue>
          <HeaderValueLabel>{totalValueCaption}</HeaderValueLabel>
        </HeaderValueWrapper>
      </Header>

      <ChartOuterWrapper>
        <ChartWrapper ref={chartRef}>
          <ParentSize>
            {({ width, height }) => {
              if (!chartData) return;

              const dateScale = scaleBand<string>({
                range: [leftLabelWidth + 8, width - 8],
                domain: chartData.map(d => d.date),
                padding: 0.25,
              });

              const valueScale = scaleLinear<number>({
                range: [height - 20, 0],
                domain: [0, Math.max(...chartData.map(d => d.value))],
              });

              if (selectedTab === 'volume' || selectedTab === 'fees')
                return (
                  <svg width={width} height={height}>
                    <AxisBottom
                      numTicks={5}
                      scale={dateScale}
                      hideAxisLine
                      hideTicks
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      tickFormat={d => format(new Date(d as any), 'MMM')}
                      top={height - 16 - 8}
                      left={0}
                      tickLabelProps={() => ({
                        fill: COLOR.NEUTRAL[60],
                        fontFamily: 'Pretendard Variable',
                        fontSize: '11px',
                        fontWeight: 400,
                      })}
                    />
                    <AxisLeft
                      numTicks={5}
                      scale={valueScale}
                      hideAxisLine
                      hideTicks
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      tickFormat={d => `$${formatNumber(d as any, 2, 'floor', THOUSAND, 2)}`}
                      left={leftLabelWidth + 12}
                      tickLabelProps={{
                        fill: COLOR.NEUTRAL[60],
                        fontFamily: 'Pretendard Variable',
                        fontSize: '11px',
                        fontWeight: 400,
                      }}
                      tickClassName="chart-tick-left"
                    />
                    <Group>
                      {leftLabelWidth > 0 &&
                        chartData.map((d, i) => {
                          const barHeight = Math.max(height - 20 - valueScale(d.value), 1);
                          const barX = dateScale(d.date) || 0;
                          const barY = height - 20 - barHeight;

                          const barWidth = dateScale.bandwidth();
                          return (
                            <BarRounded
                              key={`bar-${i}`}
                              x={barX}
                              y={barY}
                              width={barWidth}
                              height={barHeight}
                              radius={barWidth / 2}
                              all
                              fill={COLOR.PRIMARY[80]}
                            />
                          );
                        })}
                    </Group>
                  </svg>
                );
            }}
          </ParentSize>
        </ChartWrapper>
        <ChartRangeWrapper>
          {ranges.map(range => (
            <ButtonChipSmall
              key={range.key}
              text={range.name}
              selected={selectedRange === range.key}
              onClick={() => {
                gaAction({
                  action: 'pool-detail-chart-range',
                  buttonType: 'chip-small',
                  data: { page: 'pool-detail', component: 'pool-info-chart', range: range.key },
                });
                selectRange(range.key);
              }}
            />
          ))}
        </ChartRangeWrapper>
      </ChartOuterWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 rounded-12 px-20 pt-20 pb-24 min-h-412 gap-20
  md:(px-24)
`;

const Header = tw.div`
  flex flex-col justify-between gap-16
  md:(flex-row)
`;

const HeaderTitleWrapper = tw.div`
  flex gap-24 items-start
`;

interface HeaderTitleProps {
  selected?: boolean;
}
const HeaderTitle = styled.div<HeaderTitleProps>(({ selected }) => [
  tw`
    font-b-18 text-neutral-60 clickable
    md:(font-b-20)
  `,
  selected && tw`text-primary-60`,
]);

const HeaderValueWrapper = tw.div`
  flex flex-col items-end
`;

const HeaderValue = tw.div`
  font-m-20 text-neutral-100
  md:(font-m-24)
`;
const HeaderValueLabel = tw.div`
  font-r-12 text-neutral-60
  md:(font-r-14)
`;

const ChartOuterWrapper = tw.div`
  flex flex-col gap-12
`;

const ChartWrapper = tw.div`
  w-full h-256 flex-center relative
`;

const ChartRangeWrapper = tw.div`
  flex justify-end gap-4
`;
