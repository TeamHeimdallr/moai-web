import { Address, useAccount, useContractRead } from 'wagmi';

import { EVM_CONTRACT_ADDRESS } from '~/constants';

import { NETWORK } from '~/types';

import { FUTUREPASS_REGISTER_ABI } from '~/abi/futurepass-register';

import { useNetwork } from '../contexts/use-network';

interface Props {
  enabled?: boolean;
}
export const useFuturepassOf = ({ enabled }: Props) => {
  const { address: walletAddress } = useAccount();
  const { isFpass } = useNetwork();

  const {
    data: _data,
    refetch,
    ...rest
  } = useContractRead({
    address: EVM_CONTRACT_ADDRESS[NETWORK.THE_ROOT_NETWORK].FUTUREPASS_REGISTER as Address,
    abi: FUTUREPASS_REGISTER_ABI,
    functionName: 'futurepassOf',
    args: [walletAddress],

    enabled: enabled && !!walletAddress && isFpass,
  });

  const data = _data as `0x${string}` | undefined;

  return { data, refetch, ...rest };
};
