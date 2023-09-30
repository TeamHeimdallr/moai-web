import { useWeb3Modal } from '@web3modal/react';
import tw from 'twin.macro';

import { IconGem, IconMetamask } from '~/assets/icons';

import { Popup } from '~/components/popup';

import { useConnectXrplWallet } from '~/hooks/data/use-connect-xrpl-wallet';
import { usePopup } from '~/hooks/pages/use-popup';
import { POPUP_ID } from '~/types/components';

export const SelectWalletPopup = () => {
  const { close } = usePopup(POPUP_ID.WALLET);
  const { isInstalled, connect: connectGemWallet } = useConnectXrplWallet();
  const { open } = useWeb3Modal();

  const wallets = [
    {
      name: 'Gem Wallet',
      description: 'Supports XRPL network',
      icon: <IconGem />,
      onClick: () => {
        if (!isInstalled) return;
        connectGemWallet();
        close();
      },
    },
    {
      name: 'Metamask',
      description: 'Supports The root network and EVM Sidechain',
      icon: <IconMetamask />,
      onClick: () => {
        open();
        close();
      },
    },
  ];

  return (
    <Popup id={POPUP_ID.WALLET} title={'Connect wallet'}>
      <Wrapper>
        {wallets.map(w => (
          <Wallet key={w.name} onClick={w.onClick}>
            <Icon>{w.icon}</Icon>
            <NameWrapper>
              <Name>{w.name}</Name>
              <Description>{w.description}</Description>
            </NameWrapper>
          </Wallet>
        ))}
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-12 px-24 py-0
`;

const Wallet = tw.div`
  flex gap-12 px-16 py-15 rounded-8 bg-neutral-15 hover:bg-neutral-20 clickable
`;

const Icon = tw.div``;
const NameWrapper = tw.div`
  flex flex-col
`;
const Name = tw.div`
  font-m-16 text-neutral-100
`;
const Description = tw.div`
  font-r-12 text-neutral-60
`;
