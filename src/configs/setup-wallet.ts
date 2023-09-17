import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { configureChains, createConfig } from 'wagmi';
import { linea, lineaTestnet, mantle, mantleTestnet } from 'wagmi/chains';

import { IS_MAINNET, WALLETCONNECT_PROJECT_ID } from '~/constants';

import { theRootNetwork } from './setup-network';

export const chains = IS_MAINNET ? [mantle, linea] : [mantleTestnet, lineaTestnet, theRootNetwork];
export const projectId = WALLETCONNECT_PROJECT_ID;

const { publicClient } = configureChains([...chains], [w3mProvider({ projectId })]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);
