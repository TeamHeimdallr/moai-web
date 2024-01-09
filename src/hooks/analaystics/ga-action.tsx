import { useLocation } from 'react-router-dom';

import { IS_LOCAL } from '~/constants';

import { analytics } from '~/configs/analystics';

interface GAActionProps {
  page?: string;

  action: string; // add-liquidity

  text?: string; // button text(en)
  type?: 'button' | 'dropdown';
  buttonType?: string; // primary-large | custom ...

  event?: string; // click | hover | ...

  data?: Record<string, string>;
}

export const useGAAction = () => {
  const location = useLocation();

  const gaAction = ({
    page = location.pathname,
    action,
    text,
    type = 'button',
    buttonType,
    event = 'click',
    data,
  }: GAActionProps) => {
    if (IS_LOCAL) {
      console.log('[GTM] action', {
        page,
        action,
        text,
        type,
        buttonType,
        event,
        data,
      });

      return;
    }
    analytics.track(action, {
      page,
      action,
      text,
      type,
      buttonType,
      event,
      data,
    });
  };

  const gaLanguageChange = (
    page: string = location.pathname,
    action: string = 'launguage-change'
  ) => {
    if (IS_LOCAL) {
      console.log('[GTM] action', {
        page,
        action,
      });

      return;
    }
    analytics.track(action, { page, action });
  };

  return { gaAction, gaLanguageChange };
};
