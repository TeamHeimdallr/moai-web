import { useTranslation } from 'react-i18next';
import { css } from '@emotion/react';
import { format } from 'date-fns';
import tw, { styled } from 'twin.macro';

import { useGetWaveQuery } from '~/api/api-server/rewards/get-waves';

import { COLOR } from '~/assets/colors';
import { IconTime } from '~/assets/icons';

import { Table } from '~/components/tables';
import { TableMobile } from '~/components/tables/table-mobile';

import { useGAPage } from '~/hooks/analaystics/ga-page';
import { useForceNetwork, useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { getNetworkAbbr } from '~/utils';
import { NETWORK, POPUP_ID } from '~/types';

import { useTableRewards } from '../hooks/components/use-table-rewards-waveN';

const RewardWaveN = () => {
  useGAPage();
  useForceNetwork({
    popupId: POPUP_ID.REWARD_NETWORK_ALERT,
    targetNetwork: [NETWORK.THE_ROOT_NETWORK],
    changeTargetNetwork: NETWORK.THE_ROOT_NETWORK,
    callCallbackUnmounted: true,
  });

  const { isMD } = useMediaQuery();

  const {
    tableColumns,
    tableData,
    mobileTableColumn,
    mobileTableData,
    hasNextPage,
    fetchNextPage,
  } = useTableRewards();

  const { selectedNetwork } = useNetwork();
  const currentNetworkAbbr = getNetworkAbbr(selectedNetwork);

  const { t, i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const { data } = useGetWaveQuery(
    { params: { networkAbbr: currentNetworkAbbr } },
    {
      enabled: selectedNetwork === NETWORK.THE_ROOT_NETWORK,
      staleTime: 20 * 1000,
    }
  );

  const { currentWave } = data || {};
  const { lastUpdated } = currentWave || {};

  const date = new Date(lastUpdated || new Date());
  const formattedDate = isKo
    ? `${format(date, 'yyyy-MM-dd, hh:mm:ss a O')}`
    : `${format(date, 'MM-dd-yyyy, hh:mm:ss a O')}`;

  return (
    <TableOuterWrapper>
      <Timestamp>
        <IconTime width={20} height={20} fill={COLOR.NEUTRAL[40]} />
        {`${t('Last update')}: ${formattedDate}`}
      </Timestamp>
      <TableWrapper>
        {isMD ? (
          <Table
            data={tableData}
            columns={tableColumns}
            ratio={['54px', '156px', 1, 1, 1, '44px', 1]}
            type="darker"
            hasMore={hasNextPage}
            handleMoreClick={() => fetchNextPage()}
          />
        ) : (
          <TableMobile
            data={mobileTableData}
            columns={mobileTableColumn}
            type="darker"
            hasMore={hasNextPage}
            handleMoreClick={fetchNextPage}
          />
        )}
      </TableWrapper>
    </TableOuterWrapper>
  );
};

const TableOuterWrapper = tw.div`
  flex flex-col gap-8
`;
const Timestamp = tw.div`
  w-full flex items-center justify-end gap-4 font-r-12 text-neutral-60
`;

const TableWrapper = styled.div(() => [
  tw`
    flex flex-col
  `,
  css`
    & .row-my-reward {
      border-radius: 8px;
      border: 1px solid #f5ff83;
      background: #2b2e44;

      padding: 19px 23px;
    }
  `,
]);

export default RewardWaveN;
