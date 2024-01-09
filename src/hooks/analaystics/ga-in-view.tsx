import { useEffect } from 'react';
import { useInView as rioUseInView } from 'react-intersection-observer';
import { useLocation } from 'react-router-dom';

import { ENABLE_GA_LOG, IS_LOCAL } from '~/constants';

import { analytics } from '~/configs/analystics';

interface Props {
  name?: string;
}
export const useGAInView = ({ name }: Props) => {
  const location = useLocation();

  const { ref, inView } = rioUseInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView) {
      if (IS_LOCAL && ENABLE_GA_LOG) {
        console.log(`[GTM] component-shown ${name}`);
        return;
      }

      analytics.track('component-shown', {
        page: location.pathname,
        name,
      });
    }
  }, [inView, location.pathname, name]);

  return { ref, inView };
};
