import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

export interface XrplWalletState {
  isInstalled: boolean;
  isConnected: boolean;
  address: string;

  setIsInstalled: (isInstalled: boolean) => void;
  setIsConnected: (isConnected: boolean) => void;
  setAddress: (address: string) => void;
  setInfo: ({
    isInstalled,
    isConnected,
    address,
  }: {
    isInstalled: boolean;
    isConnected: boolean;
    address: string;
  }) => void;
}

export const useXrplWalletStore = create<XrplWalletState>()(
  immer(
    persist(
      logger(set => ({
        name: 'xrpl-wallet-store',
        isInstalled: false,
        isConnected: false,
        address: '',

        setIsInstalled: (isInstalled: boolean) => set({ isInstalled }),
        setIsConnected: (isConnected: boolean) => set({ isConnected }),
        setAddress: (address: string) => set({ address }),
        setInfo: ({
          isInstalled,
          isConnected,
          address,
        }: {
          isInstalled: boolean;
          isConnected: boolean;
          address: string;
        }) => set({ isInstalled, isConnected, address }),
      })),
      { name: 'xrpl-wallet-store' }
    )
  )
);
