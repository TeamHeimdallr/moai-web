import { Address, useAccount, useContractRead } from 'wagmi';

import { IS_MAINNET } from '~/constants';

import { FUTUREPASS_REGISTER_ABI } from '~/abi/futurepass-register';

interface Props {
  enabled?: boolean;
}

const FUTUREPASS_REGISTER = IS_MAINNET
  ? '0x000000000000000000000000000000000000FFff'
  : '0x000000000000000000000000000000000000FFff';
export const useFuturepassOf = ({ enabled }: Props) => {
  const { address: walletAddress } = useAccount();

  const {
    data: _data,
    refetch,
    ...rest
  } = useContractRead({
    address: FUTUREPASS_REGISTER as Address,
    abi: FUTUREPASS_REGISTER_ABI,
    functionName: 'futurepassOf',
    args: [walletAddress],

    enabled: enabled && !!walletAddress,
  });

  const data = _data as `0x${string}` | undefined;

  return { data, refetch, ...rest };
};
