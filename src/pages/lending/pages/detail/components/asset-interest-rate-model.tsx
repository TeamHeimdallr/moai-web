import { MouseEvent, TouchEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
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
import { Address } from 'viem';

import { useGetInterestRateModel } from '~/api/api-contract/_evm/lending/get-interest-rate-model';
import { useGetMarket } from '~/api/api-contract/_evm/lending/get-market';
import { useGetLendingIRateModelChartQuery } from '~/api/api-server/lending/get-charts-irate-model';

import { COLOR } from '~/assets/colors';

import { THOUSAND } from '~/constants';

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

  const { network, address } = useParams();
  const { market } = useGetMarket({
    marketAddress: address as Address,
  });

  const { supplyApy, borrowApy } = market || {};

  const { utilizationRate: utilizationRateData, params } = useGetInterestRateModel({
    marketAddress: address as Address,
  });

  const utilizationRate = 100 * utilizationRateData;
  const kink = params.kink;

  const optimalUtilizationRate = (kink || 0) * 100;

  const borrowApyNum = Number(borrowApy);
  const supplyApyNum = Number(supplyApy);

  const utilizationRateNum = Number(utilizationRate || 0);
  const formattedUtilizationRate =
    utilizationRateNum < 0.01 ? '< 0.01%' : `${formatNumber(utilizationRateNum)}%`;

  const chartRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [widthData, setWidthData] = useState<WidthData>({
    leftLabel: 0,
    currentTextBg: 0,
    optimalTextBg: 0,
  });

  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const { tooltipData, tooltipLeft, showTooltip, hideTooltip } = useTooltip();

  // const chartDataSupply = interestRateModelSupplyData;
  // const chartDataBorrow = interestRateModelBorrowData;
  const { data } = useGetLendingIRateModelChartQuery(
    {
      params: {
        networkAbbr: network || 'trn',
        marketAddress: address ?? '0x0',
      },
    },
    {
      staleTime: 1000 * 60,
      enabled: !!network && !!address,
    }
  );
  const { SUPPLY: chartDataSupply, BORROW: chartDataBorrow } = data || {};

  useEffect(() => {
    const wrapper = chartRef.current;
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

    setWidthData({
      leftLabel: leftLabelMax,
      currentTextBg: currentTexBgtMax,
      optimalTextBg: optimalTextBgMax,
    });
  }, [chartDataSupply, chartDataBorrow, isKo]);

  return (
    <Wrapper ref={ref}>
      <Header ref={headerRef}>
        <HeaderTitleWrapper>
          <HeaderTitle>{t('Interest rate model')}</HeaderTitle>
        </HeaderTitleWrapper>
        <HeaderValueOuterWrapper>
          <HeaderValueWrapper>
            <HeaderValue id="header-value-utilization">{formattedUtilizationRate}</HeaderValue>
            <HeaderValueLabel>{t('Utilization rate')}</HeaderValueLabel>
          </HeaderValueWrapper>
          <HeaderValueWrapper>
            <HeaderValue id="header-value-borrow-apr">{`${formatNumber(
              borrowApyNum
            )}%`}</HeaderValue>
            <HeaderValueLabel>{t('Borrow APR')}</HeaderValueLabel>
          </HeaderValueWrapper>
          <HeaderValueWrapper>
            <HeaderValue id="header-value-supply-apr">{`${formatNumber(
              supplyApyNum
            )}%`}</HeaderValue>
            <HeaderValueLabel>{t('Supply APR')}</HeaderValueLabel>
          </HeaderValueWrapper>
        </HeaderValueOuterWrapper>
      </Header>

      <ChartOuterWrapper>
        <ChartWrapper ref={chartRef}>
          <ParentSize debounceTime={50}>
            {({ width, height }) => {
              if (!chartDataSupply || !chartDataBorrow) return;
              if (!chartDataSupply.length || !chartDataBorrow.length) return;

              const bisectX = bisector<IChartXYData, number>(d => d.x).left;
              const getX = (d: IChartXYData) => d.x;

              const xMax = Math.max(...chartDataSupply.map(d => d.x));
              const yMax = Math.max(...chartDataSupply.map(d => d.y));
              const xMaxBorrow = Math.max(...chartDataBorrow.map(d => d.x));
              const yMaxBorrow = Math.max(...chartDataBorrow.map(d => d.y));

              const xScale = scaleLinear({
                range: [widthData.leftLabel + 8, width],
                domain: [0, xMax],
              });

              const yScale = scaleLinear<number>({
                range: [height - 20, 0],
                domain: [0, Math.max(yMax, yMaxBorrow)],
              });

              const xScaleBorrow = scaleLinear({
                range: [widthData.leftLabel + 8, width],
                domain: [0, xMaxBorrow],
              });

              const yScaleBorrow = scaleLinear<number>({
                range: [height - 20, 0],
                domain: [0, yMaxBorrow + 10],
              });

              const changeHeader = (d: IChartXYData | undefined) => {
                const header = headerRef.current;
                if (!header) return;

                const headerValueUtilizationDom = header.querySelector('#header-value-utilization');
                const headerValueBorowAprDom = header.querySelector('#header-value-borrow-apr');
                const headerValueSupplyAprDom = header.querySelector('#header-value-supply-apr');

                if (
                  !headerValueUtilizationDom ||
                  !headerValueBorowAprDom ||
                  !headerValueSupplyAprDom
                )
                  return;

                if (d) {
                  const formattedValue =
                    d.y < 0.01 ? '< 0.01%' : `${formatNumber(d.x, 2, 'floor', THOUSAND, 2)}%`;
                  headerValueUtilizationDom.innerHTML = formattedValue;

                  const currentBorrowApr =
                    chartDataBorrow?.find(data => data.x === d.x)?.y || borrowApyNum;
                  const currentSupplyApr =
                    chartDataSupply?.find(data => data.x === d.x)?.y || supplyApyNum;
                  headerValueBorowAprDom.innerHTML = `${formatNumber(currentBorrowApr)}%`;
                  headerValueSupplyAprDom.innerHTML = `${formatNumber(currentSupplyApr)}%`;
                } else {
                  console.log(borrowApyNum, supplyApyNum);
                  headerValueUtilizationDom.innerHTML = formattedUtilizationRate;
                  headerValueBorowAprDom.innerHTML = `${formatNumber(borrowApyNum)}%`;
                  headerValueSupplyAprDom.innerHTML = `${formatNumber(supplyApyNum)}%`;
                }
              };

              const handleTooltip = (
                event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>
              ) => {
                const { x } = localPoint(event) || { x: 0 };
                const x0 = xScale.invert(x);
                const index = bisectX(chartDataSupply, x0, 1);
                const d0 = chartDataSupply[index - 1];
                const d1 = chartDataSupply[index];
                let d = d0;
                if (d1 && getX(d1)) {
                  d =
                    x0.valueOf() - getX(d0).valueOf() > getX(d1).valueOf() - x0.valueOf() ? d1 : d0;
                }
                showTooltip({
                  tooltipData: d,
                  tooltipLeft: x,
                  tooltipTop: yScale(d.y),
                });

                changeHeader(d);
              };

              const currentUtilizationRateX = xScale.invert(xScale(utilizationRateNum));
              const currentUtilizationRateIdx = bisectX(
                chartDataSupply,
                currentUtilizationRateX,
                0,
                200
              );
              const currentUtilizationRateData = chartDataSupply[currentUtilizationRateIdx];
              const currentUtilizationRateY = yScale(currentUtilizationRateData.y);

              const currentTextXScale = xScale(utilizationRateNum);
              const currentTextX =
                utilizationRateNum > 50
                  ? currentTextXScale - widthData.currentTextBg - 4
                  : currentTextXScale + 4;

              const optimalUtilizationRateX = xScale.invert(xScale(optimalUtilizationRate));
              const optimalUtilizationRateIdx = bisectX(
                chartDataSupply,
                optimalUtilizationRateX,
                0,
                200
              );
              const optimalUtilizationRateData = chartDataSupply[optimalUtilizationRateIdx];
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
                    data={chartDataSupply}
                    x={d => xScale(d.x) || 0}
                    y={d => yScale(d.y) || 0}
                    strokeWidth={1}
                    stroke={COLOR.PRIMARY[60]}
                    curve={curveMonotoneX}
                  />
                  <Area<IChartXYData>
                    data={chartDataBorrow}
                    x={d => xScaleBorrow(d.x) || 0}
                    y={d => yScaleBorrow(d.y) || 0}
                    strokeWidth={1}
                    stroke={'#A3B6FF'}
                    curve={curveMonotoneX}
                  />
                  <Group>
                    <Line
                      from={{
                        x: xScale(utilizationRateNum),
                        y: 24,
                      }}
                      to={{
                        x: xScale(utilizationRateNum),
                        y: currentUtilizationRateY,
                      }}
                      stroke={COLOR.GREEN[50]}
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
                      {`${t('Current')} ${formatNumber(utilizationRate, 2, 'floor', THOUSAND, 2)}%`}
                    </Text>
                  </Group>
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
                      stroke={COLOR.GREEN[50]}
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
                      {`${t('Optimal')} ${formatNumber(optimalUtilizationRate)}%`}
                    </Text>
                  </Group>
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
        <LabelOuterWrapper>
          <LabelWrapper>
            <Label>
              <LabelDot style={{ backgroundColor: COLOR.GREEN[50] }} />
              {t('Utilization rate')}
            </Label>
          </LabelWrapper>

          <LabelWrapper>
            <Label>
              <LabelDot style={{ backgroundColor: '#A3B6FF' }} />
              {t('Borrow APR')}
            </Label>
          </LabelWrapper>
          <LabelWrapper>
            <Label>
              <LabelDot />
              {t('Supply APR')}
            </Label>
          </LabelWrapper>
        </LabelOuterWrapper>
      </ChartOuterWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 rounded-12 min-h-368 gap-20 px-24 pt-20 pb-24
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

const HeaderValueOuterWrapper = tw.div`
  flex gap-20
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

const LabelOuterWrapper = tw.div`
  flex gap-24 items-center justify-end
`;

const LabelWrapper = tw.div`
  flex justify-end items-center
`;
const Label = tw.div`
  flex gap-8 items-center font-r-12 leading-18 text-neutral-100
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
