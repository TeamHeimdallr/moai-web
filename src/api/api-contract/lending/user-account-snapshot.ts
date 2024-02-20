import { Address } from 'viem';

import { useUserAccountSnapshot as useUserAccountSnapshotEvm } from '../_evm/lending/user-account-snapshot';

interface Props {
  mTokenAddress: Address;
}
export const useUserAccountSnapshot = ({ mTokenAddress }: Props) => {
  const resEvm = useUserAccountSnapshotEvm({ mTokenAddress });
  return resEvm;
};
