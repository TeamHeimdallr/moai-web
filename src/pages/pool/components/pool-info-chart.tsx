import { MouseEvent, TouchEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { LinearGradient } from '@visx/gradient';
import { Group } from '@visx/group';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { scaleBand, scaleLinear, scaleTime } from '@visx/scale';
import { Area, AreaClosed, Bar, Line } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { bisector, extent } from '@visx/vendor/d3-array';
import { format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
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
  const headerRef = useRef<HTMLDivElement>(null);

  const [leftLabelWidth, setLeftLabelWidth] = useState(0);

  const { network, id } = useParams();
  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const { selectedTab, selectTab } = usePoolInfoChartSelectedTabStore();
  const { selectedTab: selectedRange, selectTab: selectRange } =
    usePoolInfoChartSelectedRangeStore();

  const { tooltipData, tooltipLeft, showTooltip, hideTooltip } = useTooltip();

  const tabs = [
    { key: 'volume', name: 'Volume' },
    { key: 'tvl', name: 'TVL' },
    { key: 'fees', name: 'Fees' },
  ];
  const ranges = useMemo(
    () => [
      { key: '90', name: t('90d') },
      { key: '180', name: t('180d') },
      { key: '365', name: t('365d') },
      { key: 'all', name: t('All') },
    ],
    [t]
  );

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
  const getChartValue = useMemo(() => {
    if (!chartData) return 0;
    if (selectedTab === 'tvl') return chartData[chartData.length - 1]?.value || 0;
    return totalValueSum;
  }, [chartData, selectedTab, totalValueSum]);

  const getChartCaption = useMemo(() => {
    if (!chartData) return '';

    if (selectedTab === 'tvl') return t(`current ${selectedTab}`);

    return t(`days ${selectedTab}`, {
      days: isKo
        ? `${t(ranges.find(r => r.key === selectedRange)?.name || '')}${
            selectedRange !== 'all' ? '간' : ''
          }`
        : t(upperFirst(selectedRange)),
    });
  }, [chartData, isKo, ranges, selectedRange, selectedTab, t]);

  useEffect(() => {
    const wrapper = chartRef.current;
    if (!wrapper) return;

    const tickLabels = wrapper.querySelectorAll('.chart-tick-left svg');

    const max = (Object.values(tickLabels) as SVGSVGElement[])
      .map(element => Math.ceil(element?.getBBox()?.width ?? 0))
      .reduce((res, curr) => (curr >= res ? curr : res), 0);

    setLeftLabelWidth(Math.max(max, 44));
  }, [chartData]);

  return (
    <Wrapper ref={ref}>
      <Header ref={headerRef}>
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
          <HeaderValue id="header-value">${formatNumber(getChartValue)}</HeaderValue>
          <HeaderValueLabel id="header-caption">{getChartCaption}</HeaderValueLabel>
        </HeaderValueWrapper>
      </Header>

      <ChartOuterWrapper>
        <ChartWrapper ref={chartRef}>
          <ParentSize debounceTime={50}>
            {({ width, height }) => {
              if (!chartData || !width || !height) return;

              const bisectDate = bisector<IChartData, Date>(d => new Date(d.date)).left;
              const getDate = (d: IChartData) => new Date(d.date);

              const dateScale = scaleBand<string>({
                range: [leftLabelWidth + 8, width],
                domain: chartData.map(d => d.date),
                padding: 0.25,
              });

              const dateScaleLine = scaleTime({
                range: [leftLabelWidth + 8, width],
                domain: extent(chartData, d => new Date(d.date)) as [Date, Date],
              });

              const valueScale = scaleLinear<number>({
                range: [height - 20, 0],
                domain: [0, Math.max(...chartData.map(d => d.value))],
              });

              const changeHeader = (d: IChartData | undefined) => {
                const header = headerRef.current;
                if (!header) return;

                const headerValueDom = header.querySelector('#header-value');
                const headerCaptionDom = header.querySelector('#header-caption');

                if (d) {
                  const formattedValue = `$${formatNumber(d.value)}`;
                  const date = new Date(d.date);
                  const formattedDate = `${format(date, 'MMM', {
                    locale: isKo ? ko : enUS,
                  })} ${format(date, 'd')}${isKo ? '일' : ''}, ${format(date, 'yyyy')}`;

                  if (headerValueDom && headerCaptionDom) {
                    headerValueDom.innerHTML = formattedValue;
                    headerCaptionDom.innerHTML = formattedDate;
                  }
                } else {
                  if (headerValueDom && headerCaptionDom) {
                    headerValueDom.innerHTML = `$${formatNumber(getChartValue)}`;
                    headerCaptionDom.innerHTML = getChartCaption;
                  }
                }
              };
              const handleBarHover = (
                event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>,
                d: IChartData | undefined
              ) => {
                const target = event.currentTarget;

                if (d) target.style.fill = COLOR.PRIMARY[50];
                else target.style.fill = COLOR.PRIMARY[80];

                changeHeader(d);
              };

              const handleTooltip = (
                event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>
              ) => {
                const { x } = localPoint(event) || { x: 0 };
                const x0 = dateScaleLine.invert(x);
                const index = bisectDate(chartData, x0, 1);
                const d0 = chartData[index - 1];
                const d1 = chartData[index];
                let d = d0;
                if (d1 && getDate(d1)) {
                  d =
                    x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf()
                      ? d1
                      : d0;
                }
                showTooltip({
                  tooltipData: d,
                  tooltipLeft: x,
                  tooltipTop: valueScale(d.value),
                });

                changeHeader(d);
              };

              if (selectedTab === 'volume' || selectedTab === 'fees')
                return (
                  <svg width={width} height={height}>
                    <AxisBottom
                      numTicks={5}
                      scale={dateScale}
                      hideAxisLine
                      hideTicks
                      tickFormat={d => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const date = new Date(d as any);
                        return `${format(date, 'MMM', {
                          locale: isKo ? ko : enUS,
                        })} ${format(date, 'd')}${isKo ? '일' : ''}`;
                      }}
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
                      left={12}
                      tickLabelProps={{
                        fill: COLOR.NEUTRAL[60],
                        fontFamily: 'Pretendard Variable',
                        fontSize: '11px',
                        fontWeight: 400,
                        textAnchor: 'start',
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
                            <Bar
                              key={`bar-${i}`}
                              x={barX}
                              y={barY}
                              width={barWidth}
                              height={barHeight}
                              rx={barWidth / 2}
                              fill={COLOR.PRIMARY[80]}
                              onMouseEnter={e => handleBarHover(e, d)}
                              onMouseLeave={e => handleBarHover(e, undefined)}
                            />
                          );
                        })}
                    </Group>
                  </svg>
                );

              if (selectedTab === 'tvl') {
                return (
                  <svg width={width} height={height}>
                    <AxisBottom
                      numTicks={5}
                      scale={dateScaleLine}
                      hideAxisLine
                      hideTicks
                      tickFormat={d => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const date = new Date(d as any);
                        return `${format(date, 'MMM', {
                          locale: isKo ? ko : enUS,
                        })} ${format(date, 'd')}${isKo ? '일' : ''}`;
                      }}
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
                      left={12}
                      tickLabelProps={{
                        fill: COLOR.NEUTRAL[60],
                        fontFamily: 'Pretendard Variable',
                        fontSize: '11px',
                        fontWeight: 400,
                        textAnchor: 'start',
                      }}
                      tickClassName="chart-tick-left"
                    />
                    <AreaClosed<IChartData>
                      data={chartData}
                      x={d => dateScaleLine(new Date(d.date)) || 0}
                      y={d => valueScale(d.value) || 0}
                      yScale={valueScale}
                      strokeWidth={1}
                      fill="url(#chart-tvl-gradient)"
                      curve={curveMonotoneX}
                    />
                    <Area<IChartData>
                      data={chartData}
                      x={d => dateScaleLine(new Date(d.date)) || 0}
                      y={d => valueScale(d.value) || 0}
                      strokeWidth={1}
                      stroke={COLOR.PRIMARY[60]}
                      curve={curveMonotoneX}
                    />
                    <Bar
                      x={leftLabelWidth + 8}
                      y={0}
                      width={width - leftLabelWidth - 8}
                      height={height - 20}
                      fill="transparent"
                      rx={14}
                      onTouchStart={handleTooltip}
                      onTouchMove={handleTooltip}
                      onMouseMove={handleTooltip}
                      onMouseOut={() => {
                        hideTooltip();
                        changeHeader(undefined);
                      }}
                    />
                    {tooltipData && (
                      <Line
                        from={{ x: tooltipLeft, y: 0 }}
                        to={{ x: tooltipLeft, y: height - 20 }}
                        stroke={COLOR.NEUTRAL[100]}
                        strokeWidth={1}
                        pointerEvents="none"
                        strokeDasharray="2,2"
                      />
                    )}
                    <LinearGradient
                      id="chart-tvl-gradient"
                      from={COLOR.PRIMARY[60]}
                      fromOpacity={0.5}
                      to={COLOR.PRIMARY[60]}
                      toOpacity={0}
                    />
                  </svg>
                );
              }
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
