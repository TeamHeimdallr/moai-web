import { formatEther } from 'viem';
import { useContractRead } from 'wagmi';

import { LIQUIDITY_POOL_ABI } from '~/abi/liquidity-pool';
import { TOKEN_ABI } from '~/abi/token';
import { VAULT_ABI } from '~/abi/vault';
import { CONTRACT_ADDRESS, POOL_ID, TOKEN_ADDRESS, TOKEN_USD_MAPPER } from '~/constants';
import { Composition, PoolInfo } from '~/types/components';
import { PoolBalance, TOKEN } from '~/types/contracts';
import { Entries } from '~/types/helpers';
import { formatNumber } from '~/utils/number';

import { useTokenInfos } from '../token/token';

export const usePoolBalance = (poolAddress?: string) => {
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
  });

  const tokenAddresses = (poolTokensData as PoolBalance)?.[0];
  const balances = (poolTokensData as PoolBalance)?.[1];
  const {
    data: tokensData,
    isLoading: tokenInfoIsLoading,
    isError: tokenInfoIsError,
    isSuccess: tokenInfoIsSuccess,
  } = useTokenInfos(tokenAddresses ?? []);

  const compositions: Composition[] = tokensData
    ?.filter(token => token !== undefined)
    ?.map((token, idx) => {
      return {
        name: token as string,
        weight: Number(formatEther((weightData as Array<bigint>)[idx])) * 100,
        balance: Number(formatEther(balances[idx])),
        price: TOKEN_USD_MAPPER[token as TOKEN],
      };
    });

  const totalValue = compositions?.reduce((acc, cur) => acc + cur.balance * cur.price, 0) ?? 0;
  const liquidityPoolTokenName =
    compositions
      ?.reduce((acc, cur) => acc + cur.weight.toString() + cur.name + '-', '')
      ?.slice(0, -1) ?? '';

  // TODO : fix here using get logs
  const volume = 386;

  const poolInfo: PoolInfo = {
    id: poolAddress ?? '',
    tokenAddress: liquidityPoolTokenAddress ?? '',
    compositions,
    value: formatNumber(totalValue, 2),

    volume: '$' + formatNumber(volume, 2),
    apr: formatNumber(((volume * 0.003 * 365) / totalValue) * 100, 2) + '%',
    fees: '$' + formatNumber(volume * 0.003, 2),
    name: liquidityPoolTokenName,
  };

  return {
    poolInfo,
    compositions,
    isLoading: tokenInfoIsLoading || weightDataIsLoading || poolTokensIsLoading,
    isError: weightDataIsError || poolTokenIsError || tokenInfoIsError,
    isSuccess: weightDataIsSuccess && poolTokenIsSuucess && tokenInfoIsSuccess,
  };
};

export const usePoolTotalLpTokens = (poolId?: string) => {
  const tokenAddress = poolId === POOL_ID.POOL_A ? TOKEN_ADDRESS.POOL_A : TOKEN_ADDRESS.POOL_B;

  const { data, fetchStatus, status, isSuccess, isError } = useContractRead({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: 'totalSupply',
    enabled: !!poolId,
  });

  return {
    data: data as bigint,
    isLoading: fetchStatus === 'fetching' && status === 'loading',
    isSuccess,
    isError,
  };
};
