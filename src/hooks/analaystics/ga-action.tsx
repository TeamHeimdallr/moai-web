import { useLocation } from 'react-router-dom';

import { ENABLE_GA_LOG, IS_LOCAL } from '~/constants';

import { analytics } from '~/configs/analystics';

import { useConnectedWallet } from '../wallets';

interface GAActionProps {
  page?: string;

  action: string; // add-liquidity

  text?: string; // button text(en)
  type?: 'button' | 'dropdown';
  buttonType?: string; // primary-large | custom ...

  event?: string; // click | hover | ...

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
}

export const useGAAction = () => {
  const { evm, xrp, fpass } = useConnectedWallet();
  const walletAddress = {
    evm: evm.address,
    xrp: xrp.address,
    fpass: fpass.address,
  };

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
    if (IS_LOCAL && ENABLE_GA_LOG) {
      console.log('[GTM] action', {
        walletAddress,
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
      walletAddress,
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
    if (IS_LOCAL && ENABLE_GA_LOG) {
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
