import { useParams } from 'react-router-dom';
import { Abi, Address } from 'viem';
import { useContractRead } from 'wagmi';

import { MOAILENS_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { MOAI_LENS_ABI } from '~/abi/moai-lens';

/**
 * @description mToken's balance all
 */
interface Props {
  mTokenAddresses: Address[];
  enabled?: boolean;
}
export const useGetMTokenBalancesAll = ({ mTokenAddresses, enabled }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data, refetch } = useContractRead({
    address: MOAILENS_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: MOAI_LENS_ABI as Abi,
    functionName: 'cTokenBalancesAll',
    chainId,

    args: [mTokenAddresses, walletAddress],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!mTokenAddresses && !!walletAddress && enabled,
  });

  return {
    data,
    refetch,
  };
};
