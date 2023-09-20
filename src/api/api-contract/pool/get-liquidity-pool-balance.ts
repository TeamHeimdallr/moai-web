import { Address, formatEther, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import { LIQUIDITY_POOL_ABI } from '~/abi/liquidity-pool';
import { TOKEN_ABI } from '~/abi/token';
import { VAULT_ABI } from '~/abi/vault';
import { CHAIN, CONTRACT_ADDRESS, POOL_ID, TOKEN_ADDRESS, TOKEN_USD_MAPPER } from '~/constants';
import { useTokenBalances } from '~/hooks/data/use-balance';
import { Composition, PoolInfo } from '~/types/components';
import { PoolBalance } from '~/types/contracts';
import { Entries } from '~/types/helpers';
import { formatNumber } from '~/utils/number';

import { useGetSwapHistories } from '../swap/get-swap-histories';
import { useTokenSymbol } from '../token/symbol';

export const usePoolBalance = (poolAddress?: Address, walletAddress?: Address) => {
  // disable fetching when chain is root, wallet is not connected,
  // because root network cannot read contract without connect wallet
  const disableRead = !walletAddress && CHAIN === 'root';
  const isXRP = CHAIN === 'root' || CHAIN === 'xrpl';
  const tokenUnit = isXRP ? 6 : 18;

  const { data: poolTokensData } = useContractRead({
    address: CONTRACT_ADDRESS.VAULT,
    abi: VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [poolAddress],
    enabled: !!poolAddress && !disableRead,
  });

  const poolName = (Object.entries(POOL_ID) as Entries<typeof POOL_ID>).find(
    ([_key, value]) => value === poolAddress
  )?.[0];
  const liquidityPoolTokenAddress = poolName ? TOKEN_ADDRESS[poolName] : undefined;

  const { data: weightData } = useContractRead({
    address: liquidityPoolTokenAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'getNormalizedWeights',
    enabled: !!liquidityPoolTokenAddress && !disableRead,
    staleTime: Infinity,
  });

  const { data: tokenTotalSupplyData } = usePoolTotalLpTokens(poolAddress, !disableRead);
  const { rawValue: liquidityPoolTokenBalanceData } = useTokenBalances(
    walletAddress,
    liquidityPoolTokenAddress
  );

  const tokenTotalSupply = Number(formatEther((tokenTotalSupplyData ?? 0n) as bigint));
  const liquidityPoolTokenBalance = Number(
    formatEther((liquidityPoolTokenBalanceData ?? 0n) as bigint)
  );

  const tokenAddresses = (poolTokensData as PoolBalance)?.[0];
  const balances = (poolTokensData as PoolBalance)?.[1];
  const { data: symbols } = useTokenSymbol(tokenAddresses ?? []);

  const compositions: Composition[] | undefined = balances?.map((balance, idx) => {
    return {
      tokenAddress: tokenAddresses?.[idx] ?? '0x',
      name: symbols?.[idx] ?? '',
      weight: Number(formatEther((weightData as Array<bigint>)?.[idx] ?? 0)) * 100,
      balance: Number(formatUnits(balance, tokenUnit)),
      price: TOKEN_USD_MAPPER[symbols?.[idx]],
    };
  });

  const totalValue =
    compositions?.reduce((acc, cur) => acc + (cur?.balance ?? 0) * (cur?.price ?? 0), 0) ?? 0;
  const liquidityPoolTokenName =
    compositions
      ?.reduce((acc, cur) => acc + cur.weight.toString() + cur.name + '-', '')
      ?.slice(0, -1) ?? '';

  const { data: swapHistories } = useGetSwapHistories({
    poolAddress,
    options: { enabled: !disableRead },
  });

  const volume = swapHistories?.reduce((acc, cur) => {
    const value =
      cur?.tokens?.reduce((tAcc, tCur) => {
        const value = (tCur?.amount ?? 0) * (TOKEN_USD_MAPPER[tCur?.symbol] ?? 0);
        return tAcc + value;
      }, 0) ?? 0;
    return acc + value;
  }, 0);
  const apr = totalValue === 0 ? 0 : ((volume * 0.003 * 365) / totalValue) * 100;

  const poolInfo: PoolInfo = {
    id: poolAddress ?? '0x',
    tokenAddress: liquidityPoolTokenAddress ?? '',
    compositions,
    value: '$' + formatNumber(totalValue, 2),
    valueRaw: totalValue,
    volume: formatNumber(volume, 2),
    volumeRaw: volume,
    apr: formatNumber(apr, 2) + '%',
    aprRaw: apr,
    fees: '$' + formatNumber(volume * 0.003, 2),
    feesRaw: volume * 0.003,
    name: liquidityPoolTokenName,
  };

  return {
    poolInfo,
    compositions,
    tokenTotalSupply,
    liquidityPoolTokenBalance,
  };
};

export const usePoolTotalLpTokens = (poolAddress?: Address, enabled?: boolean) => {
  const poolName = (Object.entries(POOL_ID) as Entries<typeof POOL_ID>).find(
    ([_key, value]) => value === poolAddress
  )?.[0];
  const liquidityPoolTokenAddress = poolName ? TOKEN_ADDRESS[poolName] : undefined;

  const { data } = useContractRead({
    address: liquidityPoolTokenAddress,
    abi: TOKEN_ABI,
    functionName: 'totalSupply',
    enabled: enabled && !!poolAddress && !!liquidityPoolTokenAddress,
  });

  return {
    data: data as bigint,
  };
};
