import { usePopupStore } from '~/states/components/popup';

export const usePopup = (id?: string) => {
  const { opened: _opened, open, close, toggle, reset } = usePopupStore();

  const opened = id ? _opened.find(i => i === id) : false;

  return {
    opened,
    open: () => open(id),
    close: () => close(id),
    toggle: () => toggle(id),
    reset,
  };
};
