import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import tw, { styled } from 'twin.macro';

import { useUserCampaignInfo } from '~/api/api-contract/_evm/campaign/user-campaign-info.ts';

import { IconTokenMoai, IconTokenRoot, IconTokenXrp } from '~/assets/icons';

import { ButtonPrimaryLarge, ButtonPrimaryMedium } from '~/components/buttons';

import { usePopup } from '~/hooks/components';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWalletConnectorTypeStore } from '~/states/contexts/wallets/connector-type';
import { NETWORK, POPUP_ID } from '~/types';

import { Pending } from '../components/pending';
import { TokenList } from '../components/token-list';

export const LayoutVoyage = () => (
  <Suspense fallback={<_LayoutVoyageSkeleton />}>
    <_LayoutVoyage />
  </Suspense>
);

const _LayoutVoyage = () => {
  const { xrp, evm } = useConnectedWallet();

  const { setWalletConnectorType } = useWalletConnectorTypeStore();

  const { open } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);
  const { t } = useTranslation();

  const { refetch } = useUserCampaignInfo();

  // TODO : connect API
  const myDepositBalance = 123123;
  const myDepositValue = myDepositBalance;

  const myMoaiRewardBalance = 123123;
  const myMoaiRewardValue = myMoaiRewardBalance;

  const myRootRewardBalance = 123123;
  const myRootRewardValue = myRootRewardBalance;

  // TODO: handle fpass
  const bothConnected = xrp.isConnected && evm.isConnected;
  const isEmpty = bothConnected && myDepositBalance <= 0;

  const emptyText = !bothConnected
    ? 'To check your voyage, connect both your XRP\n wallet and Root Network wallet.'
    : "You haven't activated your $XRP yet.";

  const buttonText = !bothConnected ? 'Connect wallet' : 'Activate $XRP';

  const handleClick = () => {
    if (isEmpty) {
      // TODO: activate xrp
      return;
    }

    if (bothConnected) {
      // TODO: navigate to step3
      return;
    }

    if (!xrp.isConnected) setWalletConnectorType({ network: NETWORK.XRPL });
    else if (!evm.isConnected) setWalletConnectorType({ network: NETWORK.THE_ROOT_NETWORK });

    open();
  };

  return (
    <Wrapper>
      <InnerWrapper>
        <MyInfoWrapper>
          <Title>{t('My Voyage')}</Title>

          {isEmpty && (
            <Empty>
              <TextWrapper>{emptyText}</TextWrapper>
              <ButtonWrapper>
                <ButtonPrimaryMedium
                  text={t(buttonText)}
                  buttonType="outlined"
                  onClick={handleClick}
                />
              </ButtonWrapper>
            </Empty>
          )}

          {!isEmpty && (
            <CardWrapper>
              <TokenCard>
                <TokenCardTitle>{t('My liquidity')}</TokenCardTitle>
                <TokenList
                  token="XRP"
                  balance={myDepositBalance}
                  value={myDepositValue}
                  image={<IconTokenXrp width={36} height={36} />}
                  button={
                    <ButtonPrimaryLarge
                      text={t('Withdraw')}
                      buttonType="outlined"
                      onClick={handleClick}
                    />
                  }
                />
              </TokenCard>
              <TokenCard col2>
                <TokenCardTitle>{t('Rewards')}</TokenCardTitle>
                <TokenListWrapper>
                  <TokenList
                    token="veMOI"
                    balance={myMoaiRewardBalance}
                    value={myMoaiRewardValue}
                    image={<IconTokenMoai width={36} height={36} />}
                    button={
                      <ButtonPrimaryLarge
                        text={t('Coming soon')}
                        buttonType="filled"
                        disabled
                        onClick={() => console.log('claim')}
                      />
                    }
                  />
                  <TokenList
                    token="ROOT"
                    balance={myRootRewardBalance}
                    value={myRootRewardValue}
                    image={<IconTokenRoot width={36} height={36} />}
                    button={
                      <ButtonPrimaryLarge
                        text={t('Claim')}
                        buttonType="outlined"
                        onClick={() => console.log('claim')}
                      />
                    }
                  />
                </TokenListWrapper>
              </TokenCard>
            </CardWrapper>
          )}
        </MyInfoWrapper>
        {!isEmpty && <Pending />}
      </InnerWrapper>
    </Wrapper>
  );
};

const _LayoutVoyageSkeleton = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <Title>{t('My Voyage')}</Title>
      <Skeleton
        height={194}
        baseColor="#2B2E44"
        highlightColor="#23263A"
        style={{ borderRadius: 12 }}
      />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex-center pt-60 pb-120 text-neutral-100
  md:(px-20)
  xxl:(px-80)
`;

const InnerWrapper = tw.div`
  flex-center flex-col w-full max-w-1280 gap-24
`;

const MyInfoWrapper = tw.div`
  w-full flex flex-col gap-24 justify-center
`;

const CardWrapper = tw.div`
  w-full flex flex-col
  gap-20
  lg:(grid grid-cols-3)
  xl:(gap-40)
`;

interface TokenCardProps {
  col2?: boolean;
}
const TokenCard = styled.div<TokenCardProps>(({ col2 }) => [
  tw`
    w-full flex flex-wrap flex-col gap-24 p-24 pt-20 bg-neutral-10 rounded-12
  `,
  col2 && tw`lg:(col-span-2)`,
]);

const TokenCardTitle = tw.div`
  font-b-18
  md:(font-b-20)
`;

const TokenListWrapper = tw.div`
  flex flex-col gap-16
  md:(flex-row)
`;

const Title = tw.div`
  px-20 font-b-20 text-neutral-100
  md:(font-b-24)
`;
const Empty = tw.div`
  flex-center flex-col h-194 gap-20 bg-neutral-10 rounded-12 text-neutral-80
`;

const TextWrapper = tw.div`
  font-r-14 text-center whitespace-pre-wrap
  md:(font-r-16 whitespace-nowrap)
`;

const ButtonWrapper = tw.div`
  flex-center w-144
`;
