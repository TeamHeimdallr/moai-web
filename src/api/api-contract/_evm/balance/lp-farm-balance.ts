import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { NETWORK } from '~/types';

import { ERC20_TOKEN_ABI } from '~/abi';
import { LP_FARM_ABI } from '~/abi/lp-farm';

interface Props {
  farmAddress: Address;
  enabled?: boolean;
}
export const useUserLpFarmDeposited = ({ farmAddress, enabled }: Props) => {
  const { network } = useParams();
  const { selectedNetwork, isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;

  const { data: poolInfoData } = useContractRead({
    address: farmAddress as Address,
    abi: LP_FARM_ABI as Abi,
    functionName: 'poolInfo',
    args: [0],
    chainId,
    staleTime: 1000 * 3,
    enabled: !!enabled && !!walletAddress && isRoot,
  });
  const lpTokenAddress = poolInfoData?.[0];

  const { data: rewardPerBlockData } = useContractRead({
    address: farmAddress as Address,
    abi: LP_FARM_ABI as Abi,
    functionName: 'rewardPerBlock',
    args: [],
    chainId,
    staleTime: 1000 * 3,
    enabled: !!enabled && !!walletAddress && isRoot,
  });
  const rewardPerBlockRaw = rewardPerBlockData as bigint;

  const { data: totalDepositedData } = useContractRead({
    address: lpTokenAddress as Address,
    abi: ERC20_TOKEN_ABI as Abi,
    functionName: 'balanceOf',
    args: [farmAddress as Address],
    chainId,
    staleTime: 1000 * 3,
    enabled: !!enabled && !!walletAddress && isRoot && !!lpTokenAddress,
  });
  const totalDepositedRaw = totalDepositedData as bigint;
  const totalDeposited = totalDepositedData ? Number(formatUnits(totalDepositedRaw, 18)) : 0;

  const { data: depositedData, refetch: refetchDeposited } = useContractRead({
    address: farmAddress as Address,
    abi: LP_FARM_ABI as Abi,
    functionName: 'deposited',
    args: [0, walletAddress as Address],
    chainId,
    staleTime: 1000 * 3,
    enabled: !!enabled && !!walletAddress && isRoot,
  });
  const depositedRaw = depositedData as bigint;
  const deposited = depositedData ? Number(formatUnits(depositedRaw, 18)) : 0;

  const { data: pendingData, refetch: refetchPending } = useContractRead({
    address: farmAddress as Address,
    abi: LP_FARM_ABI as Abi,
    functionName: 'pending',
    args: [0, walletAddress as Address],
    chainId,
    staleTime: 1000 * 3,
    enabled: !!enabled && !!walletAddress && isRoot,
  });
  const pendingRaw = pendingData as bigint;
  const rewardDecimal = 6;
  const pending = pendingData ? Number(formatUnits(pendingRaw, rewardDecimal)) : 0;

  const refetch = () => {
    refetchDeposited();
    refetchPending();
  };

  return {
    depositedRaw,
    deposited,
    totalDepositedRaw,
    totalDeposited,
    pendingRaw,
    pending,
    rewardPerBlockRaw,
    lpTokenAddress,
    refetch,
  };
};
