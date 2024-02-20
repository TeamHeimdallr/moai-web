import { useParams } from 'react-router-dom';
import { Abi, Address, formatEther } from 'viem';
import { useContractRead } from 'wagmi';

import { UNITROLLER_ADDRESS } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { COMPTROLLER_ABI } from '~/abi/comptroller';

/**
 * @description Account Liquidity represents the USD value borrowable by a user, before it reaches liquidation.
 *  Users with a shortfall (negative liquidity) are subject to liquidation, and can’t withdraw or borrow assets until Account Liquidity is positive again.
 */
export const useUserAccountLiquidity = () => {
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const {
    data,
    refetch: liquidityRefetch,
    isError: isContractReadError,
  } = useContractRead({
    address: UNITROLLER_ADDRESS[NETWORK.THE_ROOT_NETWORK] as Address,
    abi: COMPTROLLER_ABI as Abi,
    functionName: 'getAccountLiquidity',
    chainId,

    args: [walletAddress],
    staleTime: 1000 * 3,
    enabled: !!walletAddress && !!chainId && isEvm,
  });

  const noParticipation = !data;
  const isError = data?.[0] !== 0n || isContractReadError;

  const netWorthRaw = noParticipation || isError ? 0 : data?.[1] > 0 ? data?.[1] : -data?.[2];
  const netWorth = formatEther(netWorthRaw);

  const refetch = () => {
    liquidityRefetch();
  };
  return {
    netWorthRaw,
    netWorth,
    refetch,
  };
};
