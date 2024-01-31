import { usePopupStore } from '~/states/components/popup';

interface Props {
  id?: string;
  callback?: (id?: string) => void;
  unmountCallback?: (id?: string) => void;
  callImmediately?: boolean;
}
export const usePopup = (id?: string) => {
  const {
    opened: _opened,
    open: _open,
    close: _close,
    reset,
    callback: _callback,
    unmountCallback: _unmountCallback,
  } = usePopupStore();

  const opened = id ? _opened.find(i => i === id) : false;
  const callback = id ? _callback[id] : undefined;
  const unmountCallback = id ? _unmountCallback[id] : undefined;

  const open = (props?: Props) => {
    const { callback, unmountCallback, callImmediately } = props || {};
    _open({ id, callback, unmountCallback, callImmediately });
  };

  const close = (props?: Props) => {
    const { callback, callImmediately } = props || {};
    _close({ id, callback, callImmediately });
  };

  return {
    opened,
    callback,
    unmountCallback,
    open,
    close,
    reset,
  };
};
