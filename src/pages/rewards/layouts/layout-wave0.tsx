import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';

import { Table } from '~/components/tables';
import { TableMobile } from '~/components/tables/table-mobile';

import { useGAPage } from '~/hooks/analaystics/ga-page';
import { useForceNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { NETWORK, POPUP_ID } from '~/types';

import { RewardInfo } from '../components/reward-info-wave0';
import { useTableRewards } from '../hooks/components/use-table-rewards-wave0';

const RewardWave0 = () => {
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

  return (
    <>
      <RewardInfo />
      <TableWrapper>
        {isMD ? (
          <Table
            data={tableData}
            columns={tableColumns}
            ratio={[1, 3, 2, 2]}
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
    </>
  );
};

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

export default RewardWave0;
