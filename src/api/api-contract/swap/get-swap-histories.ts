import { Address } from 'wagmi';

import { useGetSwapHistories as useGetSwapHistoriesEvm } from '~/api/api-contract/_evm/swap/get-swap-histories';
import { useGetSwapHistories as useGetSwapHistoriesXrp } from '~/api/api-contract/_xrpl/swap/get-swap-histories';

import { useNetwork } from '~/hooks/contexts/use-network';

interface Props {
  id: string;
}

export const useGetSwapHistories = ({ id }: Props) => {
  const { isXrp } = useNetwork();

  const resEvm = useGetSwapHistoriesEvm({ id: id as Address });
  const resXrp = useGetSwapHistoriesXrp({ id });

  return isXrp ? resXrp : resEvm;
};
