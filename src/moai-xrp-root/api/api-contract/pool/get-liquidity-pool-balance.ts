import { Address, formatEther, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import { useConnectEvmWallet } from '~/hooks/data/use-connect-evm-wallet';
import { formatNumber } from '~/utils/number';
import { calcBptOutGivenExactTokensIn } from '~/utils/pool';
import { Entries } from '~/types/helpers';

import { LIQUIDITY_POOL_ABI } from '~/moai-xrp-root/abi/liquidity-pool';
import { TOKEN_ABI } from '~/moai-xrp-root/abi/token';
import { VAULT_ABI } from '~/moai-xrp-root/abi/vault';

import { CONTRACT_ADDRESS, POOL_ID, TOKEN_ADDRESS, TOKEN_DECIAML } from '~/moai-xrp-root/constants';

import { Composition, PoolInfo } from '~/moai-xrp-root/types/components';

import { useERC20TokenBalances } from '~/moai-xrp-root/hooks/data/use-balance';
import { useGetRootNetworkTokenPrice } from '~/moai-xrp-root/hooks/data/use-root-network-token-price';
import { PoolBalance } from '~/moai-xrp-root/types/contracts';

import { useGetSwapHistories } from '../swap/get-swap-histories';
import { useTokenSymbols } from '../token/symbol';

interface QueryOptions {
  enabled?: boolean;
}

// disable fetching when chain is root, wallet is not connected,
// because root network cannot read contract without connect wallet
export const useLiquidityPoolBalance = (poolId?: Address) => {
  const { address: walletAddress } = useConnectEvmWallet();

  const { getTokenPrice } = useGetRootNetworkTokenPrice();

  const { data: poolTokensData } = usePoolTokens(poolId);
  const { data: liquidityPoolTokenTotalSupplyData } = useLiquidityPoolTokenTotalSupply(poolId);

  const liquidityPoolTokenAddress = getLiquidityPoolTokenAddress(poolId);
  const { data: weightData } = usePoolTokenNormalizedWeights(liquidityPoolTokenAddress);

  const poolTokenAddresses = (poolTokensData as PoolBalance)?.[0];
  const poolTokenBalances = (poolTokensData as PoolBalance)?.[1];

  const { data: symbolData } = useTokenSymbols(poolTokenAddresses ?? []);

  const { data: swapHistoriesData } = useGetSwapHistories({ poolId });

  const compositions: Composition[] =
    poolTokenBalances?.map((_balance, idx) => {
      const tokenAddress = poolTokenAddresses?.[idx] || '0x0';
      const name = symbolData?.[idx] || '';
      const weight = Number(formatEther(weightData?.[idx] ?? 0n)) * 100 || 0;
      const balance = Number(formatUnits(_balance || 0n, TOKEN_DECIAML)) || 0;
      const price = getTokenPrice(name);

      return {
        tokenAddress,
        name,
        weight,
        balance: balance,
        price,
        value: balance * price,
      };
    }) ??
    ([
      { tokenAddress: '0x0', name: '', weight: 0, balance: 0, price: 0, value: 0 },
      { tokenAddress: '0x0', name: '', weight: 0, balance: 0, price: 0, value: 0 },
    ] as Composition[]);

  const liquidityPoolTokenName =
    compositions
      ?.reduce((acc, cur) => acc + cur.weight.toString() + cur.name + '-', '')
      ?.slice(0, -1) ?? '';

  const poolTotalBalance = compositions?.reduce((acc, cur) => acc + cur.balance, 0) ?? 0;
  const poolTotalValue = compositions?.reduce((acc, cur) => acc + cur.value, 0) ?? 0;
  const poolVolume = swapHistoriesData?.reduce((acc, cur) => {
    const value = cur?.tokens?.reduce((tAcc, tCur) => tAcc + tCur.value, 0) ?? 0;
    return acc + value;
  }, 0);
  const apr = poolTotalValue === 0 ? 0 : ((poolVolume * 0.003 * 365) / poolTotalValue) * 100;

  // lp token total supply
  const liquidityPoolTokenTotalSupply = Number(
    formatUnits(liquidityPoolTokenTotalSupplyData ?? 0n, TOKEN_DECIAML)
  );

  const { rawValue: liquidityPoolTokenBalanceData } = useERC20TokenBalances(
    walletAddress,
    liquidityPoolTokenAddress
  );
  // users lp token balance
  const liquidityPoolTokenBalance = Number(
    formatUnits(liquidityPoolTokenBalanceData ?? 0n, TOKEN_DECIAML)
  );

  const liquidityPoolTokenPrice = liquidityPoolTokenTotalSupply
    ? poolTotalValue / liquidityPoolTokenTotalSupply
    : 0;

  const poolInfo: PoolInfo = {
    id: poolId ?? '0x0',

    tokenName: liquidityPoolTokenName,
    tokenAddress: liquidityPoolTokenAddress ?? '0x0',
    tokenTotalSupply: liquidityPoolTokenTotalSupply,

    compositions,

    formattedBalance: formatNumber(poolTotalBalance, 2),
    formattedValue: '$' + formatNumber(poolTotalValue, 2),
    formattedVolume: '$' + formatNumber(poolVolume, 2),
    formattedApr: formatNumber(apr, 2) + '%',
    formattedFees: '$' + formatNumber(poolVolume * 0.003, 2),

    balance: poolTotalBalance,
    value: poolTotalValue,
    volume: poolVolume,
    apr: apr,
    fees: poolVolume * 0.003,
  };

  return {
    poolInfo,

    // users lp token balance
    liquidityPoolTokenBalance,
    liquidityPoolTokenPrice,
  };
};

interface LiquidityPoolTokenAmountProp {
  poolId?: Address;
  amountsIn: number[];
}
export const useLiquidityPoolTokenAmount = ({
  poolId,
  amountsIn,
}: LiquidityPoolTokenAmountProp) => {
  const { data: poolTokensData } = usePoolTokens(poolId);
  const { data: bptTotalSupply } = useLiquidityPoolTokenTotalSupply(poolId);
  const { data: swapFeePercentage } = useGetSwapFeePercentage(poolId);
  const liquidityPoolTokenAddress = getLiquidityPoolTokenAddress(poolId);
  const { data: weightData } = usePoolTokenNormalizedWeights(liquidityPoolTokenAddress);
  const normalizedWeights = weightData?.map(v => Number(formatEther(v ?? 0n)) || 0) ?? [];

  const balances = (poolTokensData as PoolBalance)?.[1];

  const bptOut = calcBptOutGivenExactTokensIn({
    balances: balances.map((v: bigint) => Number(formatUnits(v, TOKEN_DECIAML))) ?? [],
    normalizedWeights,
    amountsIn,
    bptTotalSupply: Number(formatEther(bptTotalSupply ?? 0n)),
    swapFeePercentage: Number(formatEther(swapFeePercentage ?? 0n)),
  });

  return {
    bptOut,
  };
};

export const usePoolTotalLpTokens = (poolAddress?: Address, options?: QueryOptions) => {
  const poolName = (Object.entries(POOL_ID) as Entries<typeof POOL_ID>).find(
    ([_key, value]) => value === poolAddress
  )?.[0];
  const liquidityPoolTokenAddress = poolName ? TOKEN_ADDRESS[poolName] : undefined;

  const { enabled } = options ?? {};

  const { data } = useContractRead({
    address: liquidityPoolTokenAddress,
    abi: TOKEN_ABI,
    functionName: 'totalSupply',
    enabled: !!poolAddress && !!liquidityPoolTokenAddress && !!(enabled ?? true),
  });

  return {
    data: data as bigint,
  };
};

export const getLiquidityPoolTokenAddress = (poolId?: Address) => {
  if (!poolId) return undefined;

  const poolName = (Object.entries(POOL_ID) as Entries<typeof POOL_ID>).find(
    ([_key, value]) => value === poolId
  )?.[0];
  const liquidityPoolTokenAddress = poolName ? (TOKEN_ADDRESS[poolName] as Address) : undefined;
  return liquidityPoolTokenAddress;
};

export const useLiquidityPoolTokenTotalSupply = (poolId?: Address, options?: QueryOptions) => {
  const poolName = (Object.entries(POOL_ID) as Entries<typeof POOL_ID>).find(
    ([_key, value]) => value === poolId
  )?.[0];
  const liquidityPoolTokenAddress = poolName ? TOKEN_ADDRESS[poolName] : undefined;

  const { enabled } = options ?? {};

  const { data: _data, ...rest } = useContractRead({
    address: liquidityPoolTokenAddress,
    abi: TOKEN_ABI,
    functionName: 'totalSupply',
    enabled: !!poolId && !!liquidityPoolTokenAddress && !!(enabled ?? true),
    staleTime: 1000 * 5,
    scopeKey: `totalSupply-${poolId}`,
  });
  const data = _data as bigint | undefined;

  return { data, ...rest };
};

export const usePoolTokens = (poolId?: Address, options?: QueryOptions) => {
  const { enabled } = options ?? {};

  const { data: _data, ...rest } = useContractRead({
    address: CONTRACT_ADDRESS.VAULT,
    abi: VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [poolId],
    enabled: !!poolId && !!(enabled ?? true),
    staleTime: 1000 * 5,
    scopeKey: `getPoolToken-${poolId}`,
  });
  const data = _data as PoolBalance | undefined;

  return { data, ...rest };
};

export const usePoolTokenNormalizedWeights = (
  liquidityPoolTokenAddress?: Address,
  options?: QueryOptions
) => {
  const { enabled } = options ?? {};

  const { data: _data, ...rest } = useContractRead({
    address: liquidityPoolTokenAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'getNormalizedWeights',
    enabled: !!liquidityPoolTokenAddress && !!(enabled ?? true),
    staleTime: Infinity,
    scopeKey: `getNormalizedWeights-${liquidityPoolTokenAddress}`,
  });
  const data = _data as Array<bigint> | undefined;

  return { data, ...rest };
};

export const useGetSwapFeePercentage = (poolId?: Address, options?: QueryOptions) => {
  const poolName = (Object.entries(POOL_ID) as Entries<typeof POOL_ID>).find(
    ([_key, value]) => value === poolId
  )?.[0];
  const liquidityPoolTokenAddress = poolName ? TOKEN_ADDRESS[poolName] : undefined;

  const { enabled } = options ?? {};

  const { data: _data, ...rest } = useContractRead({
    address: liquidityPoolTokenAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'getSwapFeePercentage',
    enabled: !!poolId && !!liquidityPoolTokenAddress && !!(enabled ?? true),
    staleTime: 1000 * 60,
    scopeKey: `getSwapFeePercentage-${poolId}`,
  });
  const data = _data as bigint | undefined;

  return { data, ...rest };
};
