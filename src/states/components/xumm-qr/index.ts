import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '~/states/middleware/logger';

interface State {
  qr: string;
  next: string;
  setQr: (qr: string) => void;
  setNext:(next: string) => void
}

export const useXummQrStore = create<State>()(
  immer(
    logger(set => ({
      name: 'XUMM_QR_STORE',

      qr: '',
      next: '',
      setQr: (qr: string) => set({ qr }),
      setNext:(next: string) => set({ next: next }),
    }))
  )
);
