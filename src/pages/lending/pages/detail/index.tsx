import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import tw, { styled } from 'twin.macro';
import { Address } from 'viem';

import { useGetMarket } from '~/api/api-contract/_evm/lending/get-market';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { useGAPage } from '~/hooks/analaystics/ga-page';
import { usePopup } from '~/hooks/components';
import { useForceNetwork, useNetwork } from '~/hooks/contexts/use-network';
import { usePrevious } from '~/hooks/utils';
import { NETWORK, POPUP_ID } from '~/types';

import { AssetBorrowInfo } from './components/asset-borrow-info';
import { AssetHeader } from './components/asset-header';
import { AssetInfo } from './components/asset-info';
import { AsseInterestModel } from './components/asset-interest-rate-model';
import { AssetSupplyInfo } from './components/asset-supply-info';
import { UserAssetInfo } from './components/user-asset-info';

export const LendingDetail = () => {
  useGAPage();

  const navigate = useNavigate();
  const { address } = useParams();
  const { selectedNetwork } = useNetwork();
  const previousNetwork = usePrevious<NETWORK>(selectedNetwork);

  const targetNetork = [NETWORK.THE_ROOT_NETWORK, NETWORK.EVM_SIDECHAIN];

  const { market } = useGetMarket({ marketAddress: address as Address });

  useForceNetwork({
    targetNetwork: [NETWORK.THE_ROOT_NETWORK, NETWORK.EVM_SIDECHAIN],
    changeTargetNetwork: previousNetwork || targetNetork[0],
    callCallbackUnmounted: true,
  });

  const { opened } = usePopup(POPUP_ID.WALLET_ALERT);

  useEffect(() => {
    if (!market) navigate('/lending');
  }, [navigate, market]);

  return (
    <Wrapper>
      <GnbWrapper banner={!!opened}>
        <Gnb />
      </GnbWrapper>
      <InnerWrapper banner={!!opened}>
        {targetNetork.includes(selectedNetwork) && (
          <ContentOuterWrapper>
            <AssetHeader />
            <ContentWrapper>
              <LeftContentWrapper>
                <AssetInfo />
                <AssetSupplyInfo />
                <AssetBorrowInfo />
                <AsseInterestModel />
              </LeftContentWrapper>
              <RightContentWrapper>
                <UserAssetInfo />
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
    xl:(px-80 items-center)
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
  flex flex-col w-full gap-40 max-w-1440
`;

const ContentWrapper = tw.div`
  flex flex-col gap-20
  lg:(flex-row)
  xl:(gap-40)
`;

const LeftContentWrapper = tw.div`
  flex flex-col gap-24 flex-1 min-w-0 order-2
  lg:(order-1)
`;

const RightContentWrapper = tw.div`
  w-full flex flex-col gap-24 order-1
  lg:(order-2 w-400 items-start)
`;
