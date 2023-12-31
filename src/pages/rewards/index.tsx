import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';

import { useGetRewardsInfoQuery } from '~/api/api-server/rewards/get-reward-info';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { TableMobileSkeleton } from '~/components/skeleton/table-mobile-skeleton';
import { TableSkeleton } from '~/components/skeleton/table-skeleton';
import { Table } from '~/components/tables';
import { TableMobile } from '~/components/tables/table-mobile';

import { useGAPage } from '~/hooks/analaystics/ga-page';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { RewardInfo } from './components/reward-info';
import { RewardsNetworkAlertPopup } from './components/reward-network-alert';
import { useTableRewards } from './hooks/components/use-table-rewards';

const RewardsPage = () => {
  return (
    <Suspense fallback={<_RewardSkeleton />}>
      <_RewardsPage />
    </Suspense>
  );
};

const _RewardsPage = () => {
  useGAPage();

  const { t } = useTranslation();

  const { isMD } = useMediaQuery();

  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { currentAddress } = useConnectedWallet(currentNetwork);
  const { data: waveInfo } = useGetRewardsInfoQuery(
    {
      params: {
        networkAbbr: currentNetworkAbbr,
      },
      queries: {
        walletAddress: currentAddress,
      },
    },
    {
      enabled: currentNetwork === NETWORK.THE_ROOT_NETWORK,
      staleTime: 20 * 1000,
    }
  );
  const { wave } = waveInfo || {};

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
      <Wrapper>
        <GnbWrapper>
          <Gnb />
        </GnbWrapper>
        <InnerWrapper>
          {currentNetwork === NETWORK.THE_ROOT_NETWORK && (
            <ContentWrapper>
              <Title>{t('Wave', { phase: wave || 0 })}</Title>
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
            </ContentWrapper>
          )}
        </InnerWrapper>
        <Footer />
      </Wrapper>
      {currentNetwork !== NETWORK.THE_ROOT_NETWORK && <RewardsNetworkAlertPopup />}
    </>
  );
};

const _RewardSkeleton = () => {
  const { isMD } = useMediaQuery();
  const { tableColumns, mobileTableColumn } = useTableRewards();
  return (
    <Wrapper>
      <GnbWrapper>
        <Gnb />
      </GnbWrapper>
      <InnerWrapper>
        <ContentWrapper>
          <SkeletonBase type="light" width={120} height={26} borderRadius={40} />
          <RewardSkeletonWrapper>
            <LeftWrapper>
              <RewardSkeleton>
                <SkeletonBase height={108} />
              </RewardSkeleton>
              <RewardSkeleton>
                <SkeletonBase height={108} />
              </RewardSkeleton>
            </LeftWrapper>
            <RightWrapper>
              <RewardSkeleton>
                <SkeletonBase height={108} />
              </RewardSkeleton>
              <RewardSkeleton>
                <SkeletonBase height={108} />
              </RewardSkeleton>
            </RightWrapper>
          </RewardSkeletonWrapper>
          <TableWrapper>
            {isMD ? (
              <TableSkeleton columns={tableColumns} ratio={[1, 3, 2, 2]} type="darker" />
            ) : (
              <TableMobileSkeleton columns={mobileTableColumn} type="darker" />
            )}
          </TableWrapper>
        </ContentWrapper>
      </InnerWrapper>
      <Footer />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative flex flex-col justify-between w-full h-full
`;

const GnbWrapper = tw.div`
  w-full absolute top-0 left-0 flex-center flex-col z-10
  h-72 mlg:(h-80)
`;

const InnerWrapper = tw.div`  
  flex flex-col items-center gap-24 pb-120 pt-112 px-20
  mlg:(pt-120)
`;

const ContentWrapper = tw.div`
  flex flex-col w-full max-w-840 gap-24
`;

const Title = tw.div`
  font-b-20 h-40 flex items-center text-neutral-100 px-20
  md:(font-b-24 px-0)
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

const RewardSkeletonWrapper = tw.div`
  w-full flex items-center gap-16
`;

const RewardSkeleton = tw.div`
  w-full
`;

const LeftWrapper = tw.div`
  w-full flex flex-col gap-16
  md:flex-row
`;

const RightWrapper = tw.div`
  w-full flex flex-col gap-16
  md:flex-row
`;

export default RewardsPage;
