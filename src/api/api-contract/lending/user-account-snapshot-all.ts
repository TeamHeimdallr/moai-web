import { useUserAccountSnapshotAll as useUserAccountSnapshotAllEvm } from '../_evm/lending/user-account-snapshot-all';

export const useUserAccountSnapshotAll = () => {
  const resEvm = useUserAccountSnapshotAllEvm();
  return resEvm;
};
