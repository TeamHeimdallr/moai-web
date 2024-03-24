import { useUnfarm as useUnfarmEvm } from '~/api/api-contract/_evm/lp-farm/unfarm-evm';
import { useUnfarmSubstrate as useUnfarmFpass } from '~/api/api-contract/_evm/lp-farm/unfarm-substrate';

import { useNetwork } from '~/hooks/contexts/use-network';

interface Props {
  poolId: string;
  unfarmAmount: bigint;
  enabled?: boolean;
}

export const useUnfarm = ({ poolId, unfarmAmount, enabled }: Props) => {
  const { isFpass } = useNetwork();

  const resEvm = useUnfarmEvm({
    poolId,
    unfarmAmount,
    enabled,
  });

  const resFpass = useUnfarmFpass({
    poolId,
    unfarmAmount,
    enabled,
  });

  return isFpass ? resFpass : resEvm;
};
