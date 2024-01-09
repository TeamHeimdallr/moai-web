import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { IS_LOCAL } from '~/constants';

import { analytics } from '~/configs/analystics';

export const useGAPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (IS_LOCAL) console.log(`[GA] page entered ${location.pathname}`);
    analytics.page();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
