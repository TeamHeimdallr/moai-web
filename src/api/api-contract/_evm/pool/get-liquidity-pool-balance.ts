import { Address, formatEther, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import {
  EVM_CONTRACT_ADDRESS,
  EVM_POOL,
  TOKEN_DECIMAL,
  TOKEN_DESCRIPTION_MAPPER,
  TOKEN_IMAGE_MAPPER,
} from '~/constants';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { calcBptInTokenOutAmountAndPriceImpact, calcBptOutAmountAndPriceImpact } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { IPool, IPoolTokenBalanceRaw, ITokenComposition } from '~/types';

import { BALANCER_LP_ABI, BALANCER_VAULT_ABI, ERC20_TOKEN_ABI } from '~/abi';

import { useERC20TokenBalances } from '../balance/get-token-balance';
import { useGetSwapHistories } from '../swap/get-swap-histories';
import { useTokenPrice } from '../token/price';
import { useTokenSymbols } from '../token/symbol';

export const useLiquidityPoolBalance = (poolId: Address) => {
  const { selectedNetwork } = useNetwork();

  const { evm } = useConnectedWallet();
  const { address: walletAddress } = evm;

  const { getTokenPrice } = useTokenPrice();

  const { data: poolTokensData } = usePoolTokens({ poolId });
  const { data: liquidityPoolTokenTotalSupplyData } = usePoolTotalLpTokens({ poolId });

  const { tokenAddress: liquidityPoolTokenAddress } = EVM_POOL[selectedNetwork]?.[0] ?? {};

  const { data: weightData } = usePoolTokenNormalizedWeights({
    liquidityPoolTokenAddress: liquidityPoolTokenAddress as Address,
  });

  const poolTokenAddresses = (poolTokensData as IPoolTokenBalanceRaw)?.[0];
  const poolTokenBalances = (poolTokensData as IPoolTokenBalanceRaw)?.[1];

  const { data: symbolData } = useTokenSymbols(poolTokenAddresses ?? []);

  const { data: swapHistoriesData } = useGetSwapHistories({ poolId });

  const compositions: ITokenComposition[] =
    poolTokenBalances?.map((b, idx) => {
      const address = poolTokenAddresses?.[idx] || '0x0';
      const symbol = symbolData?.[idx] || '';
      const weight = Number(formatEther(weightData?.[idx] ?? 0n)) * 100 || 0;
      const balance = Number(formatUnits(b || 0n, TOKEN_DECIMAL[selectedNetwork])) || 0;
      const price = getTokenPrice(symbol);

      return {
        symbol,

        address,
        description: TOKEN_DESCRIPTION_MAPPER[symbol],

        image: TOKEN_IMAGE_MAPPER[symbol],

        balance,
        price,
        value: balance * price,

        weight,
      };
    }) ??
    ([
      { symbol: '', address: '0x0', balance: 0, price: 0, value: 0, weight: 0 },
      { symbol: '', address: '0x0', balance: 0, price: 0, value: 0, weight: 0 },
    ] as ITokenComposition[]);

  const liquidityPoolTokenName =
    compositions
      ?.reduce((acc, cur) => acc + cur.weight.toString() + cur.symbol + '-', '')
      ?.slice(0, -1) ?? '';

  const poolTotalBalance = compositions?.reduce((acc, cur) => acc + (cur?.balance || 0), 0) ?? 0;
  const poolTotalValue = compositions?.reduce((acc, cur) => acc + (cur?.value || 0), 0) ?? 0;
  const poolVolume = swapHistoriesData?.reduce((acc, cur) => {
    const value = cur?.tokens?.reduce((tAcc, tCur) => tAcc + (tCur?.value ?? 0), 0) ?? 0;
    return acc + value;
  }, 0);
  const apr = poolTotalValue === 0 ? 0 : ((poolVolume * 0.003 * 365) / poolTotalValue) * 100;

  // lp token total supply
  const liquidityPoolTokenTotalSupply = Number(
    formatUnits(liquidityPoolTokenTotalSupplyData ?? 0n, TOKEN_DECIMAL[selectedNetwork])
  );

  const { rawValue: liquidityPoolTokenBalanceData } = useERC20TokenBalances(
    walletAddress as Address,
    liquidityPoolTokenAddress as Address
  );
  // users lp token balance
  const lpTokenBalance = Number(
    formatUnits(liquidityPoolTokenBalanceData ?? 0n, TOKEN_DECIMAL[selectedNetwork])
  );

  const lpTokenPrice = liquidityPoolTokenTotalSupply
    ? poolTotalValue / liquidityPoolTokenTotalSupply
    : 0;

  const pool: IPool = {
    id: poolId ?? '0x0',

    lpTokenName: liquidityPoolTokenName,
    lpTokenAddress: liquidityPoolTokenAddress,
    lpTokenTotalSupply: liquidityPoolTokenTotalSupply,

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
    pool,

    // users lp token balance
    lpTokenBalance,
    lpTokenPrice,
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
  const { selectedNetwork, isEvm } = useNetwork();

  const { tokenAddress: liquidityPoolTokenAddress } = EVM_POOL[selectedNetwork]?.[0] ?? {};

  const { data: poolTokensData } = usePoolTokens({ poolId });
  const { data: bptTotalSupply } = usePoolTotalLpTokens({ poolId });
  const { data: swapFeePercentage } = useGetSwapFeePercentage({
    liquidityPoolTokenAddress: liquidityPoolTokenAddress as Address,
  });
  const { data: weightData } = usePoolTokenNormalizedWeights({
    liquidityPoolTokenAddress: liquidityPoolTokenAddress as Address,
  });
  const normalizedWeights = weightData?.map(v => Number(formatEther(v ?? 0n)) || 0) ?? [];

  const balances = poolTokensData?.[1] || [];

  if (!isEvm)
    return {
      bptOut: 0,
      priceImpact: 0,
    };

  const { bptOut, priceImpact } = calcBptOutAmountAndPriceImpact({
    balances:
      balances.map((v: bigint) => Number(formatUnits(v, TOKEN_DECIMAL[selectedNetwork]))) ?? [],
    normalizedWeights,
    amountsIn,
    bptTotalSupply: Number(formatEther(bptTotalSupply ?? 0n)),
    swapFeePercentage: Number(formatEther(swapFeePercentage ?? 0n)),
  });

  return {
    bptOut,
    priceImpact,
  };
};

interface WithdrawPriceImpactProp {
  poolId?: Address;
  bptIn: number;
}
export const useWithdrawTokenAmounts = ({ poolId, bptIn }: WithdrawPriceImpactProp) => {
  const { selectedNetwork, isEvm } = useNetwork();

  const { tokenAddress: liquidityPoolTokenAddress } = EVM_POOL[selectedNetwork]?.[0] ?? {};

  const { data: poolTokensData } = usePoolTokens({ poolId });
  const { data: bptTotalSupply } = usePoolTotalLpTokens({ poolId });
  const { data: weightData } = usePoolTokenNormalizedWeights({
    liquidityPoolTokenAddress: liquidityPoolTokenAddress as Address,
  });
  const normalizedWeights = weightData?.map(v => Number(formatEther(v ?? 0n)) || 0) ?? [];

  const balances = poolTokensData?.[1] || [];

  if (!isEvm)
    return {
      amountsOut: [],
      priceImpact: 0,
    };

  const { amountsOut, priceImpact } = calcBptInTokenOutAmountAndPriceImpact({
    balances:
      balances.map((v: bigint) => Number(formatUnits(v, TOKEN_DECIMAL[selectedNetwork]))) ?? [],
    normalizedWeights,
    bptIn,
    bptTotalSupply: Number(formatEther(bptTotalSupply ?? 0n)),
  });

  return {
    amountsOut,
    priceImpact,
  };
};

interface UseGetSwapFeePercentage {
  liquidityPoolTokenAddress?: Address;
  enabled?: boolean;
}
export const useGetSwapFeePercentage = ({ liquidityPoolTokenAddress }: UseGetSwapFeePercentage) => {
  const { isEvm } = useNetwork();

  const { data: _data, ...rest } = useContractRead({
    address: liquidityPoolTokenAddress,
    abi: BALANCER_LP_ABI,
    functionName: 'getSwapFeePercentage',
    staleTime: 1000 * 60,
    enabled: !!liquidityPoolTokenAddress && isEvm,
  });
  const data = _data as bigint | undefined;

  return { data, ...rest };
};

interface UsePoolTotalLpTokens {
  poolId?: Address;
  enabled?: boolean;
}
export const usePoolTotalLpTokens = ({ poolId }: UsePoolTotalLpTokens) => {
  const { selectedNetwork, isEvm } = useNetwork();
  const { tokenAddress } = EVM_POOL[selectedNetwork]?.[0] ?? {};

  const { data } = useContractRead({
    address: tokenAddress as Address,
    abi: ERC20_TOKEN_ABI,
    functionName: 'totalSupply',
    staleTime: 1000 * 5,
    enabled: !!poolId && !!tokenAddress && isEvm,
  });

  return {
    data: data as bigint,
  };
};

interface UsePoolTokens {
  poolId?: Address;
  enabled?: boolean;
}
export const usePoolTokens = ({ poolId }: UsePoolTokens) => {
  const { selectedNetwork, isEvm } = useNetwork();

  const { data: res, ...rest } = useContractRead({
    address: EVM_CONTRACT_ADDRESS[selectedNetwork].VAULT as Address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [poolId],
    staleTime: 1000 * 5,
    enabled: !!poolId && isEvm,
  });
  const data = res as IPoolTokenBalanceRaw | undefined;

  return { data, ...rest };
};

interface UsePoolTokenNormalizedWeights {
  liquidityPoolTokenAddress?: Address;
  enabled?: boolean;
}
export const usePoolTokenNormalizedWeights = ({
  liquidityPoolTokenAddress,
}: UsePoolTokenNormalizedWeights) => {
  const { isEvm } = useNetwork();

  const { data: res, ...rest } = useContractRead({
    address: liquidityPoolTokenAddress,
    abi: BALANCER_LP_ABI,
    functionName: 'getNormalizedWeights',
    staleTime: Infinity,
    enabled: !!liquidityPoolTokenAddress && isEvm,
  });
  const data = res as Array<bigint> | undefined;

  return { data, ...rest };
};
