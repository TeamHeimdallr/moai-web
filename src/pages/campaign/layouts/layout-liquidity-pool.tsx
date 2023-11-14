import tw from 'twin.macro';

import { ButtonPrimaryMedium } from '~/components/buttons';

import { usePopup } from '~/hooks/components';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { POPUP_ID } from '~/types';

import { Pending } from '../components/pending';
import { TokenCard } from '../components/token-card';
import { TokenList } from '../components/token-list';

export const LiquidityPoolLayout = () => {
  const { xrp, fpass } = useConnectedWallet();
  const { setWalletType } = useWalletTypeStore();
  const { open: campaignOpen } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);
  const { open } = usePopup(POPUP_ID.CONNECT_WALLET);

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
    ? 'To check your voyage, connect both your XRP wallet and Root Network wallet.'
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
        <Title>My Voyage</Title>
        {!isEmpty ? (
          <CardWrapper>
            <TokenCard
              title="Balance"
              token={
                <TokenList
                  type="medium"
                  token="XRP"
                  balance={myDepositBalance}
                  value={myDepositValue}
                />
              }
            />
            <TokenCard
              title="Rewards"
              token={
                <TokenWrapper>
                  <TokenList token="MOAI" balance={myMoaiRewardBalance} value={myMoaiRewardValue} />
                  <TokenList token="ROOT" balance={myRootRewardBalance} value={myRootRewardValue} />
                </TokenWrapper>
              }
            />
          </CardWrapper>
        ) : (
          <Empty>
            <TextWrapper>{emptyText}</TextWrapper>
            <ButtonWrapper>
              <ButtonPrimaryMedium text={buttonText} buttonType="outlined" onClick={handleClick} />
            </ButtonWrapper>
          </Empty>
        )}
      </MyInfoWrapper>
      {!isEmpty && <Pending />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col items-center justify-center pt-60 gap-24 text-neutral-100 mb-120
`;

const MyInfoWrapper = tw.div`
  flex flex-col gap-24 justify-center
`;
const CardWrapper = tw.div`flex gap-40`;

const TokenWrapper = tw.div`flex gap-16`;

const Title = tw.div`
  font-b-24 text-neutral-100
`;
const Empty = tw.div`w-1280 flex-center flex-col h-194 gap-20 bg-neutral-10 rounded-12 text-neutral-80`;
const TextWrapper = tw.div``;
const ButtonWrapper = tw.div`flex-center`;
