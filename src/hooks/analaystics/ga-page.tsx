import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { ENABLE_GA_LOG, IS_LOCAL } from '~/constants';

// import { analytics } from '~/configs/analystics';

export const useGAPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (IS_LOCAL && ENABLE_GA_LOG) {
      console.log(`[GA] page entered ${location.pathname}`);
      return;
    }
    // analytics.page();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
