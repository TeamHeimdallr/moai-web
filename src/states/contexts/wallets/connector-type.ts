import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';
import { NETWORK } from '~/types';

interface Base {
  network: NETWORK | undefined;
}
interface State extends Base {
  setWalletConnectorType: ({ network }: Base) => void;
}

export const useWalletConnectorTypeStore = create<State>()(
  immer(
    logger(set => ({
      name: 'WALLET_CONNECTOR_TYPE_STORE',
      network: undefined,
      setWalletConnectorType: ({ network }: Base) => set({ network }),
    }))
  )
);
