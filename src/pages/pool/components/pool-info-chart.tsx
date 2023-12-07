import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { add, format, sub } from 'date-fns';
import { upperFirst } from 'lodash-es';
import tw, { styled } from 'twin.macro';

import { useGetChartQuery } from '~/api/api-server/pools/get-charts';

import { COLOR } from '~/assets/colors';

import { ButtonChipSmall } from '~/components/buttons';

import { formatFloat, formatNumber, formatNumberWithUnit } from '~/utils';
import {
  usePoolInfoChartSelectedRangeStore,
  usePoolInfoChartSelectedTabStore,
} from '~/states/components/chart/tab';
import { IChartData } from '~/types';

export const PoolInfoChart = () => {
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
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { VOLUME: volumeData, TVL: tvlData, FEE: feeData } = data || {};

  const chartDataRaw =
    selectedTab === 'volume' ? volumeData : selectedTab === 'tvl' ? tvlData : feeData;
  const chartDataPadding = {
    date: sub(new Date(chartDataRaw?.[0]?.date || new Date()), { days: 1 }),
    value: 0,
  } as IChartData;
  const chartDataPadding2 = {
    date: add(new Date(chartDataRaw?.[chartDataRaw?.length - 1]?.date || new Date()), { days: 1 }),
    value: 0,
  } as IChartData;

  const chartData = chartDataRaw ? [chartDataPadding, ...chartDataRaw, chartDataPadding2] : [];
  const totalValue = chartData?.reduce((acc, cur) => acc + cur.value, 0) || 0;

  return (
    <Wrapper>
      <Header>
        <HeaderTitleWrapper>
          {tabs.map(tab => (
            <HeaderTitle
              key={tab.key}
              selected={selectedTab === tab.key}
              onClick={() => selectTab(tab.key)}
            >
              {t(tab.name || 'Volume')}
            </HeaderTitle>
          ))}
        </HeaderTitleWrapper>
        <HeaderValueWrapper>
          <HeaderValue>${formatNumber(totalValue, 4)}</HeaderValue>
          <HeaderValueLabel>
            {t(`days volume`, { days: upperFirst(selectedRange) })}
          </HeaderValueLabel>
        </HeaderValueWrapper>
      </Header>

      <ChartOuterWrapper>
        <ChartWrapper>
          {chartData && (
            <Bar
              style={{ width: '100%', height: '270px' }}
              data={{
                datasets: [
                  {
                    data: chartData || [],
                    backgroundColor: COLOR.PRIMARY[80],
                    hoverBackgroundColor: COLOR.PRIMARY[100],
                    borderRadius: 4,
                    minBarLength: 2,
                    clip: {
                      left: 0,
                      top: 0,
                      right: selectedRange === '90' ? -6 : selectedRange === '180' ? -2 : -1,
                      bottom: 0,
                    },
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                  tooltip: { enabled: false },
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
                      unit: 'month',
                      displayFormats: {
                        month: 'MMM',
                      },
                    },
                    border: { display: false },
                    offset: false,
                    ticks: {
                      callback: (value: string | number) => {
                        const date = new Date(value);
                        const formattedDate = format(date, 'MMM');

                        return t(formattedDate);
                      },
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
                        if (Number(value) < 1) return `$${formatFloat(Number(value), 4)}`;
                        return `$${formatNumberWithUnit(Number(value))}`;
                      },
                      color: COLOR.NEUTRAL[60],
                      crossAlign: 'far',
                      font: {
                        family: 'Pretendard Variable',
                        size: 11,
                        lineHeight: '18px',
                      },
                    },
                    border: { display: false },
                    grid: { display: false },
                  },
                },
              }}
            />
          )}
        </ChartWrapper>
        <ChartRangeWrapper>
          {ranges.map(range => (
            <ButtonChipSmall
              key={range.key}
              text={range.name}
              selected={selectedRange === range.key}
              onClick={() => selectRange(range.key)}
            />
          ))}
        </ChartRangeWrapper>
      </ChartOuterWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 rounded-12 px-24 pt-20 pb-24 min-h-428 gap-20
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
  w-full min-h-270 flex-center relative
`;

const ChartRangeWrapper = tw.div`
  flex justify-end gap-4
`;
