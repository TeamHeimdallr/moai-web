import {
  imageWalletCrossmark,
  imageWalletGem,
  imageWalletMetamask,
  imageWalletWalletConnect,
} from '~/assets/images';

import { useWalletConnectorTypeStore } from '~/states/contexts/wallets/connector-type';
import { NETWORK } from '~/types';

import { useConnectWithCrossmarkWallet, useConnectWithEvmWallet, useConnectWithGemWallet } from '.';

export const useConnectors = () => {
  const { network } = useWalletConnectorTypeStore();

  const {
    connect: connectMetamask,
    connectByWalletConnect,
    metamaskConnected,
    walletConnectionConnected,
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

  // TODO: add xumm, dcent wallet

  const connectors = [
    {
      name: 'Crossmark',
      image: imageWalletCrossmark,
      network: [NETWORK.XRPL],

      connect: connectXrpCrossmark,
      connected: crossMarkConnected,
      isInstalled: crossMarkInstalled,
    },
    {
      name: 'Gem Wallet',
      image: imageWalletGem,
      network: [NETWORK.XRPL],

      connect: connectXrpGem,
      connected: gemConnected,
      isInstalled: gemIsInstalled,
    },
    {
      name: 'Metamask',
      image: imageWalletMetamask,
      network: [NETWORK.THE_ROOT_NETWORK, NETWORK.EVM_SIDECHAIN],

      connect: connectMetamask,
      connected: metamaskConnected,
      isInstalled: metamaskIsInstalled,
    },
    {
      name: 'Wallet Connect',
      image: imageWalletWalletConnect,
      network: [NETWORK.THE_ROOT_NETWORK, NETWORK.EVM_SIDECHAIN],

      connect: connectByWalletConnect,
      connected: walletConnectionConnected,
      isInstalled: true,
    },
  ];

  const targetConnectors = network
    ? connectors.filter(c => c.network.includes(network))
    : connectors;

  return { connectors, targetConnectors };
};
