import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { WagmiConfig } from 'wagmi';

import { ethereumClient, projectId, wagmiConfig } from '~/configs/setup-wallet';

const Web3Modal = lazy(() =>
  import('@web3modal/react').then(({ Web3Modal }) => ({ default: Web3Modal }))
);

const queryClient = new QueryClient();

interface Props {
  children: React.ReactNode;
}
const Web3Provider = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
      <Suspense fallback={<></>}>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </Suspense>
    </QueryClientProvider>
  );
};

export default Web3Provider;
