import { useEffect, useState } from 'react';
import reactGA from 'react-ga';
import { useLocation } from 'react-router-dom';

import { GOOGLE_ANALYTICS_TRAKING_ID, IS_LOCAL } from '~/constants';

export const useGARouteChangeTracker = () => {
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  // localhost로 실행시 추적 방지
  useEffect(() => {
    reactGA.initialize(GOOGLE_ANALYTICS_TRAKING_ID, { debug: IS_LOCAL });
    setInitialized(true);
  }, []);

  // 초기화 완료 되었다면 location 변화 추적하고 pageview 이벤트 발생.
  useEffect(() => {
    if (!initialized) return;

    reactGA.set({ page: location.pathname });
    reactGA.pageview(location.pathname + location.search);
  }, [initialized, location]);
};
