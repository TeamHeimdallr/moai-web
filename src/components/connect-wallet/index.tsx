import tw from 'twin.macro';

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
  onClick: () => void;
}
export const ConnectWallet = () => {
  const { close } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { connect: connectEvm } = useConnectWithEvmWallet();
  const { connect: connectXrpCrossmark } = useConnectWithCrossmarkWallet();
  const { connect: connectXrpGem } = useConnectWithGemWallet();

  const wallets: Wallet[] = [
    {
      name: 'Metamask',
      description: 'Supports The root network and EVM Sidechain',
      image: imageWalletMetamask,
      onClick: connectEvm,
    },
    {
      name: 'Crossmark Wallet',
      description: 'Supports XRPL network',
      image: imageWalletCrossmark,
      onClick: connectXrpCrossmark,
    },
    {
      name: 'Gem Wallet',
      description: 'Supports XRPL network',
      image: imageWalletGem,
      onClick: connectXrpGem,
    },
  ];

  return (
    <Popup id={POPUP_ID.CONNECT_WALLET} title="Connect wallet">
      <Wrapper>
        {wallets.map(w => (
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
