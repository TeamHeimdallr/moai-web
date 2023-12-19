import { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { keyframes } from '@emotion/react';
import tw, { css, styled } from 'twin.macro';

import { imageStepLoading } from '~/assets/images';

import { useConnectedWallet } from '~/hooks/wallets';
import { useNetworkWallets } from '~/hooks/wallets/use-connectors';
import { NETWORK } from '~/types';

import { useCampaignStepStore } from '../pages/participate/states/step';

import { TooltipFuturepass } from './tooltip-fpass';

export const StepConnectWallet = () => {
  const { step, setLoading } = useCampaignStepStore();
  const [isLoading, setIsLoading] = useState('');

  const { xrp, evm } = useConnectedWallet();

  const network = step === 1 ? NETWORK.XRPL : NETWORK.THE_ROOT_NETWORK;

  const { currentNetwork } = useNetworkWallets(network);

  const handleConnect = wallet => {
    if (!currentNetwork) return;
    const selectedWallet = currentNetwork.wallets.find(w => w === wallet);
    if (selectedWallet?.connected) return;
    // TODO : connect install url
    // TODO : gemIsInstalled가 틀리게 내려옴. 확인필요
    // if (!selectedWallet?.isInstalled) {
    //   setIsLoading('');
    //   return;
    // }
    selectedWallet?.connect();
    setLoading(true);
    setIsLoading(wallet.name);
    if (network === NETWORK.XRPL && xrp.isConnected) {
      xrp.disconnect();
    }
  };

  useEffect(() => {
    if ((step === 1 && xrp.isConnected) || (step === 2 && evm.isConnected)) setIsLoading('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evm.isConnected, xrp.isConnected]);

  return (
    <>
      <Wrapper>
        <TitleWrapper>
          <NetworkImage src={currentNetwork?.image ?? ''} />
          {currentNetwork?.description}
        </TitleWrapper>

        <WalletWrapper>
          {currentNetwork?.wallets?.map(w => (
            <Wallet key={w.name} onClick={() => handleConnect(w)} isLoading={isLoading === w.name}>
              <WalletInnerWrapper>
                <WalletImage src={w.image} alt={w.name} />
                <Name>{w.name}</Name>
              </WalletInnerWrapper>
              {isLoading === w.name && (
                <LoadingIcon src={imageStepLoading} width={24} height={24} />
              )}
              {w.connected && (
                <ConnectedWrapper>
                  <ConnetedDot />
                  Connected
                </ConnectedWrapper>
              )}
            </Wallet>
          ))}
        </WalletWrapper>
      </Wrapper>
      <TooltipFuturepass />
    </>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col gap-24 p-24 pt-20 bg-neutral-10 rounded-12
`;

const TitleWrapper = tw.div`w-full flex items-center gap-8 font-b-16 text-neutral-100`;

interface WalletProps {
  isLoading?: boolean;
}
const Wallet = styled.div<WalletProps>(({ isLoading }) => [
  tw`flex items-center gap-12 px-16 py-15 rounded-8 bg-neutral-15 hover:bg-neutral-20 clickable justify-between`,
  isLoading && tw`bg-neutral-20`,
]);
const WalletWrapper = tw.div`flex flex-col gap-8`;
const NetworkImage = tw(LazyLoadImage)`w-24 h-24`;
const WalletImage = tw(LazyLoadImage)`
  w-36 h-36 rounded-8 flex-center object-cover overflow-hidden
`;
const WalletInnerWrapper = tw.div`
  flex gap-12 items-center  
`;
const Name = tw.div`
  font-m-16 text-neutral-100
`;
const LoadingIcon = styled(LazyLoadImage)`
  animation: ${() => css`
    ${keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  `} 2s linear infinite
  `};
`;
const ConnectedWrapper = tw.div`flex gap-8 items-center font-r-12 text-neutral-100`;
const ConnetedDot = tw.div`w-8 h-8 rounded-full bg-green-50`;
