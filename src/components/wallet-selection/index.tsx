import { getAddress, isInstalled } from '@gemwallet/api';
import tw from 'twin.macro';

import { IconGem, IconMetamask } from '~/assets/icons';
import { Popup } from '~/components/popup';
import { usePopup } from '~/hooks/pages/use-popup';
import { POPUP_ID } from '~/types/components';

export const SelectWalletPopup = () => {
  const { close } = usePopup(POPUP_ID.WALLET);

  const wallets = [
    {
      name: 'Gem Wallet',
      description: 'Supports XRPL network',
      icon: <IconGem />,
      onClick: () => {
        isInstalled().then(response => {
          if (response.result.isInstalled) {
            getAddress().then(response => {
              console.log(`Your address: ${response.result?.address}`);
            });
          } else {
            console.log('Gem Wallet is not installed');
          }
        });
        close();
      },
    },
    {
      name: 'Metamask',
      description: 'Supports The root network and EVM Sidechain',
      icon: <IconMetamask />,
      onClick: () => {
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
  flex flex-col gap-24 px-24 py-0
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
