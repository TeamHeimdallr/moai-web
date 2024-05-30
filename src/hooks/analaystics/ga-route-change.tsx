import { useEffect } from 'react';
import onRouteChange from '@analytics/router-utils';

import { ENABLE_GA_LOG, IS_LOCAL } from '~/constants';

// import { analytics } from '~/configs/analystics';

export const useGARouteChange = () => {
  useEffect(() => {
    const remove = onRouteChange(newRoutePath => {
      if (IS_LOCAL && ENABLE_GA_LOG) {
        console.log('[GA] new route path', newRoutePath);
        return;
      }
      // analytics.page();
    });

    return () => {
      remove?.();
    };
  }, []);
};
