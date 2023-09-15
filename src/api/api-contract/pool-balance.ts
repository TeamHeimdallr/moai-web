import { formatEther } from 'viem';
import { useContractRead } from 'wagmi';

import { LIQUIDITY_POOL_ABI } from '~/abi/liquidity-pool';
import { TOKEN_ABI } from '~/abi/token';
import { VAULT_ABI } from '~/abi/vault';
import { CONTRACT_ADDRESS, POOL_ID, TOKEN_ADDRESS, TOKEN_USD_MAPPER } from '~/constants';
import { Composition, PoolInfo } from '~/types/components';
import { PoolBalance, TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

import { useTokenInfos } from './token';

export const usePoolBalance = (poolId?: string) => {
  const balancerAddress = CONTRACT_ADDRESS.VAULT;
  const poolAddress = TOKEN_ADDRESS.POOL_A;

  const {
    data: poolTokensData,
    fetchStatus: poolTokensFetchStatus,
    status: poolTokensStatus,
    isSuccess: poolTokenIsSuucess,
    isError: poolTokenIsError,
  } = useContractRead({
    address: balancerAddress,
    abi: VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [poolId],
    enabled: !!poolId,
  });

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

  const value = formatNumber(
    compositions.reduce((acc, cur) => acc + cur.balance * cur.price, 0),
    2
  );

  const poolInfo: PoolInfo = {
    id: POOL_ID.POOL_A,
    tokenAddress: TOKEN_ADDRESS.POOL_A,
    compositions,
    value,
    volume: '$78,086',
    apr: '6.79%',
    fees: '$234.25',
    lpTokens: 100,
    name: '50ROOT-50XRP',
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
