import { useEffect, useState } from 'react';
import { keyframes } from '@emotion/react';
import tw, { css, styled } from 'twin.macro';

import { IconQuestion } from '~/assets/icons';
import { imageWalletCrossmark, imageWalletGem, imageWalletMetamask } from '~/assets/images';
import { imageNetworkXRPL, imageWalletFuturepass } from '~/assets/images';
import { imageStepLoading } from '~/assets/images';

import { ButtonIconSmall } from '~/components/buttons';

import {
  useConnectedWallet,
  useConnectWithCrossmarkWallet,
  useConnectWithGemWallet,
} from '~/hooks/wallets';
import { TOOLTIP_ID } from '~/types';

import { useCampaignStepStore } from '../../states/step';
import { CreateFuturepass } from '../create-futurepass';
import { TooltipFuturepass } from '../tooltip/futurepass';

interface Chain {
  type: 'xrpl' | 'fpass';
  image: string;
  description: string;
  wallets: Wallet[];
}
interface Wallet {
  name: string;
  image: string;
  connect: () => void;
  connected?: boolean;
}

export const StepConnectWallet = () => {
  const { step } = useCampaignStepStore();

  const [isLoading, setIsLoading] = useState('');
  const { connect: connectXrpCrossmark, isConnected: crossMarkConnected } =
    useConnectWithCrossmarkWallet();
  const { connect: connectXrpGem, isConnected: gemConnected } = useConnectWithGemWallet();
  const { xrp, fpass } = useConnectedWallet();
  const [fpassComponent, createFpassComponent] = useState(
    step === 2 && !fpass.address && fpass.isConnected
  );

  const chainMap: { [key in 'XRPL' | 'FPASS']: Chain } = {
    XRPL: {
      type: 'xrpl',
      description: 'XRPL',
      image: imageNetworkXRPL,
      wallets: [
        {
          name: 'Crossmark',
          image: imageWalletCrossmark,
          connect: connectXrpCrossmark,
          connected: crossMarkConnected,
        },
        {
          name: 'Gem Wallet',
          image: imageWalletGem,
          connect: connectXrpGem,
          connected: gemConnected,
        },
      ],
    },
    FPASS: {
      type: 'fpass',
      description: 'Futruepass',
      image: imageWalletFuturepass,
      wallets: [
        {
          name: 'Metamask',
          image: imageWalletMetamask,
          connect: fpass.connect,
          connected: fpass.isConnected && !!fpass.address,
        },
      ],
    },
  };
  const chain = step === 1 ? chainMap['XRPL'] : chainMap['FPASS'];

  const handleConnect = (wallet: Wallet) => {
    const selectedWallet = chain.wallets.find(w => w === wallet);
    if (selectedWallet?.connected) return;
    if (chain.type === 'xrpl') {
      xrp.disconnect();
      selectedWallet?.connect();
      setIsLoading(wallet.name);
      return;
    }
    if (chain.type === 'fpass') {
      if (!fpass.isConnected) {
        wallet.connect();
        return;
      }
      createFpassComponent(true);
    }
  };

  useEffect(() => {
    setIsLoading('');
  }, [fpass.address, xrp.isConnected]);

  return (
    <>
      {fpassComponent ? (
        <CreateFuturepass close={() => createFpassComponent(false)} />
      ) : (
        <Wrapper>
          <TitleWrapper>
            <NetworkImage src={chain.image} />
            {chain.description}
            {chain.type === 'fpass' && (
              <FpassTextWrapper>
                Futurepass
                <ButtonIconSmall
                  data-tooltip-id={TOOLTIP_ID.CAMPAIGN_FUTUREPASS}
                  icon={<IconQuestion width={16} height={16} />}
                />
              </FpassTextWrapper>
            )}
          </TitleWrapper>

          <WalletWrapper>
            {chain.wallets.map(w => (
              <Wallet
                key={w.name}
                onClick={() => handleConnect(w)}
                isLoading={isLoading === w.name}
              >
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
      )}
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
const FpassTextWrapper = tw.div`flex items-center gap-2`;
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
