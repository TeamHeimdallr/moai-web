import { MouseEvent, TouchEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { Group } from '@visx/group';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { scaleLinear, scaleTime } from '@visx/scale';
import { Area, Bar, Line, LinePath } from '@visx/shape';
import { Text } from '@visx/text';
import { useTooltip } from '@visx/tooltip';
import { bisector, extent } from '@visx/vendor/d3-array';
import { format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import tw from 'twin.macro';
import { Address } from 'viem';

import { useGetLendingAPYChartQuery } from '~/api/api-server/lending/get-charts-apy';

import { COLOR } from '~/assets/colors';

import { THOUSAND } from '~/constants';

import { ButtonChipSmall } from '~/components/buttons';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { formatNumber } from '~/utils';
import { useLendingAssetBorrowInfoChartSelectedRangeStore } from '~/states/components/chart/tab';
import { IChartData } from '~/types';
import { LENDING_CHART_TYPE } from '~/types/lending';

export const AssetBorrowInfoChart = () => {
  const { ref } = useGAInView({ name: 'lending-asset-borrow-info-chart' });
  const { gaAction } = useGAAction();

  const { network, address } = useParams();

  const chartRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [leftLabelWidth, setLeftLabelWidth] = useState(0);
  const [textBgWidth, setTextBgWidth] = useState(0);

  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const { selectedTab: selectedRange, selectTab: selectRange } =
    useLendingAssetBorrowInfoChartSelectedRangeStore();

  const { tooltipData, tooltipLeft, showTooltip, hideTooltip } = useTooltip();

  const ranges = [
    { key: '24h', name: t('24h') },
    { key: '7d', name: t('7d') },
    { key: '14d', name: t('14d') },
    { key: 'all', name: t('All') },
  ];

  const { data } = useGetLendingAPYChartQuery(
    {
      params: {
        networkAbbr: network || 'trn',
        marketAddress: (address || '') as Address,
        type: LENDING_CHART_TYPE.BORROW,
      },
      queries: { range: selectedRange || '24h' },
    },
    {
      staleTime: 1000 * 60,
      enabled: !!network && !!address,
    }
  );
  const { data: chartData } = data || {};

  const avg =
    chartData && chartData.length > 0
      ? (chartData.reduce((acc, cur) => acc + cur.value, 0) || 0) / chartData.length
      : 0;

  const chartValue = !chartData ? 0 : chartData[chartData.length - 1]?.value || 0;
  const chartCaption = useMemo(() => {
    if (!chartData) return '';

    const date = new Date(chartData[chartData.length - 1].date);
    const formattedDate = `${format(date, 'MMM', {
      locale: isKo ? ko : enUS,
    })} ${format(date, 'd')}${isKo ? '일' : ''}, ${
      selectedRange === 'all'
        ? format(date, 'yyyy')
        : format(date, 'HH:mm:ss a', {
            locale: isKo ? ko : enUS,
          })
    }`;

    return formattedDate;
  }, [chartData, isKo, selectedRange]);

  useEffect(() => {
    const wrapper = chartRef.current;
    if (!wrapper) return;

    const tickLabels = wrapper.querySelectorAll('.chart-tick-left svg');

    const max = (Object.values(tickLabels) as SVGSVGElement[])
      .map(element => Math.ceil(element?.getBBox()?.width ?? 0))
      .reduce((res, curr) => (curr >= res ? curr : res), 0);

    setLeftLabelWidth(Math.max(max, 30));
  }, [chartData]);

  useEffect(() => {
    const wrapper = chartRef.current;
    if (!wrapper) return;

    const text = wrapper.querySelector('.chart-avg-text');

    const width = text?.getBoundingClientRect().width || 0;
    const max = Math.max(Math.ceil(width) + 16, 44);

    setTextBgWidth(max);
  }, [chartData]);

  return (
    <Wrapper ref={ref}>
      <Header ref={headerRef}>
        <HeaderTitleWrapper>
          <HeaderTitle>{t('Borrow APR')}</HeaderTitle>
        </HeaderTitleWrapper>
        <HeaderValueWrapper>
          <HeaderValue id="header-value">{formatNumber(chartValue)}%</HeaderValue>
          <HeaderValueLabel id="header-caption">{chartCaption}</HeaderValueLabel>
        </HeaderValueWrapper>
      </Header>

      <ChartOuterWrapper>
        <ChartWrapper ref={chartRef}>
          <ParentSize debounceTime={50}>
            {({ width, height }) => {
              if (!chartData || !width || !height) return;

              const bisectDate = bisector<IChartData, Date>(d => new Date(d.date)).left;
              const getDate = (d: IChartData) => new Date(d.date);

              const dateScale = scaleTime({
                range: [leftLabelWidth + 8, width],
                domain: extent(chartData, d => new Date(d.date)) as [Date, Date],
              });

              const valueScale = scaleLinear<number>({
                range: [height - 20, 0],
                domain: [0, Math.max(...chartData.map(d => d.value)) + 2],
              });

              const changeHeader = (d: IChartData | undefined) => {
                const header = headerRef.current;
                if (!header) return;

                const headerValueDom = header.querySelector('#header-value');
                const headerCaptionDom = header.querySelector('#header-caption');

                if (d) {
                  const formattedValue = `${formatNumber(d.value)}%`;
                  const date = new Date(d.date);
                  const formattedDate = `${format(date, 'MMM', {
                    locale: isKo ? ko : enUS,
                  })} ${format(date, 'd')}${isKo ? '일' : ''}, ${
                    selectedRange === 'all'
                      ? format(date, 'yyyy')
                      : format(date, 'HH:mm:ss a', {
                          locale: isKo ? ko : enUS,
                        })
                  }`;

                  if (headerValueDom && headerCaptionDom) {
                    headerValueDom.innerHTML = formattedValue;
                    headerCaptionDom.innerHTML = formattedDate;
                  }
                } else {
                  if (headerValueDom && headerCaptionDom) {
                    headerValueDom.innerHTML = `${formatNumber(chartValue)}%`;
                    headerCaptionDom.innerHTML = chartCaption;
                  }
                }
              };
              const handleTooltip = (
                event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>
              ) => {
                const { x } = localPoint(event) || { x: 0 };
                const x0 = dateScale.invert(x);
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

                      if (selectedRange === '24h') return `${format(date, 'HH:mm')}`;
                      return `${format(date, 'MMM', {
                        locale: isKo ? ko : enUS,
                      })} ${format(date, 'd')}${isKo ? '일' : ''}`;
                    }}
                    top={height - 16 - 13}
                    left={0}
                    tickLabelProps={(_value, i, values) => {
                      const isFirst = i === 0;
                      const isLast = i === values[values.length - 1].index;

                      const base = {
                        fill: COLOR.NEUTRAL[60],
                        fontFamily: 'Pretendard Variable',
                        fontSize: '11px',
                        fontWeight: 400,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        verticalAnchor: 'start' as any,
                      };

                      if (isFirst) return { ...base, textAnchor: 'start' };
                      if (isLast) return { ...base, textAnchor: 'end' };
                      return { ...base, textAnchor: 'middle' };
                    }}
                  />
                  <AxisLeft
                    numTicks={5}
                    scale={valueScale}
                    hideAxisLine
                    hideTicks
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    tickFormat={d => `${formatNumber(d as any, 2, 'floor', THOUSAND, 0)}%`}
                    left={8}
                    tickLabelProps={(_value, i, values) => {
                      const isFirst = i === 0;
                      const isLast = i === values[values.length - 1].index;

                      const base = {
                        fill: COLOR.NEUTRAL[60],
                        fontFamily: 'Pretendard Variable',
                        fontSize: '11px',
                        fontWeight: 400,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        textAnchor: 'start' as any,
                      };

                      if (isFirst) return { ...base, verticalAnchor: 'end' };
                      if (isLast) return { ...base, verticalAnchor: 'start' };
                      return { ...base, verticalAnchor: 'middle' };
                    }}
                    tickClassName="chart-tick-left"
                  />

                  <Area<IChartData>
                    data={chartData}
                    x={d => dateScale(new Date(d.date)) || 0}
                    y={d => valueScale(d.value) || 0}
                    strokeWidth={1}
                    stroke={COLOR.PRIMARY[60]}
                    curve={curveMonotoneX}
                  />
                  <LinePath<IChartData>
                    data={chartData}
                    x={d => dateScale(new Date(d.date)) || 0}
                    y={() => valueScale(avg) || 0}
                    stroke={COLOR.NEUTRAL[70]}
                    strokeWidth={1}
                  />
                  {textBgWidth > 0 && (
                    <Group>
                      <Bar
                        x={leftLabelWidth + 8}
                        y={valueScale(avg) - 32}
                        width={textBgWidth}
                        height={24}
                        rx={12}
                        fill={COLOR.NEUTRAL[30]}
                      />
                      <Text
                        x={leftLabelWidth + 8 + 8}
                        y={valueScale(avg) - 32 + 16}
                        fill={COLOR.NEUTRAL[100]}
                        fontSize={11}
                        fontWeight={400}
                        lineHeight={16}
                        fontFamily="Pretendard Variable"
                        textAnchor="start"
                        className="chart-avg-text"
                      >
                        {`${t('Avg')} ${formatNumber(avg)}%`}
                      </Text>
                    </Group>
                  )}
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
                </svg>
              );
            }}
          </ParentSize>
        </ChartWrapper>
        <LabelWrapper>
          <Label>
            <LabelDot />
            {t('Borrow APR')}
          </Label>
        </LabelWrapper>
        <ChartRangeWrapper>
          {ranges.map(range => (
            <ButtonChipSmall
              key={range.key}
              text={range.name}
              selected={selectedRange === range.key}
              onClick={() => {
                gaAction({
                  action: 'lending-asset-detail-chart-range',
                  buttonType: 'chip-small',
                  data: {
                    page: 'lending-detail',
                    component: 'supply-info-chart',
                    range: range.key,
                  },
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
  flex flex-col bg-neutral-10 rounded-12 min-h-354 gap-12
`;

const Header = tw.div`
  flex flex-col justify-between gap-16
  md:(flex-row gap-20)
`;

const HeaderTitleWrapper = tw.div`
  flex items-start
`;

const HeaderTitle = tw.div`
  font-b-14 text-primary-80 clickable
  md:(font-b-16)
`;

const HeaderValueWrapper = tw.div`
  flex flex-col items-end
`;

const HeaderValue = tw.div`
  font-m-20 text-neutral-100
  md:(font-m-24)
`;
const HeaderValueLabel = tw.div`
  font-r-14 text-neutral-60
`;

const LabelWrapper = tw.div`
  flex justify-end items-center
`;
const Label = tw.div`
  flex gap-8 items-center font-r-12 text-neutral-100
`;
const LabelDot = tw.div`
  w-6 h-6 rounded-full bg-primary-60
`;

const ChartOuterWrapper = tw.div`
  flex flex-col gap-12
`;

const ChartWrapper = tw.div`
  w-full h-220 flex-center relative
`;

const ChartRangeWrapper = tw.div`
  flex justify-end gap-4
`;
