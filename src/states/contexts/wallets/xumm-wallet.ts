import { XummSdkJwt } from 'xumm-sdk';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface Base {
  isConnected: boolean;
  address: string;
  jwt: string;
}
interface State extends Base {
  client: XummSdkJwt | undefined;
  setInfo: ({ isConnected, address, jwt }: Partial<Base>) => void;
}

export const useXummWalletStore = create<State>()(
  immer(
    logger(set => ({
      name: 'XUMM_WALLET_STORE',
      isConnected: false,
      address: '',
      jwt: '',

      client: undefined,

      setInfo: ({ isConnected, address, jwt }: Partial<Base>) => {
        const client = jwt ? new XummSdkJwt(jwt) : undefined;
        return set({ isConnected, address, jwt, client });
      },
    }))
  )
);
