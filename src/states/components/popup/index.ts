import { produce } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../../middleware/logger';

interface Props {
  id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any;
  callback?: (id?: string) => void;
  unmountCallback?: (id?: string) => void;
  callImmediately?: boolean;
}
interface State {
  opened: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>;
  callback: Record<string, (id?: string) => void>;
  unmountCallback: Record<string, (id?: string) => void>;

  open: (props: Props) => void;
  close: (props: Props) => void;

  reset: () => void;
}

export const usePopupStore = create<State>()(
  immer(
    logger(set => ({
      name: 'popup-store',
      opened: [] as string[],
      params: {},
      callback: {},
      unmountCallback: {},

      open: ({ id, params, callback, unmountCallback, callImmediately }) =>
        set(
          produce<State>(state => {
            if (id && !state.opened.includes(id)) {
              state.opened.push(id);

              if (params) {
                state.params[id] = params;
              }
              if (callback) {
                if (callImmediately) callback?.(id);
                else state.callback[id] = callback;
              }
              if (unmountCallback) state.unmountCallback[id] = unmountCallback;
            }
          })
        ),
      close: ({ id, callback, unmountCallback, callImmediately }) =>
        set(
          produce<State>(state => {
            if (id) {
              const idx = state.opened.findIndex(i => i === id);
              if (idx >= 0) {
                state.opened.splice(idx, 1);
                state.params[id] = undefined;

                if (callback && callImmediately) callback?.(id);
                if (unmountCallback) state.unmountCallback[id] = unmountCallback;
              }
            }
          })
        ),

      reset: () => set({ opened: [], callback: {}, unmountCallback: {}, params: {} }),
    }))
  )
);
