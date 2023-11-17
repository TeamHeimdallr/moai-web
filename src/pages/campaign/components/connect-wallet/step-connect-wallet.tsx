import { useEffect, useState } from 'react';
import { keyframes } from '@emotion/react';
import tw, { css, styled } from 'twin.macro';

import { imageWalletCrossmark, imageWalletGem, imageWalletMetamask } from '~/assets/images';
import { imageNetworkROOT, imageNetworkXRPL } from '~/assets/images';
import { imageStepLoading } from '~/assets/images';

import {
  useConnectedWallet,
  useConnectWithCrossmarkWallet,
  useConnectWithEvmWallet,
  useConnectWithGemWallet,
} from '~/hooks/wallets';
import { NETWORK } from '~/types';

import { useCampaignStepStore } from '../../states/step';
import { TooltipFuturepass } from '../tooltip/futurepass';

interface ChainDetail {
  network: NETWORK;
  image: string;
  description: string;
  wallets: Wallet[];
}
interface Wallet {
  name: string;
  image: string;
  connect: () => void;
  connected: boolean;
  isInstalled: boolean;
}
enum STEP {
  STEP_1,
  STEP_2,
}

export const StepConnectWallet = () => {
  const { step, addLoading } = useCampaignStepStore();
  const [isLoading, setIsLoading] = useState('');
  const {
    connect: connectMetamask,
    isConnected: metamaskConnected,
    isInstalled: metamaskIsInstalled,
  } = useConnectWithEvmWallet();
  const {
    connect: connectXrpCrossmark,
    isConnected: crossMarkConnected,
    isInstalled: crossMarkInstalled,
  } = useConnectWithCrossmarkWallet();
  const {
    connect: connectXrpGem,
    isConnected: gemConnected,
    isInstalled: gemIsInstalled,
  } = useConnectWithGemWallet();
  const { xrp, evm } = useConnectedWallet();

  const chainMap: Record<STEP, ChainDetail> = {
    [STEP.STEP_1]: {
      network: NETWORK.XRPL,
      description: 'XRPL',
      image: imageNetworkXRPL,
      wallets: [
        {
          name: 'Crossmark',
          image: imageWalletCrossmark,
          connect: connectXrpCrossmark,
          connected: crossMarkConnected,
          isInstalled: crossMarkInstalled,
        },
        {
          name: 'Gem Wallet',
          image: imageWalletGem,
          connect: connectXrpGem,
          connected: gemConnected,
          isInstalled: gemIsInstalled,
        },
      ],
    },
    [STEP.STEP_2]: {
      network: NETWORK.THE_ROOT_NETWORK,
      description: 'The Root Network',
      image: imageNetworkROOT,
      wallets: [
        {
          name: 'Metamask',
          image: imageWalletMetamask,
          connect: connectMetamask,
          connected: metamaskConnected,
          isInstalled: metamaskIsInstalled,
        },
      ],
    },
  };
  const currentStepChain = chainMap[STEP[`STEP_${step}`]] as ChainDetail;

  const handleConnect = (wallet: Wallet) => {
    const selectedWallet = currentStepChain.wallets.find(w => w === wallet);
    if (selectedWallet?.connected) return;
    selectedWallet?.connect();
    addLoading(step);
    // TODO : connect install url
    if (!selectedWallet?.isInstalled) return;
    if (currentStepChain.network === NETWORK.XRPL) {
      xrp.disconnect();
    }
    setIsLoading(wallet.name);
  };

  useEffect(() => {
    setIsLoading('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evm.isConnected, xrp.isConnected]);

  return (
    <>
      <Wrapper>
        <TitleWrapper>
          <NetworkImage src={currentStepChain.image} />
          {currentStepChain.description}
        </TitleWrapper>

        <WalletWrapper>
          {currentStepChain.wallets.map(w => (
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
const NetworkImage = tw.img`w-24 h-24`;
const WalletImage = tw.img`
  w-36 h-36 rounded-8 flex-center object-cover overflow-hidden
`;
const WalletInnerWrapper = tw.div`
  flex gap-12 items-center  
`;
const Name = tw.div`
  font-m-16 text-neutral-100
`;
const LoadingIcon = styled.img`
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
