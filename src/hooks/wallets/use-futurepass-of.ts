import { useAccount, useContractRead } from 'wagmi';

import { EVM_CONTRACT_ADDRESS } from '~/constants';

import { NETWORK } from '~/types';

import { FUTUREPASS_REGISTER_ABI } from '~/abi/futurepass-register';

interface Props {
  enabled?: boolean;
}
export const useFuturepassOf = ({ enabled }: Props) => {
  const { address: walletAddress } = useAccount();

  const { data: _data, ...rest } = useContractRead({
    address: EVM_CONTRACT_ADDRESS[NETWORK.THE_ROOT_NETWORK].FUTUREPASS_REGISTER,
    abi: FUTUREPASS_REGISTER_ABI,
    functionName: 'futurepassOf',
    args: [walletAddress],

    enabled: enabled && !!walletAddress,
  });

  const data = _data as `0x${string}` | undefined;

  return { data, ...rest };
};
