import { Client } from 'xrpl';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../middleware/logger';

export interface XrplState {
  client: Client;
  isConnected: boolean;
  setConnection: (isConnected: boolean) => void;
}

export const useXrplStore = create<XrplState>()(
  immer(
    logger(set => ({
      name: 'xrpl-store',
      client: new Client('wss://amm.devnet.rippletest.net:51233/'), // TODO
      isConnected: false,
      setConnection: isConnected => set({ isConnected }),
    }))
  )
);
