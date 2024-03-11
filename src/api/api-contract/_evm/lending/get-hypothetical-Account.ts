import { useParams } from 'react-router-dom';
import { Abi, Address } from 'viem';
import { useContractRead } from 'wagmi';

import { UNITROLLER_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { COMPTROLLER_ABI } from '~/abi/comptroller';

/**
 * @description Get Hypothetical Account Liquidity
 */
interface Props {
  mTokenAddress: Address;
  redeemAmount: bigint;
  borrowAmount: bigint;
}
export const useGetHypotheticalAccount = ({ mTokenAddress, redeemAmount, borrowAmount }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data, refetch } = useContractRead({
    address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: COMPTROLLER_ABI as Abi,
    functionName: 'getHypotheticalAccountLiquidity',
    chainId,

    args: [walletAddress, mTokenAddress, redeemAmount, borrowAmount],
    staleTime: 1000 * 3,
    enabled: !!chainId && isEvm && !!walletAddress && !!mTokenAddress,
  });

  return {
    liquidityError: data?.[0],
    liquidity: data?.[1] || 0n,
    shortfall: data?.[2] || 0n,
    refetch,
  };
};
