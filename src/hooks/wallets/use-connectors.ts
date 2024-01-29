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
    disconnect: disconnectMetamask,
    metamaskConnected,
    walletConnectionConnected,
    isInstalled: metamaskIsInstalled,
  } = useConnectWithEvmWallet();

  const {
    connect: connectXrpCrossmark,
    disconnect: disconnectXrpCrossmark,
    isConnected: crossMarkConnected,
    isInstalled: crossMarkInstalled,
  } = useConnectWithCrossmarkWallet();

  const {
    connect: connectXrpGem,
    disconnect: disconnectXrpGem,
    isConnected: gemConnected,
    isInstalled: gemIsInstalled,
  } = useConnectWithGemWallet();

  const {
    connect: connectXrpXumm,
    disconnect: disconnectXrpXumm,
    isConnected: xummConnected,
    isInstalled: xummIsInstalled,
  } = useConnectWithXummWallet();

  // const {
  //   connect: connectXrpDcent,
  //   disconnect: disconnectXrpDcent,
  //   isConnected: dcentConnected,
  //   isInstalled: dcentIsInstalled,
  // } = useConnectWithDcentWallet();

  // TODO: add dcent wallet

  const connectors = [
    {
      name: 'Xaman Wallet',
      connectorName: ['xumm'],
      image: imageWalletXumm,
      network: [NETWORK.XRPL],

      connect: connectXrpXumm,
      disconnect: disconnectXrpXumm,
      connected: xummConnected,
      isInstalled: xummIsInstalled,
    },
    // TODO: not yet supported AMM
    // {
    //   name: "D'Cent Wallet",
    //   connectorName: ['dcent'],
    //   image: imageWalletDcent,
    //   network: [NETWORK.XRPL],

    //   connect: connectXrpDcent,
    //   disconnect: disconnectXrpDcent,
    //   connected: dcentConnected,
    //   isInstalled: dcentIsInstalled,
    // },
    {
      name: 'Crossmark',
      connectorName: ['crossmark'],
      image: imageWalletCrossmark,
      network: [NETWORK.XRPL],

      connect: connectXrpCrossmark,
      disconnect: disconnectXrpCrossmark,
      connected: crossMarkConnected,
      isInstalled: crossMarkInstalled,
    },
    {
      name: 'Gem Wallet',
      connectorName: ['gem'],
      image: imageWalletGem,
      network: [NETWORK.XRPL],

      connect: connectXrpGem,
      disconnect: disconnectXrpGem,
      connected: gemConnected,
      isInstalled: gemIsInstalled,
    },
    {
      name: 'Metamask',
      connectorName: ['metamask'],
      image: imageWalletMetamask,
      network: [NETWORK.THE_ROOT_NETWORK, NETWORK.EVM_SIDECHAIN],

      connect: connectMetamask,
      disconnect: disconnectMetamask,
      connected: metamaskConnected,
      isInstalled: metamaskIsInstalled,
    },
    {
      name: 'Wallet Connect',
      connectorName: ['walletconnect'],
      image: imageWalletWalletConnect,
      network: [NETWORK.THE_ROOT_NETWORK, NETWORK.EVM_SIDECHAIN],

      connect: connectByWalletConnect,
      disconnect: disconnectMetamask,
      connected: walletConnectionConnected,
      isInstalled: true,
    },
  ];

  const targetConnectors = network
    ? connectors.filter(c => c.network.includes(network))
    : connectors;

  return { connectors, targetConnectors };
};
