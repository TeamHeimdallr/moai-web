import { useTranslation } from 'react-i18next';
import tw, { styled } from 'twin.macro';

import { useUserAccountLiquidity } from '~/api/api-contract/lending/user-account-liquidity';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';

import { useGAPage } from '~/hooks/analaystics/ga-page';
import { usePopup } from '~/hooks/components';
import { useForceNetwork, useNetwork } from '~/hooks/contexts/use-network';
import { usePrevious } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { useSupplyBorrowTabStore } from '~/states/pages/lending';
import { NETWORK, POPUP_ID } from '~/types';

import { LayoutMarketBorrows } from './layouts/layout-market-borrows';
import { LayoutMarketInfo } from './layouts/layout-market-info';
import { LayoutMarketSupplies } from './layouts/layout-market-supplies';

export const LendingMain = () => {
  useGAPage();

  const { t } = useTranslation();

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = evm?.address || fpass?.address;
  const { liquidity, shortfall } = useUserAccountLiquidity();

  const targetNetork = [NETWORK.THE_ROOT_NETWORK, NETWORK.EVM_SIDECHAIN];
  const { selectedNetwork } = useNetwork();
  const previousNetwork = usePrevious<NETWORK>(selectedNetwork);

  const { opened } = usePopup(POPUP_ID.WALLET_ALERT);
  const { type, setType } = useSupplyBorrowTabStore();

  useForceNetwork({
    targetNetwork: targetNetork,
    changeTargetNetwork: previousNetwork || targetNetork[0],
    callCallbackUnmounted: true,
  });

  const showMarketInfo = !!evmAddress && (liquidity > 0 || shortfall > 0);

  return (
    <Wrapper>
      <GnbWrapper banner={!!opened}>
        <Gnb />
      </GnbWrapper>
      <InnerWrapper banner={!!opened}>
        {targetNetork.includes(selectedNetwork) && (
          <ContentOuterWrapper>
            <ContentWrapper showMarketInfo={showMarketInfo}>
              {/* market header, info */}
              <ContentInnerWrapper>
                <LayoutMarketInfo />
              </ContentInnerWrapper>

              {/* my lists, market lists */}
              <ContentInnerWrapper>
                <TabWrapper>
                  <Tab selected={type === 'supply'} onClick={() => setType('supply')}>
                    {t('Supplies')}
                  </Tab>
                  <Tab selected={type === 'borrow'} onClick={() => setType('borrow')}>
                    {t('Borrows')}
                  </Tab>
                </TabWrapper>
                {type === 'supply' && <LayoutMarketSupplies />}
                {type === 'borrow' && <LayoutMarketBorrows />}
              </ContentInnerWrapper>
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
    flex flex-col pb-120 px-0 pt-112
    md:(px-20 items-center)
    mlg:(pt-120)
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
  w-full max-w-840
`;

interface WalletProps {
  showMarketInfo?: boolean;
}
const ContentWrapper = styled.div<WalletProps>(({ showMarketInfo }) => [
  tw`
  flex flex-col gap-40
  `,
  showMarketInfo ? tw`md:(gap-80)` : tw`md:(gap-40)`,
]);

const ContentInnerWrapper = tw.div`
  flex flex-col gap-24
`;

const TabWrapper = tw.div`
  flex gap-32 px-20
  md:(px-0)
`;
interface TabProps {
  selected?: boolean;
}
const Tab = styled.div<TabProps>(({ selected }) => [
  tw`
    font-b-18 clickable
    md:(font-b-20)
  `,
  selected ? tw`text-primary-60` : tw`text-neutral-60`,
]);

export default LendingMain;
