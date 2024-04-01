import { useParams } from 'react-router-dom';
import { Abi, Address, formatUnits } from 'viem';
import { useContractRead, useContractReads } from 'wagmi';

import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

import { LP_FARM_ADDRESS_WITH_POOL_ID } from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { IMyPoolList, IPoolList, NETWORK } from '~/types';

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
    enabled: !!enabled && isRoot,
  });
  const lpTokenAddress = poolInfoData?.[0];

  const { data: rewardPerBlockData } = useContractRead({
    address: farmAddress as Address,
    abi: LP_FARM_ABI as Abi,
    functionName: 'rewardPerBlock',
    args: [],
    chainId,
    staleTime: 1000 * 3,
    enabled: !!enabled && isRoot,
  });
  const rewardPerBlockRaw = rewardPerBlockData as bigint;

  const { data: totalDepositedData } = useContractRead({
    address: lpTokenAddress as Address,
    abi: ERC20_TOKEN_ABI as Abi,
    functionName: 'balanceOf',
    args: [farmAddress as Address],
    chainId,
    staleTime: 1000 * 3,
    enabled: !!enabled && isRoot && !!lpTokenAddress,
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
    if (!enabled || !walletAddress || !isRoot) return;
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

// TODO: farm 종료 이후 제거
interface UseUserLpFarmsDepositedProps {
  pools: IPoolList[] | IMyPoolList[];
}
export const useUserLpFarmsDeposited = ({ pools }: UseUserLpFarmsDepositedProps) => {
  // TODO: if currentblock > endblock => apr = 0
  const ended = false;

  const { isFpass } = useNetwork();
  const { evm, fpass } = useConnectedWallet();
  const { address: walletAddress } = isFpass ? fpass : evm;

  const { data: tokensData } = useGetTokensQuery(
    {
      queries: {
        filter: `network:eq:trn`,
        tokens: '50ROOT-50ETH,50ROOT-50USDC,50USDC-50USDT,50USDT-50USDC,ROOT',
      },
    },
    { enabled: !ended }
  );
  const { tokens } = tokensData || {};
  const rootToken = tokens?.find(t => t.symbol === 'ROOT');

  const farmAddressMap = LP_FARM_ADDRESS_WITH_POOL_ID?.[NETWORK.THE_ROOT_NETWORK];

  const { data: rewardPerBlockDataRaw } = useContractReads({
    scopeKey: 'LP_FARM_REWARD_PER_BLOCK',
    contracts: pools?.map(pool => ({
      address: farmAddressMap?.[pool.poolId] as Address,
      abi: LP_FARM_ABI as Abi,
      functionName: 'rewardPerBlock',
    })),
    staleTime: Infinity,
    enabled: !!pools && !ended,
  });

  const { data: depositedData } = useContractReads({
    scopeKey: 'LP_FARM_DEPOSITED',
    contracts: pools?.map(pool => ({
      address: farmAddressMap?.[pool.poolId] as Address,
      abi: LP_FARM_ABI as Abi,
      functionName: 'deposited',
      args: [0, walletAddress as Address],
    })),
    staleTime: 1000 * 10,
    enabled: !!pools && !ended && !!walletAddress,
  });

  const { data: totalDepositedData } = useContractReads({
    scopeKey: 'LP_FARM',
    contracts: pools?.map(pool => ({
      address: pool.address as Address,
      abi: ERC20_TOKEN_ABI as Abi,
      functionName: 'balanceOf',
      args: [farmAddressMap?.[pool.poolId] as Address],
    })),
    staleTime: 1000 * 10,
    enabled: !!pools && !ended,
  });

  if (ended) {
    return pools?.map(pool => ({ ...pool, farmApr: 0 }));
  }

  const blocktime = 4; // TRN's blocktime
  const poolsWithFarm = pools?.map((pool, i) => {
    const deposited = Number(formatUnits((depositedData?.[i]?.result || 0n) as bigint, 18));
    const totalDeposited = Number(
      formatUnits((totalDepositedData?.[i]?.result || 0n) as bigint, 18)
    );

    const rewardPerBlockData = (rewardPerBlockDataRaw?.[i]?.result || 0n) as bigint;
    const rewardValuesInYear =
      (365 * 24 * 60 * 60 * Number(formatUnits(rewardPerBlockData, 6)) * (rootToken?.price || 0)) /
      blocktime;
    const lpTokenPrice = tokens?.find(t => t.address === pool.address)?.price || 0;
    const totalDepositedValue = totalDeposited * lpTokenPrice;
    const farmApr =
      totalDepositedValue !== 0 ? (100 * rewardValuesInYear) / totalDepositedValue : Infinity;

    return {
      ...pool,
      deposited: deposited,
      totalDepositedValue,
      farmApr: farmApr,
    };
  });

  return poolsWithFarm;
};
