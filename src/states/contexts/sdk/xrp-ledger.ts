import { Client } from 'xrpl';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { XRPL_WSS } from '~/constants';

import { logger } from '~/states/middleware/logger';

const client = new Client(XRPL_WSS);

interface State {
  client: Client;
  isConnected: boolean;
  setConnection: (isConnected: boolean) => void;
}

export const useXrplStore = create<State>()(
  immer(
    logger(set => ({
      name: 'XRPL_STORE',

      client,
      isConnected: false,
      setConnection: isConnected => set({ isConnected }),
    }))
  )
);
