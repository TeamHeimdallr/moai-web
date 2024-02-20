import { useParams } from 'react-router-dom';
import { Abi, Address } from 'viem';
import { useContractRead } from 'wagmi';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';

import { MTOKEN_ABI } from '~/abi/mtoken';

/**
 * @description Get a snapshot of the account's balances, and the cached exchange rate
 */
interface Props {
  mTokenAddress: Address;
}
export const useUserAccountSnapshot = ({ mTokenAddress }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data, refetch } = useContractRead({
    address: mTokenAddress as Address,
    abi: MTOKEN_ABI as Abi,
    functionName: 'getAccountSnapshot',
    chainId,

    args: [walletAddress],
    staleTime: 1000 * 3,
    enabled: !!walletAddress && !!chainId && isEvm && !!mTokenAddress,
  });

  console.log(data);

  return {
    data,
    refetch,
  };
};
