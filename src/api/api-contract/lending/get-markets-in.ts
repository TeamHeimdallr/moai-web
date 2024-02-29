import { useGetAssetsIn as useGetAssetsInEvm } from '../_evm/lending/get-assets-in';

export const useGetAssetsIn = () => {
  const resEvm = useGetAssetsInEvm();
  return resEvm;
};
