import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { configureChains, createConfig } from 'wagmi';
import { goerli, mainnet } from 'wagmi/chains';

import { IS_MAINNET, WALLETCONNECT_PROJECT_ID } from '~/constants';

export const chains = IS_MAINNET ? [mainnet] : [goerli];
export const projectId = WALLETCONNECT_PROJECT_ID;

const { publicClient } = configureChains([...chains], [w3mProvider({ projectId })]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);
