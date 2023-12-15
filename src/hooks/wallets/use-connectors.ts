import {
  imageWalletCrossmark,
  imageWalletGem,
  imageWalletMetamask,
  imageWalletWalletConnect,
  imageWalletXumm,
} from '~/assets/images';

import { useWalletConnectorTypeStore } from '~/states/contexts/wallets/connector-type';
import { NETWORK } from '~/types';

import {
  useConnectWithCrossmarkWallet,
  useConnectWithEvmWallet,
  useConnectWithGemWallet,
  useConnectWithXummWallet,
} from '.';

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

  const {
    connect: connectXrpXumm,
    isConnected: xummConnected,
    isInstalled: xummIsInstalled,
  } = useConnectWithXummWallet();

  // TODO: add dcent wallet

  const connectors = [
    {
      name: 'Crossmark',
      connectorName: ['crossmark'],
      image: imageWalletCrossmark,
      network: [NETWORK.XRPL],

      connect: connectXrpCrossmark,
      connected: crossMarkConnected,
      isInstalled: crossMarkInstalled,
    },
    {
      name: 'Gem Wallet',
      connectorName: ['gem'],
      image: imageWalletGem,
      network: [NETWORK.XRPL],

      connect: connectXrpGem,
      connected: gemConnected,
      isInstalled: gemIsInstalled,
    },
    {
      name: 'Xumm Wallet',
      connectorName: ['xumm'],
      image: imageWalletXumm,
      network: [NETWORK.XRPL],

      connect: connectXrpXumm,
      connected: xummConnected,
      isInstalled: xummIsInstalled,
    },
    {
      name: 'Metamask',
      connectorName: ['metamask'],
      image: imageWalletMetamask,
      network: [NETWORK.THE_ROOT_NETWORK, NETWORK.EVM_SIDECHAIN],

      connect: connectMetamask,
      connected: metamaskConnected,
      isInstalled: metamaskIsInstalled,
    },
    {
      name: 'Wallet Connect',
      connectorName: ['walletconnect'],
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
