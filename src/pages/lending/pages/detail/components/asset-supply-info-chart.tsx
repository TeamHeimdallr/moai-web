import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { debounce } from 'lodash-es';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';

import { THOUSAND } from '~/constants';

import { ButtonChipSmall } from '~/components/buttons';

import { supplyAprDataStatic } from '~/pages/lending/data';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { DATE_FORMATTER, formatNumber } from '~/utils';
import { useLendingAssetSupplyInfoChartSelectedRangeStore } from '~/states/components/chart/tab';

export const AssetSupplyInfoChart = () => {
  const { ref } = useGAInView({ name: 'lending-asset-supply-info-chart' });
  const { gaAction } = useGAAction();

  const { t } = useTranslation();

  const { selectedTab: selectedRange, selectTab: selectRange } =
    useLendingAssetSupplyInfoChartSelectedRangeStore();

  const ranges = [
    { key: '24h', name: t('24h') },
    { key: '7d', name: t('7d') },
    { key: '14d', name: t('14d') },
    { key: 'all', name: t('All') },
  ];

  const chartData = supplyAprDataStatic;
  const max = Math.max(...chartData.map(data => data.value));
  const min = Math.min(...chartData.map(data => data.value));
  const avg =
    chartData && chartData.length > 0
      ? (chartData.reduce((acc, cur) => acc + cur.value, 0) || 0) / chartData.length
      : 0;

  const defaultData = chartData[chartData.length - 1];

  const data = {
    labels: chartData.map(data => data.date),
    datasets: [
      {
        label: 'Supply APR',
        data: chartData.map(data => data.value),
        fill: false,
        borderColor: '#A3B6FF',
        borderWidth: 1,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pointStyle: false as any,
        tension: 0.1,
      },
      {
        label: `Avg ${formatNumber(avg, 2, 'floor', 2)}%`,
        data: chartData.map(_ => avg),
        fill: false,
        borderColor: '#ABB0C5',
        borderWidth: 1,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pointStyle: false as any,
        tension: 0.1,
      },
    ],
  };

  const [value, setValue] = useState<number>(defaultData.value);
  const [dateLabel, setDateLabel] = useState<Date>(new Date(defaultData.date));

  return (
    <Wrapper ref={ref}>
      <Header>
        <HeaderTitleWrapper>
          <HeaderTitle>{t('Supply APR')}</HeaderTitle>
        </HeaderTitleWrapper>
        <HeaderValueWrapper>
          <HeaderValue>${formatNumber(value, 2, 'floor', 2)}</HeaderValue>
          <HeaderValueLabel>{format(new Date(dateLabel), DATE_FORMATTER.HALF)}</HeaderValueLabel>
        </HeaderValueWrapper>
      </Header>

      <LabelWrapper>
        <Label>
          <LabelDot />
          {t('Supply APR')}
        </Label>
      </LabelWrapper>

      <ChartOuterWrapper>
        <ChartWrapper>
          {chartData && (
            <Line
              style={{ width: '100%', height: '220px' }}
              onMouseEnter={() => {
                let tooltipEl = document.getElementById('chartjs-tooltip');

                if (!tooltipEl) {
                  tooltipEl = document.createElement('div');
                  tooltipEl.id = 'chartjs-tooltip';
                  const root = document.getElementById('root');

                  root?.appendChild(tooltipEl);
                }
              }}
              onMouseLeave={() => {
                const tooltipEl = document.getElementById('chartjs-tooltip');
                tooltipEl?.remove();
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                  tooltip: {
                    enabled: false,
                    intersect: false,
                    external: context => {
                      const tooltipEl = document.getElementById('chartjs-tooltip');
                      const tooltipModel = context.tooltip;

                      if (!tooltipEl) {
                        return;
                      }

                      const position = context.chart.canvas.getBoundingClientRect();

                      tooltipEl.style.position = 'absolute';
                      tooltipEl.style.left =
                        position.left + window.scrollX + tooltipModel.caretX + 'px';
                      tooltipEl.style.top = position.top + window.scrollY + 'px';
                      tooltipEl.style.height = '200px';
                      tooltipEl.style.width = '1px';
                      tooltipEl.style.backgroundImage = `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='white' stroke-width='1' stroke-dasharray='2%2c 2' stroke-dashoffset='0' stroke-linecap='butt'/%3e%3c/svg%3e")`;
                    },

                    callbacks: {
                      beforeBody: debounce(context => {
                        const dataIndex = context?.[0]?.dataIndex || 0;
                        const { date, value } = chartData[dataIndex];

                        setValue(value);
                        setDateLabel(new Date(date));
                      }, 100),
                    },
                  },
                  legend: { display: false },
                },
                parsing: {
                  xAxisKey: 'date',
                  yAxisKey: 'value',
                },
                layout: {
                  autoPadding: false,
                  padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                  },
                },
                scales: {
                  x: {
                    type: 'time',
                    time: {
                      unit: selectedRange === '24h' ? 'hour' : 'day',
                      displayFormats: {
                        hour: 'HH',
                        month: 'MMM',
                        day: 'dd',
                      },
                    },
                    border: { display: false },
                    offset: false,
                    ticks: {
                      callback: (value: string | number) => {
                        const date = new Date(value);

                        if (selectedRange === '24h') return format(date, 'HH');
                        return format(date, 'MMM dd');
                      },
                      maxTicksLimit: 4,
                      labelOffset: 18,
                      includeBounds: true,
                      color: COLOR.NEUTRAL[60],
                      font: {
                        family: 'Pretendard Variable',
                        size: 11,
                        lineHeight: '18px',
                      },
                    },
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    type: 'linear',
                    ticks: {
                      callback: (value: string | number) => {
                        return `${formatNumber(Number(value), 2, 'floor', THOUSAND, 0)}%`;
                      },
                      color: COLOR.NEUTRAL[60],
                      crossAlign: 'far',
                      font: {
                        family: 'Pretendard Variable',
                        size: 11,
                        lineHeight: '18px',
                      },
                      maxTicksLimit: 4,
                    },
                    border: { display: false },
                    grid: { display: false },
                    suggestedMax: max + 2,
                    suggestedMin: Math.max(min - 2, 0),
                  },
                },
              }}
              data={data}
            />
          )}
        </ChartWrapper>
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
  font-r-12 text-neutral-60
`;

const LabelWrapper = tw.div`
  flex justify-end items-center
`;
const Label = tw.div`
  flex gap-8 items-center font-r-12 text-neutral-100
`;
const LabelDot = tw.div`
  w-6 h-6 rounded-full bg-[#A3B6FF]
`;

const ChartOuterWrapper = tw.div`
  flex flex-col gap-12
`;

const ChartWrapper = tw.div`
  w-full min-h-220 flex-center relative
`;

const ChartRangeWrapper = tw.div`
  flex justify-end gap-4
`;
