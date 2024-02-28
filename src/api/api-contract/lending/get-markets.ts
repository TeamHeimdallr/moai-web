import { Address } from 'viem';

import { useGetMarkets as useGetMarketsEvm } from '../_evm/lending/get-markets';

interface Props {
  mTokenAddress: Address;
}
export const useGetMarkets = ({ mTokenAddress }: Props) => {
  const resEvm = useGetMarketsEvm({ mTokenAddress });
  return resEvm;
};
