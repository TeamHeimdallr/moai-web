import { Address, formatEther } from 'viem';
import { useContractRead } from 'wagmi';

import { LIQUIDITY_POOL_ABI } from '~/abi/liquidity-pool';
import { TOKEN_ABI } from '~/abi/token';
import { VAULT_ABI } from '~/abi/vault';
import { CONTRACT_ADDRESS, POOL_ID, TOKEN_ADDRESS, TOKEN_USD_MAPPER } from '~/constants';
import { Composition, PoolInfo } from '~/types/components';
import { PoolBalance } from '~/types/contracts';
import { Entries } from '~/types/helpers';
import { formatNumber } from '~/utils/number';

import { useTokenSymbol } from '../token/symbol';

export const usePoolBalance = (poolAddress?: Address) => {
  const {
    data: poolTokensData,
    isLoading: poolTokensIsLoading,
    isSuccess: poolTokenIsSuucess,
    isError: poolTokenIsError,
  } = useContractRead({
    address: CONTRACT_ADDRESS.VAULT,
    abi: VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [poolAddress],
    enabled: !!poolAddress,
  });

  const poolName = (Object.entries(POOL_ID) as Entries<typeof POOL_ID>).find(
    ([_key, value]) => value === poolAddress
  )?.[0];
  const liquidityPoolTokenAddress = poolName ? TOKEN_ADDRESS[poolName] : undefined;

  const {
    data: weightData,
    isLoading: weightDataIsLoading,
    isSuccess: weightDataIsSuccess,
    isError: weightDataIsError,
  } = useContractRead({
    address: liquidityPoolTokenAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'getNormalizedWeights',
    enabled: !!liquidityPoolTokenAddress,
    staleTime: Infinity,
  });

  const tokenAddresses = (poolTokensData as PoolBalance)?.[0];
  const balances = (poolTokensData as PoolBalance)?.[1];
  const {
    data: symbols,
    isLoading: tokenSymbolLoading,
    isError: tokenSymbolError,
    isSuccess: tokenSymbolSuccess,
  } = useTokenSymbol(tokenAddresses ?? []);

  const compositions: Composition[] | undefined = balances?.map((balance, idx) => {
    return {
      name: symbols?.[idx] ?? '',
      weight: Number(formatEther((weightData as Array<bigint>)[idx])) * 100,
      balance: Number(formatEther(balance)),
      price: TOKEN_USD_MAPPER[symbols?.[idx]],
    };
  });

  const totalValue =
    compositions?.reduce((acc, cur) => acc + (cur?.balance ?? 0) * (cur?.price ?? 0), 0) ?? 0;
  const liquidityPoolTokenName =
    compositions
      ?.reduce((acc, cur) => acc + cur.weight.toString() + cur.name + '-', '')
      ?.slice(0, -1) ?? '';

  // TODO : fix here using get logs
  const volume = 386;
  const apr = totalValue === 0 ? 0 : ((volume * 0.003 * 365) / totalValue) * 100;

  const poolInfo: PoolInfo = {
    id: poolAddress ?? '0x',
    tokenAddress: liquidityPoolTokenAddress ?? '',
    compositions,
    value: '$' + formatNumber(totalValue, 2),

    volume: '$' + formatNumber(volume, 2),
    apr: formatNumber(apr, 2) + '%',
    fees: '$' + formatNumber(volume * 0.003, 2),
    name: liquidityPoolTokenName,
  };

  return {
    poolInfo,
    compositions,
    isLoading: weightDataIsLoading || poolTokensIsLoading || tokenSymbolLoading,
    isError: weightDataIsError || poolTokenIsError || tokenSymbolError,
    isSuccess: weightDataIsSuccess && poolTokenIsSuucess && tokenSymbolSuccess,
  };
};

export const usePoolTotalLpTokens = (poolAddress?: Address) => {
  const poolName = (Object.entries(POOL_ID) as Entries<typeof POOL_ID>).find(
    ([_key, value]) => value === poolAddress
  )?.[0];
  const liquidityPoolTokenAddress = poolName ? TOKEN_ADDRESS[poolName] : undefined;

  const { data, isLoading, isSuccess, isError } = useContractRead({
    address: liquidityPoolTokenAddress,
    abi: TOKEN_ABI,
    functionName: 'totalSupply',
    enabled: !!poolAddress && !!liquidityPoolTokenAddress,
  });

  return {
    data: data as bigint,
    isLoading,
    isSuccess,
    isError,
  };
};
