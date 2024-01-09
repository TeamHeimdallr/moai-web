import { useEffect } from 'react';
import onRouteChange from '@analytics/router-utils';

import { IS_LOCAL } from '~/constants';

import { analytics } from '~/configs/analystics';

export const useGARouteChange = () => {
  useEffect(() => {
    const remove = onRouteChange(newRoutePath => {
      if (IS_LOCAL) console.log('[GA] new route path', newRoutePath);
      analytics.page();
    });

    return () => {
      remove?.();
    };
  }, []);
};
