import { useNavigate, useParams } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { Breadcrumb } from '~/components/breadcrumb';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { useGAPage } from '~/hooks/analaystics/ga-page';
import { usePopup } from '~/hooks/components';
import { useForceNetwork, useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkAbbr } from '~/utils';
import { POPUP_ID } from '~/types';

import { PoolHeader } from '../../components/pool-header';

import { Voting } from './components/voting';
import { VotingSlots } from './components/voting-slots';

const FeeVotingPage = () => {
  useGAPage();
  useForceNetwork({
    enableParamsNetwork: true,
    enableChangeAndRedirect: true,
    callCallbackUnmounted: true,
  });
  const navigate = useNavigate();

  const { network, id } = useParams();
  const { selectedNetwork } = useNetwork();
  const currentNetwork = selectedNetwork || network;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { opened } = usePopup(POPUP_ID.WALLET_ALERT);
  const { data: poolData } = useGetPoolQuery(
    { params: { networkAbbr: currentNetworkAbbr, poolId: id || '' } },
    { enabled: !!id && !!network && !!currentNetwork }
  );
  const { pool } = poolData || {};
  const { compositions } = pool || {};
  const symbol = `${compositions?.[0]?.symbol}/${compositions?.[1]?.symbol}`;

  return (
    <Wrapper>
      <GnbWrapper banner={!!opened}>
        <Gnb />
      </GnbWrapper>
      <InnerWrapper banner={!!opened}>
        {network === currentNetworkAbbr && (
          <ContentOuterWrapper>
            <Breadcrumb
              items={[
                { key: 'pool', text: 'Pool' },
                { key: 'pool-detail', text: symbol },
                { key: 'fee-voting', text: 'Fee Voting', selected: true },
              ]}
              handleClick={item => {
                if (item.key === 'pool') navigate(`/`);
                if (item.key === 'pool-detail') navigate(`/pools/${currentNetworkAbbr}/${id}`);
                return;
              }}
            />
            <PoolHeader />
            <ContentWrapper>
              <LeftContentWrapper>
                <VotingSlots />
              </LeftContentWrapper>
              <RightContentWrapper>
                <Voting />
              </RightContentWrapper>
            </ContentWrapper>
          </ContentOuterWrapper>
        )}
      </InnerWrapper>
      <Footer />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative flex flex-col justify-between w-full h-full
`;
interface DivProps {
  banner?: boolean;
}
const InnerWrapper = styled.div<DivProps>(({ banner }) => [
  tw`
    flex flex-col pt-120 pb-120 pt-112
    md:(px-20)
    mlg:(pt-120)
    xl:(items-center)
  `,
  banner &&
    tw`
      pt-164
      md:(pt-172)
      mlg:(pt-180)
    `,
]);

const GnbWrapper = styled.div<DivProps>(({ banner }) => [
  tw`
    w-full absolute top-0 left-0 flex-center flex-col z-10
  `,
  banner ? tw`h-124 mlg:(h-140)` : tw`h-72 mlg:(h-80)`,
]);

const ContentOuterWrapper = tw.div`
  flex flex-col w-full gap-40 max-w-1280
`;

const ContentWrapper = tw.div`
  flex flex-col gap-20
  lg:(grid grid-cols-3)
  xl:(gap-40)
`;

const LeftContentWrapper = tw.div`
  flex flex-col gap-24 flex-1 min-w-0 order-2
  lg:(order-1 col-span-2)
`;

const RightContentWrapper = tw.div`
  w-full flex flex-col gap-24 order-1
  lg:(order-2 max-w-400 items-start col-span-1)
`;

export default FeeVotingPage;
