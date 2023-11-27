import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw from 'twin.macro';

import {
  imageWalletCrossmark,
  imageWalletGem,
  imageWalletMetamask,
  imageWalletWalletConnect,
} from '~/assets/images';

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
interface Props {
  evm: boolean;
  xrpl: boolean;
}
export const ConnectWallet = ({ evm, xrpl }: Props) => {
  const { close } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { connect: connectEvm, connectByWalletConnect } = useConnectWithEvmWallet();
  const { connect: connectXrpCrossmark } = useConnectWithCrossmarkWallet();
  const { connect: connectXrpGem } = useConnectWithGemWallet();
  const { t } = useTranslation();

  // TODO: use useNetworkWallet hook - 연결하고자 하는 네트워크에 따라서 지원하는 지갑 목록을 보여주는 기능 처리 필요
  const wallets: Wallet[] = [
    {
      name: 'Metamask',
      description: 'Supports The Root Network and EVM Sidechain',
      image: imageWalletMetamask,
      onClick: connectEvm,
      type: 'evm',
    },
    {
      name: 'Wallet Connect',
      description: 'Supports The Root Network and EVM Sidechain',
      image: imageWalletWalletConnect,
      onClick: connectByWalletConnect,
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
  ].filter(w => (w.type === 'evm' && evm) || (w.type === 'xrpl' && xrpl));

  return (
    <Popup id={POPUP_ID.CONNECT_WALLET} title={t('Connect wallet')}>
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

const WalletImage = tw(LazyLoadImage)`
  w-36 h-36 rounded-8 flex-center object-cover overflow-hidden
`;
const NameWrapper = tw.div`
  flex-center flex-col
`;
const Name = tw.div`
  font-m-16 text-neutral-100
`;
