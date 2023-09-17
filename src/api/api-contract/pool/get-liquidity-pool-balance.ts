import { formatEther } from 'viem';
import { useContractRead } from 'wagmi';

import { LIQUIDITY_POOL_ABI } from '~/abi/liquidity-pool';
import { TOKEN_ABI } from '~/abi/token';
import { VAULT_ABI } from '~/abi/vault';
import { CONTRACT_ADDRESS, POOL_ID, TOKEN_ADDRESS, TOKEN_USD_MAPPER } from '~/constants';
import { Composition, PoolInfo } from '~/types/components';
import { PoolBalance, TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

import { useTokenInfos } from '../token/token';

export const usePoolBalance = (poolId?: string) => {
  const {
    data: poolTokensData,
    fetchStatus: poolTokensFetchStatus,
    status: poolTokensStatus,
    isSuccess: poolTokenIsSuucess,
    isError: poolTokenIsError,
  } = useContractRead({
    address: CONTRACT_ADDRESS.VAULT,
    abi: VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [poolId],
    enabled: !!poolId,
  });

  const poolAddress = poolId === POOL_ID.POOL_A ? TOKEN_ADDRESS.POOL_A : TOKEN_ADDRESS.POOL_B;

  const {
    data: weightData,
    fetchStatus: weightDataFetchStatus,
    status: weightDataStatus,
    isSuccess: weightDataIsSuccess,
    isError: weightDataIsError,
  } = useContractRead({
    address: poolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'getNormalizedWeights',
    enabled: !!poolAddress,
  });

  const [tokenAddresses, balances] = poolTokensData as PoolBalance;
  const {
    data: tokensData,
    isLoading: tokenInfoIsLoading,
    isError: tokenInfoIsError,
    isSuccess: tokenInfoIsSuccess,
  } = useTokenInfos(tokenAddresses);

  const compositions: Composition[] = tokensData
    .filter(token => token !== undefined)
    .map((token, idx) => {
      return {
        name: token as string,
        weight: Number(formatEther((weightData as Array<bigint>)[idx])) * 100,
        balance: Number(formatEther(balances[idx])),
        price: TOKEN_USD_MAPPER[token as TOKEN],
      };
    });

  const totalValue = compositions.reduce((acc, cur) => acc + cur.balance * cur.price, 0);

  const lpTokenName = compositions.reduce(
    (acc, cur) => acc + cur.weight.toString() + cur.name + '-',
    ''
  );

  // TODO : fix here using get logs
  const volume = 386;

  const poolInfo: PoolInfo = {
    id: poolId ?? '',
    tokenAddress: poolAddress,
    compositions,
    value: formatNumber(totalValue, 2),

    volume: '$' + formatNumber(volume, 2),
    apr: formatNumber(((volume * 0.003 * 365) / totalValue) * 100, 2) + '%',
    fees: '$' + formatNumber(volume * 0.003, 2),
    name: lpTokenName.slice(0, -1),
  };

  return {
    poolInfo,
    compositions,
    isLoading:
      tokenInfoIsLoading ||
      poolTokensFetchStatus === 'fetching' ||
      weightDataFetchStatus === 'fetching' ||
      poolTokensStatus === 'loading' ||
      weightDataStatus === 'loading',
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
