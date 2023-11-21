import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { upperFirst } from 'lodash-es';
import tw, { styled } from 'twin.macro';

import { useGetChartQuery } from '~/api/api-server/pools/get-charts';

import { COLOR } from '~/assets/colors';

import { ButtonChipSmall } from '~/components/buttons';

import { formatNumber } from '~/utils';
import {
  usePoolInfoChartSelectedRangeStore,
  usePoolInfoChartSelectedTabStore,
} from '~/states/components/chart/tab';

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

  const sumValues = (data: { value: number }[]) => data.reduce((acc, cur) => acc + cur.value, 0);

  const chartData =
    selectedTab === 'volume' ? volumeData : selectedTab === 'tvl' ? tvlData : feeData || [];
  const totalValue =
    selectedTab === 'volume'
      ? sumValues(volumeData || [])
      : selectedTab === 'tvl'
      ? sumValues(tvlData || [])
      : selectedTab === 'fees'
      ? sumValues(feeData || [])
      : 0;

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
          <Bar
            style={{ width: '100%', height: '270px' }}
            data={{
              datasets: [
                {
                  data: chartData || [],
                  backgroundColor: COLOR.PRIMARY[80],
                  borderRadius: 4,
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
                  offset: true,
                  ticks: {
                    callback: (value: string | number) => {
                      const date = new Date(value);
                      const formattedDate = format(date, 'MMM');

                      return t(formattedDate);
                    },
                    color: COLOR.NEUTRAL[60],
                  },
                  grid: {
                    display: false,
                    offset: true,
                  },
                },
                y: {
                  type: 'linear',
                  ticks: {
                    callback: (value: string | number) => `$${formatNumber(value, 4)}`,
                    color: COLOR.NEUTRAL[60],
                    crossAlign: 'far',
                  },
                  border: { display: false },
                  grid: { display: false },
                },
              },
            }}
          />
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
  flex justify-between gap-16
`;

const HeaderTitleWrapper = tw.div`
  flex gap-24 items-start
`;

interface HeaderTitleProps {
  selected?: boolean;
}
const HeaderTitle = styled.div<HeaderTitleProps>(({ selected }) => [
  tw`
    font-b-20 text-neutral-60 clickable
  `,
  selected && tw`text-primary-60`,
]);

const HeaderValueWrapper = tw.div`
  flex flex-col items-end
`;

const HeaderValue = tw.div`
  font-m-24 text-neutral-100
`;
const HeaderValueLabel = tw.div`
  font-r-14 text-neutral-60
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
