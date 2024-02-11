import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { css, styled } from 'twin.macro';

import { usePostFaucetEvmSidechain } from '~/api/api-server/faucet/post-faucet-evm-sidechain';

import { COLOR } from '~/assets/colors';
import { IconAlert } from '~/assets/icons';

import { THOUSAND } from '~/constants';

import { ButtonPrimaryMedium } from '~/components/buttons';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber } from '~/utils';
import { IToken, NETWORK, POPUP_ID } from '~/types';

import i18n from '~/locales/i18n';

interface FaucetTokenCardProps {
  token: IToken & { balance: number };
  refetchBalance: () => void;
}
export const FaucetTokenCard = ({ token, refetchBalance }: FaucetTokenCardProps) => {
  const { selectedNetwork, isFpass } = useNetwork();

  const { evm } = useConnectedWallet();
  const { address } = evm;

  const { open: openConnectWallet } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { t } = useTranslation();

  const [error, setError] = useState(false);

  const {
    mutateAsync: faucet,
    data: faucetData,
    isLoading: isFaucetLoading,
    isSuccess: isFaucetSuccess,
  } = usePostFaucetEvmSidechain();

  const handleClickToken = async () => {
    if (selectedNetwork === NETWORK.THE_ROOT_NETWORK || isFpass) return;

    if (!address) {
      openConnectWallet();
      return;
    }

    await faucet({
      walletAddress: address,
      tokenAddress: token.address,
    });
  };

  const buttonText = (symbol: string) => {
    if (!address) {
      return t('Connect wallet');
    }

    return t('Get Token', { symbol });
  };

  useEffect(() => {
    // lack of faucet fund
    if (!faucetData?.code) return;
    if (faucetData?.code === '501' || faucetData?.code === '510') {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  }, [faucetData?.code]);

  useEffect(() => {
    if (!address) return;

    if (isFaucetSuccess) {
      setTimeout(() => {
        refetchBalance();
      }, 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFaucetSuccess]);

  const isLoading = isFaucetLoading;

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
              {address ? formatNumber(token.balance, 4, 'floor', THOUSAND, 0) : ''}
            </TokenBalance>
          )}
        </TokenNameBalance>
      </TokenInfo>
      <ButtonWrapper isConnectWallet={!!address} isLoading={isLoading}>
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
