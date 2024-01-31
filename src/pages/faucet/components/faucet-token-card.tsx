import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { css, styled } from 'twin.macro';

import { useUserAllTokenBalances } from '~/api/api-contract/_xrpl/balance/user-all-token-balances';
import { useApprove } from '~/api/api-contract/_xrpl/token/approve';
import { usePostFaucetXrpl } from '~/api/api-server/faucet/post-faucet-xrpl';

import { COLOR } from '~/assets/colors';
import { IconAlert } from '~/assets/icons';

import { FAUCET_AMOUNT } from '~/constants';

import { ButtonPrimaryMedium } from '~/components/buttons';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { usePopup } from '~/hooks/components';
import { useXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber } from '~/utils';
import { IToken, POPUP_ID } from '~/types';

import i18n from '~/locales/i18n';

interface FaucetTokenCardProps {
  token: IToken;
}
export const FaucetTokenCard = ({ token }: FaucetTokenCardProps) => {
  const { gaAction: gaAction } = useGAAction();

  const amount = FAUCET_AMOUNT.XRPL[token.symbol] ?? 100;
  const { isConnected: isClientConnected } = useXrpl();
  const { isXrp } = useNetwork();
  const { xrp } = useConnectedWallet();
  const { address } = xrp;
  const isConnected = isClientConnected && !!address;
  const { open: openConnectWallet } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { t } = useTranslation();

  const { userAllTokenBalances, refetch: refetchBalance } = useUserAllTokenBalances();
  const balance = userAllTokenBalances?.find(b => b.currency === token.currency)?.balance ?? 0;

  const [error, setError] = useState(false);

  const {
    mutateAsync: faucet,
    isLoading: isFaucetLoading,
    isSuccess: isFaucetSuccess,
  } = usePostFaucetXrpl();

  const handleClickToken = async () => {
    if (!isXrp) return;

    gaAction({
      action: 'faucet-token-click',
      buttonType: 'primary-medium',
      data: {
        page: 'faucet',
        component: 'faucet-token-card',
        symbol: token.symbol,
        currency: token.currency,
        balance: balance,
        isXrp: isXrp,
        address: address,
      },
    });

    if (!address) {
      openConnectWallet();
      return;
    }

    if (!allowance) {
      gaAction({
        action: 'faucet-token-click-approve',
        buttonType: 'primary-medium',
        data: {
          page: 'faucet',
          component: 'faucet-token-card',
          allowance: allowance,
          symbol: token.symbol,
          currency: token.currency,
          balance: balance,
          isXrp: isXrp,
          address: address,
        },
      });
      await allow?.();
      return;
    }

    const data = await faucet({
      currency: token.currency,
      issuer: token.address,
      recipient: address,
      amount,
    });
    gaAction({
      action: 'faucet-token-click-response',
      buttonType: 'primary-medium',
      data: {
        page: 'faucet',
        component: 'faucet-token-card',
        code: data.code,
        message: data.message,
        success: data.success,
        symbol: token.symbol,
        currency: token.currency,
        balance: balance,
        isXrp: isXrp,
        address: address,
      },
    });

    // lack of faucet fund
    if (data && (data?.code === '501' || data?.code === '510')) {
      setError(true);
      setTimeout(() => setError(false), 3000);
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
    if (!address || !isXrp) return;

    refetchBalance();
    refetchApprove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFaucetSuccess, isApproveSuccess]);

  const isLoading = (isFaucetLoading && allowance) || isApproveLoading;

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
          {error ? (
            <IconWithErrorMsg>
              <IconAlert width={20} height={20} fill={COLOR.RED[50]} />
              <ErrorMsg>{t('faucet-limit-message')}</ErrorMsg>
            </IconWithErrorMsg>
          ) : (
            <TokenBalance>
              {isConnected && allowance ? formatNumber(balance, 4) : t('No trustline')}
            </TokenBalance>
          )}
        </TokenNameBalance>
      </TokenInfo>
      <ButtonWrapper isConnectWallet={isConnected} isLoading={isLoading}>
        <ButtonPrimaryMedium
          isLoading={isLoading}
          buttonType="outlined"
          hideLottie
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

interface ButtonWrapperProps {
  isConnectWallet: boolean;
  isLoading?: boolean;
}
const ButtonWrapper = styled.div<ButtonWrapperProps>(({ isConnectWallet, isLoading }) => [
  tw`flex-center`,
  i18n.language === 'en' ? (!isConnectWallet ? tw`w-130` : tw`w-115`) : tw`w-148`,

  isLoading &&
    css`
      & button {
        &:hover {
          background: ${COLOR.NEUTRAL[5]} !important;
          color: ${COLOR.NEUTRAL[40]} !important;
        }
      }
    `,
]);
const IconWithErrorMsg = tw.div`
  flex gap-4 h-22 items-center
`;
const ErrorMsg = tw.div`
  font-r-12 text-red-50
`;
