import { useMediaQuery as useResponsive } from 'react-responsive';

import { BREAKPOINT } from '~/constants';

export const useMediaQuery = () => {
  const isXS = useResponsive({ query: `${BREAKPOINT.MEDIA_XS}` });
  const isSM = useResponsive({ query: `${BREAKPOINT.MEDIA_SM}` });
  const isSMD = useResponsive({ query: `${BREAKPOINT.MEDIA_SMD}` });
  const isMD = useResponsive({ query: `${BREAKPOINT.MEDIA_MD}` });
  const isMLG = useResponsive({ query: `${BREAKPOINT.MEDIA_MLG}` });
  const isLG = useResponsive({ query: `${BREAKPOINT.MEDIA_LG}` });
  const isXL = useResponsive({ query: `${BREAKPOINT.MEDIA_XL}` });
  const isXXL = useResponsive({ query: `${BREAKPOINT.MEDIA_XXL}` });

  return {
    isXXL,
    isXL,
    isLG,
    isMLG,
    isMD,
    isSMD,
    isSM,
    isXS,
  };
};
