import { Client } from 'xrpl';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { XRPL_WSS_TEST_NET } from '~/constants';

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
      client: new Client(XRPL_WSS_TEST_NET),
      isConnected: false,
      setConnection: isConnected => set({ isConnected }),
    }))
  )
);
