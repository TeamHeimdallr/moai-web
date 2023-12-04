import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { IconTokenXrp } from '~/assets/icons';

import { ButtonPrimaryMedium } from '~/components/buttons';

import { usePopup } from '~/hooks/components';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { POPUP_ID } from '~/types';

import { Pending } from '../landing/components/pending';
import { TokenCard } from '../landing/components/token-card';
import { TokenList } from '../landing/components/token-list';

export const MyVoyage = () => {
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
        {!isEmpty ? (
          <CardWrapper>
            <TokenCard
              type="balance"
              title="Balance"
              token={
                <TokenList
                  token="XRP"
                  balance={myDepositBalance}
                  value={myDepositValue}
                  image={<IconTokenXrp width={36} height={36} />}
                />
              }
            />
            <TokenCard
              type="reward"
              title="Rewards"
              token={
                <TokenWrapper>
                  <TokenList
                    token="MOAI"
                    balance={myMoaiRewardBalance}
                    value={myMoaiRewardValue}
                    image={<IconTokenXrp width={36} height={36} />}
                  />
                  <TokenList
                    token="ROOT"
                    balance={myRootRewardBalance}
                    value={myRootRewardValue}
                    image={<IconTokenXrp width={36} height={36} />}
                  />
                </TokenWrapper>
              }
            />
          </CardWrapper>
        ) : (
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
      </MyInfoWrapper>
      {!isEmpty && <Pending />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col items-center justify-center pt-60 gap-24 text-neutral-100 mb-120 md:px-20 xxl:px-80
`;

const MyInfoWrapper = tw.div`
  w-full flex flex-col gap-24 justify-center
`;
const CardWrapper = tw.div`w-full flex flex-col lg:(grid grid-cols-3) gap-20 xxl:gap-40`;

const TokenWrapper = tw.div`flex flex-col gap-16 md:flex-row`;

const Title = tw.div`
  px-20 font-b-20 md:font-b-24 text-neutral-100
`;
const Empty = tw.div`flex-center flex-col h-194 gap-20 bg-neutral-10 rounded-12 text-neutral-80`;
const TextWrapper = tw.div`font-r-14 text-center whitespace-pre-wrap md:(font-r-16 whitespace-nowrap)`;
const ButtonWrapper = tw.div`flex-center w-144`;
