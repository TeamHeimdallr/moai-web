import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import tw from 'twin.macro';

import { IconTokenMoai, IconTokenRoot, IconTokenXrp } from '~/assets/icons';

import { ButtonPrimaryLarge, ButtonPrimaryMedium } from '~/components/buttons';

import { usePopup } from '~/hooks/components';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { POPUP_ID } from '~/types';

import { Pending } from '../components/pending';
import { TokenList } from '../components/token-list';

export const LayoutVoyage = () => (
  <Suspense fallback={<_LayoutVoyageSkeleton />}>
    <_LayoutVoyage />
  </Suspense>
);

const _LayoutVoyage = () => {
  const { xrp, fpass } = useConnectedWallet();
  const { setWalletType } = useWalletTypeStore();
  const { open: campaignOpen } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);
  const { open } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { t } = useTranslation();

  // TODO : connect API
  const myDepositBalance = 123123;
  const myDepositValue = myDepositBalance;
  const myMoaiRewardBalance = 123123;
  const myMoaiRewardValue = myMoaiRewardBalance;
  const myRootRewardBalance = 123123;
  const myRootRewardValue = myRootRewardBalance;

  const bothConnected = xrp.isConnected && fpass.isConnected;
  const isEmpty = !bothConnected || !(myDepositBalance > 0);
  const emptyText = !bothConnected
    ? 'To check your voyage, connect both your XRP\n wallet and Root Network wallet.'
    : "You haven't activated your $XRP yet.";

  const buttonText = !bothConnected ? 'Connect wallet' : 'Activate $XRP';

  const handleClick = () => {
    if (!isEmpty) return;
    if (!bothConnected) {
      if (!xrp.isConnected && !fpass.isConnected) {
        campaignOpen();
        return;
      }
      setWalletType({ evm: !fpass.isConnected, xrpl: !xrp.isConnected });
      open();
      return;
    }
    // TODO : connect function
    console.log('navigate setp1');
  };

  return (
    <Wrapper>
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
            <TokenCard>
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
  w-full flex flex-col items-center justify-center pt-60 gap-24 text-neutral-100 mb-120
  md:(px-20)
  xxl:(px-80)
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

const TokenCard = tw.div`
  w-full flex flex-wrap flex-col gap-24 p-24 pt-20 bg-neutral-10 rounded-12
`;

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
