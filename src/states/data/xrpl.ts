import { Client } from 'xrpl';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

import client from '~/configs/setup-xrpl-wallet';

interface XrplState {
  client: Client;
  isConnected: boolean;
  setConnection: (isConnected: boolean) => void;
}

export const useXrplStore = create<XrplState>()(
  immer(
    logger(set => ({
      name: 'xrpl-store',
      client,
      isConnected: false,
      setConnection: isConnected => set({ isConnected }),
    }))
  )
);
