import { useFarm as useFarmEvm } from '~/api/api-contract/_evm/lp-farm/farm-evm';
import { useFarmSubstrate as useFarmFpass } from '~/api/api-contract/_evm/lp-farm/farm-substrate';

import { useNetwork } from '~/hooks/contexts/use-network';

interface Props {
  poolId: string;
  farmAmount: bigint;
  enabled?: boolean;
}

export const useFarm = ({ poolId, farmAmount, enabled }: Props) => {
  const { isFpass } = useNetwork();

  const resEvm = useFarmEvm({
    poolId,
    farmAmount,
    enabled,
  });

  const resFpass = useFarmFpass({
    poolId,
    farmAmount,
    enabled,
  });

  return isFpass ? resFpass : resEvm;
};
