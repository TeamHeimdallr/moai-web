import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { styled } from 'twin.macro';

import { useApprove } from '~/api/api-contract/_xrpl/token/approve';
import { usePostFaucetXrpl } from '~/api/api-server/faucet/post-faucet-xrpl';

import { ButtonPrimaryMedium } from '~/components/buttons';

import { usePopup } from '~/hooks/components';
import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber } from '~/utils';
import { IToken, POPUP_ID } from '~/types';

import i18n from '~/locales/i18n';

interface FaucetTokenCardProps {
  token: IToken;
  balance: number;
  refetchBalance: () => void;
}
export const FaucetTokenCard = ({ token, balance, refetchBalance }: FaucetTokenCardProps) => {
  const amount = 100; // TODO
  const { isConnected: isClientConnected } = useXrpl();
  const { isXrp } = useNetwork();
  const { xrp } = useConnectedWallet();
  const { address } = xrp;
  const isConnected = isClientConnected && !!address;
  const { open: openConnectWallet } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { t } = useTranslation();

  const {
    mutateAsync: faucet,
    isLoading: isFaucetLoading,
    isSuccess: isFaucetSuccess,
  } = usePostFaucetXrpl({});

  const handleClickToken = async () => {
    if (!address) {
      openConnectWallet();
    } else if (!allowance) {
      await allow?.();
    } else {
      await faucet({
        currency: token.currency,
        issuer: token.address,
        recipient: address,
        amount,
      });
    }
  };

  const {
    allowance,
    allow,
    isLoading: isApproveLoading,
    isSuccess: isApproveSuccess,
    refetch: refetchApprove,
  } = useApprove({
    currency: token.currency,
    issuer: token.address,
    amount,
    enabled: isConnected && isXrp && !!address,
  });

  const buttonText = (symbol: string) => {
    if (!isConnected) {
      return t('Connect wallet');
    }

    if (!allowance) {
      return t('Set trustline');
    }
    return t('Get Token', { symbol });
  };

  useEffect(() => {
    refetchBalance();
    refetchApprove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFaucetSuccess, isApproveSuccess]);

  return (
    <Wrapper>
      <TokenInfo>
        {token.image ? (
          <Image src={token.image} />
        ) : (
          <Jazzicon diameter={36} seed={jsNumberForAddress(token.address)} />
        )}
        <TokenNameBalance>
          <TokenName>{token.symbol}</TokenName>
          {isConnected &&
            (allowance ? (
              <TokenBalance>{formatNumber(balance, 4)}</TokenBalance>
            ) : (
              <TokenBalance>{t('No trustline')}</TokenBalance>
            ))}
        </TokenNameBalance>
      </TokenInfo>
      <ButtonWrapper isConnectWallet={isConnected}>
        <ButtonPrimaryMedium
          isLoading={(isFaucetLoading && allowance) || isApproveLoading}
          buttonType="outlined"
          text={buttonText(token.symbol)}
          onClick={handleClickToken}
        />
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex rounded-8 gap-8 pb-12 p-16 bg-neutral-15 justify-between
`;
const TokenInfo = tw.div`
  flex-center gap-12
`;
const TokenNameBalance = tw.div``;
const TokenName = tw.div`
  text-neutral-100 font-r-14 gap-6
`;
const TokenBalance = tw.div`
  font-r-14 text-neutral-60
`;
const Image = tw(LazyLoadImage)`w-36 h-36 rounded-18 shrink-0`;
const ButtonWrapper = styled.div<{ isConnectWallet: boolean }>(({ isConnectWallet }) => [
  tw`flex-center`,
  i18n.language === 'en' ? (!isConnectWallet ? tw`w-130` : tw`w-115`) : tw`w-148`,
]);
