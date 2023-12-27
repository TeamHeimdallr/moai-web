import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  qr: string;
  setQr: (qr: string) => void;
}

export const useXummQrStore = create<State>()(
  immer(
    logger(set => ({
      name: 'XUMM_QR_STORE',

      qr: '',
      setQr: (qr: string) => set({ qr }),
    }))
  )
);
