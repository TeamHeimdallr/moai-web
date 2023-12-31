import { Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import { isEqual } from 'lodash-es';
import tw, { styled } from 'twin.macro';

import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useGetCampaignsQuery } from '~/api/api-server/campaign/get-campaigns';
import { useGetMyPoolsQuery } from '~/api/api-server/pools/get-my-pools';

import { ASSET_URL } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components/use-popup';
import { useNetwork } from '~/hooks/contexts/use-network';
import { usePrevious } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber, getNetworkAbbr } from '~/utils';
import { useWalletConnectorTypeStore } from '~/states/contexts/wallets/connector-type';
import { POPUP_ID } from '~/types';

import { LayoutMainCampaign } from './layout-main-campaign';

export const MainLayout = () => (
  <Suspense fallback={<_MainLayoutSkeleton />}>
    <_MainLayout />
  </Suspense>
);

const _MainLayout = () => {
  const { ref } = useGAInView({ name: 'home-layout-main' });
  const { gaAction } = useGAAction();

  const [totalValue, setTotalValue] = useState<string>('0');

  const { open, opened } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { opened: openedBanner } = usePopup(POPUP_ID.WALLET_ALERT);

  const { selectedNetwork } = useNetwork();
  const { evm, xrp } = useConnectedWallet();
  const { setWalletConnectorType } = useWalletConnectorTypeStore();

  const netwokrAbbr = getNetworkAbbr(selectedNetwork);
  const { currentAddress } = useConnectedWallet(selectedNetwork);
  const isConnected = !!evm.address || !!xrp.address;

  const { userAllTokenBalances } = useUserAllTokenBalances();
  const userLpTokens = useMemo(
    () => userAllTokenBalances.filter(item => item.isLpToken && item.balance > 0),
    [userAllTokenBalances]
  );

  const userLpTokenRequest = userLpTokens.map(item => ({
    address: item.address,
    balance: item.balance,
    totalSupply: item.totalSupply,
  }));

  const previous = usePrevious<
    {
      address: string;
      balance: number;
      totalSupply: number;
    }[]
  >(userLpTokenRequest);
  const isRequestEqual = isEqual(previous, userLpTokenRequest);

  const { data: campaignData } = useGetCampaignsQuery(
    {
      queries: {
        filter: `active:eq:true:boolean`,
      },
    },
    { staleTime: 5 * 60 * 1000 }
  );
  const campaigns = campaignData?.campaigns || [];

  const campaignXrplRoot = campaigns.find(item => item.name === 'campaign-xrpl-root');
  const showCampaignBanner = campaignXrplRoot?.active && campaignXrplRoot?.activeMainpage;

  const { mutateAsync } = useGetMyPoolsQuery({
    queries: {
      take: 100,
      filter: `network:eq:${netwokrAbbr}`,
      sort: 'value:desc',
    },
  });

  const { t } = useTranslation();

  useEffect(() => {
    if (!currentAddress) return;

    const fetch = async () => {
      const res = await mutateAsync?.({
        walletAddress: currentAddress || '',
        lpTokens: userLpTokens.map(item => ({
          address: item.address,
          balance: item.balance,
          totalSupply: item.totalSupply,
        })),
      });

      const { pools } = res || {};
      const totalMoaiValue = pools?.reduce((acc, cur) => acc + cur.balance, 0) || 0;

      setTotalValue(formatNumber(totalMoaiValue));
    };

    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAddress, isRequestEqual]);

  if (showCampaignBanner) {
    return <LayoutMainCampaign />;
  }
  return (
    <MainWrapper banner={!!openedBanner} ref={ref}>
      {isConnected ? (
        <SubTitleWrapper>
          <Label>{t('My Liquidity Value')}</Label>
          <SubTitle>{`$${totalValue}`}</SubTitle>
        </SubTitleWrapper>
      ) : (
        <>
          <Title>{'Your Universal Gateway to the\nMulti-chain Liquidity'}</Title>
          <ButtonWrapper>
            <ButtonPrimaryLarge
              text={t('Connect wallet')}
              buttonType="outlined"
              isLoading={!!opened}
              onClick={() => {
                gaAction({
                  action: 'connect-wallet',
                  buttonType: 'primary-large',
                  data: { page: 'home', layout: 'main' },
                });
                setWalletConnectorType({ network: selectedNetwork });
                open();
              }}
            />
          </ButtonWrapper>
        </>
      )}
    </MainWrapper>
  );
};

const _MainLayoutSkeleton = () => {
  const { opened } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { opened: openedBanner } = usePopup(POPUP_ID.WALLET_ALERT);

  const { evm, xrp } = useConnectedWallet();

  const isConnected = !!evm.address || !!xrp.address;

  const { t } = useTranslation();

  return (
    <MainWrapper
      banner={!!openedBanner}
      style={{ backgroundImage: `url(${ASSET_URL}/images/bg-main.png)` }}
    >
      {isConnected ? (
        <SubTitleWrapper>
          <Label>{t('My Moai Balance')}</Label>
          <Skeleton
            width={200}
            height={38}
            baseColor="#b3b3b3"
            highlightColor="#ffffff"
            style={{ opacity: 0.3, borderRadius: '40px', marginTop: '6px' }}
          />
        </SubTitleWrapper>
      ) : (
        <>
          <Title>{'Your Universal Gateway to the\nMulti-chain Liquidity'}</Title>
          <ButtonWrapper>
            <ButtonPrimaryLarge
              text={t('Connect wallet')}
              buttonType="outlined"
              isLoading={!!opened}
            />
          </ButtonWrapper>
        </>
      )}
    </MainWrapper>
  );
};

interface MainWrapperProps {
  banner?: boolean;
}
const MainWrapper = styled.div<MainWrapperProps>(({ banner }) => [
  tw`
    flex-col w-full bg-center bg-no-repeat bg-cover flex-center bg-main

    pt-120 pb-80 gap-24
    md:(pt-200 pb-140)
  `,
  banner &&
    tw`
      gap-12
      pt-172 pb-80
      md:(pt-260 pb-140 gap-24)
    `,
]);

const Title = tw.div`
  text-neutral-100 text-center

  font-b-28 px-20
  md:(font-b-48 whitespace-pre-wrap)
`;

const SubTitleWrapper = tw.div`
  flex-center flex-col
  gap-8
  md:(gap-12)
`;
const SubTitle = tw.div`
  text-neutral-100
  font-b-28
  md:(font-b-36)
`;
const Label = tw.div`
  text-neutral-100
  font-b-20
  md:(font-b-24)
`;

const ButtonWrapper = tw.div`
  inline-flex-center
`;
