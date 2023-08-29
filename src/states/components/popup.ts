import { produce } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../middleware/logger';

export interface PopupState {
  opened: string[];

  open: (id?: string) => void;
  close: (id?: string) => void;
  toggle: (id?: string) => void;
  reset: () => void;
}

export const usePopupStore = create<PopupState>()(
  immer(
    logger(set => ({
      name: 'popup-store',
      opened: [] as string[],
      open: (id?: string) =>
        set(
          produce<PopupState>(state => {
            if (id) state.opened.push(id);
          })
        ),
      close: (id?: string) =>
        set(
          produce<PopupState>(state => {
            if (id) {
              const idx = state.opened.findIndex(i => i === id);
              if (idx >= 0) state.opened.splice(idx, 1);
            }
          })
        ),
      toggle: (id?: string) =>
        set(
          produce<PopupState>(state => {
            if (id) {
              const idx = state.opened.findIndex(i => i === id);
              if (idx >= 0) state.opened.splice(idx, 1);
              else state.opened.push(id);
            }
          })
        ),
      reset: () => set({ opened: [] }),
    }))
  )
);
