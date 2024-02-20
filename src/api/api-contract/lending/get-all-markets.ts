import { useGetAllMarkets as useGetAllMarketsEvm } from '../_evm/lending/get-all-markets';

export const useGetAllMarkets = () => {
  const resEvm = useGetAllMarketsEvm();
  return resEvm;
};
