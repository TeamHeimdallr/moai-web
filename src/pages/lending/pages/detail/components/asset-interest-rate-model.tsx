import { MouseEvent, TouchEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { Group } from '@visx/group';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { scaleLinear } from '@visx/scale';
import { Area, Bar, Line } from '@visx/shape';
import { Text } from '@visx/text';
import { useTooltip } from '@visx/tooltip';
import { bisector } from '@visx/vendor/d3-array';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconDot } from '~/assets/icons';

import { THOUSAND, TRILLION } from '~/constants';

import { interestRateModelData } from '~/pages/lending/data';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { formatNumber } from '~/utils';
import { IChartXYData } from '~/types';

interface WidthData {
  leftLabel: number;
  currentTextBg: number;
  optimalTextBg: number;
}
export const AsseInterestModel = () => {
  const { ref } = useGAInView({ name: 'lending-asset-interest-model' });

  // TODO: connect api
  const utilizationRate = 30.25;
  const optimalUtilizationRate = 75;
  const formattedUtilizationRate =
    utilizationRate < 0.01
      ? '< 0.01%'
      : `${formatNumber(utilizationRate, 2, 'floor', THOUSAND, 2)}%`;
  const apr = 1.39;
  const apyType: string = 'variable'; // 'stable' | 'variable';
  const utilizationAmount = 4385609020.29;

  const chartRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [widthData, setWidthData] = useState<WidthData>({
    leftLabel: 0,
    currentTextBg: 0,
    optimalTextBg: 0,
  });
  const [rate, setRate] = useState<number | undefined>(0);

  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const { tooltipData, tooltipLeft, showTooltip, hideTooltip } = useTooltip();

  const chartData = interestRateModelData;

  const wrapper = chartRef.current;
  useEffect(() => {
    if (!wrapper) return;

    const leftTickLabels = wrapper.querySelectorAll('.chart-tick-left svg');
    const leftLabelMax = (Object.values(leftTickLabels) as SVGSVGElement[])
      .map(element => Math.ceil(element?.getBBox()?.width ?? 0))
      .reduce((res, curr) => (curr >= res ? curr : res), 0);

    const currentText = wrapper.querySelector('.chart-avg-text-current');
    const currentTextWidth = currentText?.getBoundingClientRect().width || 0;
    const currentTexBgtMax = Math.max(Math.ceil(currentTextWidth) + 16, 60);

    const optimalText = wrapper.querySelector('.chart-avg-text-optimal');
    const optimalTextWidth = optimalText?.getBoundingClientRect().width || 0;
    const optimalTextBgMax = Math.max(Math.ceil(optimalTextWidth) + 16, 60);

    console.log({
      leftLabelMax,
      currentTexBgtMax,
      optimalTextBgMax,
    });
    setWidthData({
      leftLabel: leftLabelMax,
      currentTextBg: currentTexBgtMax,
      optimalTextBg: optimalTextBgMax,
    });
  }, [wrapper, chartData, isKo]);

  return (
    <Wrapper ref={ref}>
      <Header ref={headerRef}>
        <HeaderTitleWrapper>
          <HeaderTitle>{t('Interest rate model')}</HeaderTitle>
        </HeaderTitleWrapper>
        <HeaderValueWrapper>
          <HeaderValue id="header-value">{formattedUtilizationRate}</HeaderValue>
          <HeaderValueLabel>{t('Utilization rate')}</HeaderValueLabel>
        </HeaderValueWrapper>
      </Header>

      <InnerWrapper>
        <ChartOuterWrapper>
          <LabelOuterWrapper>
            <LabelWrapper>
              <Label>
                <LabelDot />
                {`${t('Borrow APR')}, ${t(`${apyType}-small`)}`}
              </Label>
            </LabelWrapper>
            <LabelWrapper>
              <Label>
                <LabelDot style={{ backgroundColor: '#A3B6FF' }} />
                {t('Utilization rate')}
              </Label>
            </LabelWrapper>
          </LabelOuterWrapper>
          <ChartWrapper ref={chartRef}>
            <ParentSize debounceTime={50}>
              {({ width, height }) => {
                if (!chartData) return;

                const bisectX = bisector<IChartXYData, number>(d => d.x).left;
                const getX = (d: IChartXYData) => d.x;

                const xMax = Math.max(...chartData.map(d => d.x));
                const yMax = Math.max(...chartData.map(d => d.y));

                const xScale = scaleLinear({
                  range: [widthData.leftLabel + 8, width],
                  domain: [0, xMax],
                });

                const yScale = scaleLinear<number>({
                  range: [height - 20, 0],
                  domain: [0, yMax + 10],
                });

                const changeHeader = (d: IChartXYData | undefined) => {
                  const header = headerRef.current;
                  if (!header) return;

                  const headerValueDom = header.querySelector('#header-value');

                  if (d) {
                    const formattedValue =
                      d.y < 0.01 ? '< 0.01%' : `${formatNumber(d.y, 2, 'floor', THOUSAND, 2)}%`;
                    if (headerValueDom) {
                      headerValueDom.innerHTML = formattedValue;
                    }
                  } else {
                    if (headerValueDom) {
                      headerValueDom.innerHTML = formattedUtilizationRate;
                    }
                  }
                };

                const handleTooltip = (
                  event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>
                ) => {
                  const { x } = localPoint(event) || { x: 0 };
                  const x0 = xScale.invert(x);
                  const index = bisectX(chartData, x0, 1);
                  const d0 = chartData[index - 1];
                  const d1 = chartData[index];
                  let d = d0;
                  if (d1 && getX(d1)) {
                    d =
                      x0.valueOf() - getX(d0).valueOf() > getX(d1).valueOf() - x0.valueOf()
                        ? d1
                        : d0;
                  }
                  showTooltip({
                    tooltipData: d,
                    tooltipLeft: x,
                    tooltipTop: yScale(d.y),
                  });

                  changeHeader(d);
                  setRate(d.y);
                };

                const currentUtilizationRateX = xScale.invert(xScale(utilizationRate));
                const currentUtilizationRateIdx = bisectX(chartData, currentUtilizationRateX, 1);
                const currentUtilizationRateData = chartData[currentUtilizationRateIdx];
                const currentUtilizationRateY = yScale(currentUtilizationRateData.y);

                const currentTextXScale = xScale(utilizationRate);
                const currentTextX =
                  utilizationRate > 50
                    ? currentTextXScale - widthData.currentTextBg - 4
                    : currentTextXScale + 4;

                const optimalUtilizationRateX = xScale.invert(xScale(optimalUtilizationRate));
                const optimalUtilizationRateIdx = bisectX(chartData, optimalUtilizationRateX, 1);
                const optimalUtilizationRateData = chartData[optimalUtilizationRateIdx];
                const optimalUtilizationRateY = yScale(optimalUtilizationRateData.y);

                const optimalTextXScale = xScale(optimalUtilizationRate);
                const optimalTextX =
                  optimalUtilizationRate > 50
                    ? optimalTextXScale - widthData.optimalTextBg - 4
                    : optimalTextXScale + 4;

                return (
                  <svg width={width} height={height}>
                    <AxisBottom
                      numTicks={5}
                      scale={xScale}
                      hideAxisLine
                      hideTicks
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      tickFormat={d => `${formatNumber(d as any, 0, 'floor', THOUSAND, 0)}%`}
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
                      tickClassName="chart-tick-bottom"
                    />
                    <AxisLeft
                      numTicks={4}
                      scale={yScale}
                      hideAxisLine
                      hideTicks
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      tickFormat={d => `${formatNumber(d as any, 0, 'floor', THOUSAND, 0)}%`}
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

                    <Area<IChartXYData>
                      data={chartData}
                      x={d => xScale(d.x) || 0}
                      y={d => yScale(d.y) || 0}
                      strokeWidth={1}
                      stroke={COLOR.PRIMARY[60]}
                      curve={curveMonotoneX}
                    />
                    {widthData.currentTextBg > 0 && (
                      <Group>
                        <Line
                          from={{
                            x: xScale(utilizationRate),
                            y: 24,
                          }}
                          to={{
                            x: xScale(utilizationRate),
                            y: currentUtilizationRateY,
                          }}
                          stroke="#A3B6FF"
                          strokeWidth={1}
                          pointerEvents="none"
                          strokeDasharray="2,2"
                        />
                        <Bar
                          x={currentTextX}
                          y={24}
                          width={widthData.currentTextBg}
                          height={24}
                          rx={12}
                          fill={COLOR.NEUTRAL[30]}
                        />
                        <Text
                          x={currentTextX + 8}
                          y={24 + 12 + 4}
                          fill={COLOR.NEUTRAL[100]}
                          fontSize={11}
                          fontWeight={400}
                          lineHeight={16}
                          fontFamily="Pretendard Variable"
                          textAnchor="start"
                          className="chart-avg-text-current"
                        >
                          {`${t('Current')} ${formatNumber(
                            utilizationRate,
                            2,
                            'floor',
                            THOUSAND,
                            2
                          )}%`}
                        </Text>
                      </Group>
                    )}
                    {widthData.optimalTextBg > 0 && (
                      <Group>
                        <Line
                          from={{
                            x: xScale(optimalUtilizationRate),
                            y: height - 20 - 1 - 130,
                          }}
                          to={{
                            x: xScale(optimalUtilizationRate),
                            y: optimalUtilizationRateY,
                          }}
                          stroke="#A3B6FF"
                          strokeWidth={1}
                          pointerEvents="none"
                          strokeDasharray="2,2"
                        />
                        <Bar
                          x={optimalTextX}
                          y={height - 20 - 1 - 130}
                          width={widthData.optimalTextBg}
                          height={24}
                          rx={12}
                          fill={COLOR.NEUTRAL[30]}
                        />
                        <Text
                          x={optimalTextX + 8}
                          y={height - 20 - 1 - 130 + 12 + 4}
                          fill={COLOR.NEUTRAL[100]}
                          fontSize={11}
                          fontWeight={400}
                          lineHeight={16}
                          fontFamily="Pretendard Variable"
                          textAnchor="start"
                          className="chart-avg-text-optimal"
                        >
                          {`${t('Optimal')} ${formatNumber(
                            optimalUtilizationRate,
                            2,
                            'floor',
                            THOUSAND,
                            2
                          )}%`}
                        </Text>
                      </Group>
                    )}
                    {width && height && (
                      <Bar
                        x={widthData.leftLabel + 8}
                        y={0}
                        width={width - widthData.leftLabel - 8}
                        height={height - 20}
                        fill="transparent"
                        rx={14}
                        onTouchStart={handleTooltip}
                        onTouchMove={handleTooltip}
                        onMouseMove={handleTooltip}
                        onMouseOut={() => {
                          hideTooltip();
                          changeHeader(undefined);
                          setRate(undefined);
                        }}
                      />
                    )}
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
        </ChartOuterWrapper>

        <InfoWrapper>
          <InfoInnerWrapper>
            <Bullet>
              <IconDot width={4} height={4} fill={COLOR.NEUTRAL[80]} />
            </Bullet>
            <InfoText>
              {t('Utilization rate')} : <InfoTextBold>{formattedUtilizationRate}</InfoTextBold>
            </InfoText>
          </InfoInnerWrapper>
          <InfoInnerWrapper>
            <Bullet>
              <IconDot width={4} height={4} fill={COLOR.NEUTRAL[80]} />
            </Bullet>
            <InfoText>
              {t('borrow-amount-to-reach-utilization', {
                rate: formatNumber(rate || utilizationRate, 2, 'floor', THOUSAND, 2),
              })}{' '}
              :{' '}
              <InfoTextBold>{`$${formatNumber(
                utilizationAmount,
                2,
                'floor',
                TRILLION,
                2
              )}`}</InfoTextBold>
            </InfoText>
          </InfoInnerWrapper>
          <InfoInnerWrapper>
            <Bullet>
              <IconDot width={4} height={4} fill={COLOR.NEUTRAL[80]} />
            </Bullet>
            <InfoText>
              {`${t('Borrow APR')}, ${t(`${apyType}-small`)}`} :{' '}
              <InfoTextBold>{`${formatNumber(apr, 2, 'floor', THOUSAND, 2)}%`}</InfoTextBold>
            </InfoText>
          </InfoInnerWrapper>
        </InfoWrapper>
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 rounded-12 min-h-482 gap-20 px-24 pt-20 pb-24
`;

const InnerWrapper = tw.div`
  flex flex-col gap-40
`;

const Header = tw.div`
  flex flex-col justify-between gap-16
  md:(flex-row gap-20)
`;

const HeaderTitleWrapper = tw.div`
  flex items-start
`;

const HeaderTitle = tw.div`
  font-b-18 text-neutral-100
  md:(font-b-20)
`;

const HeaderValueWrapper = tw.div`
  flex flex-col items-end
`;

const HeaderValue = tw.div`
  font-m-20 text-neutral-100
  md:(font-m-24)
`;
const HeaderValueLabel = tw.div`
  font-r-12 text-neutral-60
`;

const LabelOuterWrapper = tw.div`
  flex gap-24 items-center justify-end
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

const InfoWrapper = tw.div`
  flex flex-col gap-4
`;
const InfoInnerWrapper = tw.div`
  flex items-center
`;
const Bullet = tw.div`
  flex-center px-8 flex-shrink-0
`;
const InfoText = tw.div`
  font-r-14 text-neutral-80
`;
const InfoTextBold = tw.span`
  font-m-14 text-neutral-100
`;
