import { useEffect } from 'react';

export const useRequirePrarams = (params: boolean[], callback: () => void) => {
  const hasParams = params.every(param => param !== undefined);

  useEffect(() => {
    if (!hasParams) {
      callback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasParams]);
};
