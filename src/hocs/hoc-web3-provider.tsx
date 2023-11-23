import { publicProvider } from '@wagmi/core/providers/public';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';

import { imageMoai } from '~/assets/images';

import { WALLETCONNECT_PROJECT_ID } from '~/constants';

import { theRootNetwork, xrpEvmSidechain } from '~/configs/evm-network';

interface Props {
  children: React.ReactNode;
}

const projectId = WALLETCONNECT_PROJECT_ID as string;
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [theRootNetwork, xrpEvmSidechain],
  [publicProvider()]
);

const wagmiConfig = createConfig(
  getDefaultConfig({
    autoConnect: true,
    chains,

    walletConnectProjectId: projectId,
    appName: 'Moai Finance',

    appUrl: 'https://moai-finance.xyz', // your app's url
    appIcon: imageMoai,

    publicClient,
    webSocketPublicClient,
  })
);

const Web3Provider = ({ children }: Props) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </WagmiConfig>
  );
};

export default Web3Provider;
