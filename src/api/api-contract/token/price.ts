import { useTokenPrice as useTokenPriceEvm } from '~/api/api-contract/_evm/token/price';
import { useTokenPrice as useTokenPriceXrp } from '~/api/api-contract/_xrpl/token/price';

import { useNetwork } from '~/hooks/contexts/use-network';

export const useTokenPrice = () => {
  const { isEvm } = useNetwork();

  const resEvm = useTokenPriceEvm();
  const resXrp = useTokenPriceXrp();

  return isEvm ? resEvm : resXrp;
};
