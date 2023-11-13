import { useState } from 'react';
import tw, { styled } from 'twin.macro';

import { imageWalletCrossmark, imageWalletGem, imageWalletMetamask } from '~/assets/images';

import { Popup } from '~/components/popup';

import { usePopup } from '~/hooks/components/use-popup';
import {
  useConnectWithCrossmarkWallet,
  useConnectWithEvmWallet,
  useConnectWithGemWallet,
} from '~/hooks/wallets';
import { POPUP_ID } from '~/types/components';

interface Wallet {
  name: string;
  description: string;
  image: string;
  type: string;
  onClick: () => void;
}
export const CampaignConnectWallet = () => {
  const { close } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);
  const { connect: connectEvm } = useConnectWithEvmWallet();
  const { connect: connectXrpCrossmark } = useConnectWithCrossmarkWallet();
  const { connect: connectXrpGem } = useConnectWithGemWallet();

  const [selectedTab, selectTab] = useState<'evm' | 'xrpl'>('xrpl');

  const wallets: Wallet[] = [
    {
      name: 'Metamask',
      description: 'Supports The Root Network and EVM Sidechain',
      image: imageWalletMetamask,
      onClick: connectEvm,
      type: 'evm',
    },
    {
      name: 'Crossmark Wallet',
      description: 'Supports XRPL network',
      image: imageWalletCrossmark,
      onClick: connectXrpCrossmark,
      type: 'xrpl',
    },
    {
      name: 'Gem Wallet',
      description: 'Supports XRPL network',
      image: imageWalletGem,
      onClick: connectXrpGem,
      type: 'xrpl',
    },
  ];

  return (
    <Popup id={POPUP_ID.CAMPAIGN_CONNECT_WALLET} title="Connect wallet">
      <Wrapper>
        {
          <TabWrapper>
            <Tab selected={selectedTab === 'xrpl'} onClick={() => selectTab('xrpl')}>
              XRPL
            </Tab>
            <Tab selected={selectedTab === 'evm'} onClick={() => selectTab('evm')}>
              The Root Network
            </Tab>
          </TabWrapper>
        }
        {wallets.map(w =>
          w.type === selectedTab ? (
            <Wallet
              key={w.name}
              onClick={() => {
                w.onClick();
                close();
              }}
            >
              <WalletImage src={w.image} alt={w.name} />
              <NameWrapper>
                <Name>{w.name}</Name>
                <Description>{w.description}</Description>
              </NameWrapper>
            </Wallet>
          ) : null
        )}
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-8 px-24 py-0
`;

const Wallet = tw.div`
  flex gap-12 px-16 py-15 rounded-8 bg-neutral-15 hover:bg-neutral-20 clickable
`;
const TabWrapper = tw.div`flex gap-24 pb-8`;

interface Props {
  selected?: boolean;
}
const Tab = styled.div<Props>(({ selected }) => [
  tw`font-b-16 clickable`,
  selected ? tw`text-primary-60` : tw`text-neutral-60`,
]);
const WalletImage = tw.img`
  w-36 h-36 rounded-8 flex-center object-cover overflow-hidden
`;
const NameWrapper = tw.div`
  flex flex-col
`;
const Name = tw.div`
  font-m-16 text-neutral-100
`;
const Description = tw.div`
  font-r-12 text-neutral-60
`;
