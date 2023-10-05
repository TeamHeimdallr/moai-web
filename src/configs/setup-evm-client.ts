import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { configureChains, createConfig } from 'wagmi';

import { CHAIN, IS_MAINNET, WALLETCONNECT_PROJECT_ID } from '~/constants';

import { theRootNetwork, xrpEvmSidechain } from './setup-evm-network';

export const chains = IS_MAINNET ? [] : CHAIN === 'root' ? [theRootNetwork] : [xrpEvmSidechain];
export const projectId = WALLETCONNECT_PROJECT_ID;

const { publicClient, webSocketPublicClient } = configureChains(
  [...chains],
  [w3mProvider({ projectId })]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
  webSocketPublicClient,
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);
