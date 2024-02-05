import { usePopupStore } from '~/states/components/popup';

interface Props {
  id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any;
  callback?: (id?: string) => void;
  unmountCallback?: (id?: string) => void;
  callImmediately?: boolean;
}
export const usePopup = (id?: string) => {
  const {
    open: _open,
    close: _close,
    opened: _opened,
    params: _params,
    callback: _callback,
    unmountCallback: _unmountCallback,
    reset,
  } = usePopupStore();

  const opened = id ? _opened.find(i => i === id) : false;
  const params = id ? _params[id] : undefined;
  const callback = id ? _callback[id] : undefined;
  const unmountCallback = id ? _unmountCallback[id] : undefined;

  const open = (props?: Props) => {
    const { params, callback, unmountCallback, callImmediately } = props || {};
    _open({ id, params, callback, unmountCallback, callImmediately });
  };

  const close = (props?: Props) => {
    const { callback, callImmediately } = props || {};
    _close({ id, callback, callImmediately });
  };

  return {
    opened,
    params,
    callback,
    unmountCallback,
    open,
    close,
    reset,
  };
};
