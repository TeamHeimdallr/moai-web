import {
  imageNetworkROOT,
  imageNetworkXRPL,
  imageWalletCrossmark,
  imageWalletGem,
  imageWalletMetamask,
  imageWalletWalletConnect,
} from '~/assets/images';

import { NETWORK } from '~/types';

import { useConnectWithCrossmarkWallet, useConnectWithEvmWallet, useConnectWithGemWallet } from '.';

interface NetworkDetail {
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

export const useNetworkWallets = (network?: NETWORK) => {
  const {
    connect: connectMetamask,
    connectByWalletConnect,
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

  const networkMap: Record<NETWORK, NetworkDetail> = {
    [NETWORK.XRPL]: {
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
    [NETWORK.THE_ROOT_NETWORK]: {
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
        {
          name: 'Wallet Connect',
          image: imageWalletWalletConnect,
          connect: connectByWalletConnect,
          connected: metamaskConnected,
          isInstalled: metamaskIsInstalled,
        },
      ],
    },
    [NETWORK.EVM_SIDECHAIN]: {
      description: 'Evm sidechain',
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

  const currentNetwork: NetworkDetail | undefined = networkMap[network ?? ''];

  return { networkMap, currentNetwork };
};
