import { useParams } from 'react-router-dom';
import { Address, formatEther, formatUnits } from 'viem';
import { useContractRead } from 'wagmi';

import {
  EVM_CONTRACT_ADDRESS,
  EVM_POOL,
  TOKEN_DECIMAL,
  TOKEN_DESCRIPTION_MAPPER,
  TOKEN_IMAGE_MAPPER,
} from '~/constants';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import {
  calcBptInTokenOutAmountAndPriceImpact,
  calcBptOutAmountAndPriceImpact,
  getNetworkFull,
} from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { IPool, IPoolTokenBalanceRaw, ITokenComposition } from '~/types';

import { BALANCER_LP_ABI, BALANCER_VAULT_ABI, ERC20_TOKEN_ABI } from '~/abi';

import { useERC20TokenBalances } from '../balance/get-token-balance';
import { useGetSwapHistories } from '../swap/get-swap-histories';
import { useTokenPrice } from '../token/price';
import { useTokenSymbols } from '../token/symbol';

interface UseLiquidityPoolBalance {
  id: Address;
}
export const useLiquidityPoolBalance = ({ id }: UseLiquidityPoolBalance) => {
  const { selectedNetwork } = useNetwork();
  const { network } = useParams();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { evm } = useConnectedWallet();
  const { address: walletAddress } = evm;

  const { getTokenPrice } = useTokenPrice();

  const { data: poolTokensData } = usePoolTokens({ id });
  const { data: liquidityPoolTokenTotalSupplyData } = usePoolTotalLpTokens({ id });

  const { tokenAddress: lpTokenAddress } = EVM_POOL[currentNetwork]?.[0] ?? {};

  const { data: weightData } = usePoolTokenNormalizedWeights({
    lpTokenAddress: lpTokenAddress as Address,
  });

  const poolTokenAddresses = (poolTokensData as IPoolTokenBalanceRaw)?.[0];
  const poolTokenBalances = (poolTokensData as IPoolTokenBalanceRaw)?.[1];

  const { data: symbolData } = useTokenSymbols(poolTokenAddresses ?? []);

  const { data: swapHistoriesData } = useGetSwapHistories({ id });

  const compositions: ITokenComposition[] =
    poolTokenBalances?.map((b, idx) => {
      const address = poolTokenAddresses?.[idx] || '0x0';
      const symbol = symbolData?.[idx] || '';
      const weight = Number(formatEther(weightData?.[idx] ?? 0n)) * 100 || 0;
      const balance = Number(formatUnits(b || 0n, TOKEN_DECIMAL[currentNetwork])) || 0;
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

  const lpTokenName =
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
  const lpTokenTotalSupply = Number(
    formatUnits(liquidityPoolTokenTotalSupplyData ?? 0n, TOKEN_DECIMAL[currentNetwork])
  );

  const { rawValue: liquidityPoolTokenBalanceData } = useERC20TokenBalances(
    walletAddress as Address,
    lpTokenAddress as Address
  );
  // users lp token balance
  const lpTokenBalance = Number(
    formatUnits(liquidityPoolTokenBalanceData ?? 0n, TOKEN_DECIMAL[currentNetwork])
  );

  const lpTokenPrice = lpTokenTotalSupply ? poolTotalValue / lpTokenTotalSupply : 0;

  const pool: IPool = {
    id: id ?? '0x0',

    lpTokenName: lpTokenName,
    lpTokenAddress: lpTokenAddress,
    lpTokenTotalSupply: lpTokenTotalSupply,

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
  id?: Address;
  amountsIn: number[];
}
export const useLiquidityPoolTokenAmount = ({ id, amountsIn }: LiquidityPoolTokenAmountProp) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { tokenAddress: lpTokenAddress } = EVM_POOL[currentNetwork]?.[0] ?? {};

  const { data: poolTokensData } = usePoolTokens({ id });
  const { data: bptTotalSupply } = usePoolTotalLpTokens({ id });
  const { data: swapFeePercentage } = useGetSwapFeePercentage({
    lpTokenAddress: lpTokenAddress as Address,
  });
  const { data: weightData } = usePoolTokenNormalizedWeights({
    lpTokenAddress: lpTokenAddress as Address,
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
      balances.map((v: bigint) => Number(formatUnits(v, TOKEN_DECIMAL[currentNetwork]))) ?? [],
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
  id?: Address;
  bptIn: number;
}
export const useWithdrawTokenAmounts = ({ id, bptIn }: WithdrawPriceImpactProp) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { tokenAddress: lpTokenAddress } = EVM_POOL[currentNetwork]?.[0] ?? {};

  const { data: poolTokensData } = usePoolTokens({ id });
  const { data: bptTotalSupply } = usePoolTotalLpTokens({ id });
  const { data: weightData } = usePoolTokenNormalizedWeights({
    lpTokenAddress: lpTokenAddress as Address,
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
      balances.map((v: bigint) => Number(formatUnits(v, TOKEN_DECIMAL[currentNetwork]))) ?? [],
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
  lpTokenAddress?: Address;
  enabled?: boolean;
}
export const useGetSwapFeePercentage = ({ lpTokenAddress }: UseGetSwapFeePercentage) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) || selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data: _data, ...rest } = useContractRead({
    address: lpTokenAddress,
    abi: BALANCER_LP_ABI,
    functionName: 'getSwapFeePercentage',
    staleTime: 1000 * 60,
    chainId,
    enabled: !!lpTokenAddress && isEvm,
  });
  const data = _data as bigint | undefined;

  return { data, ...rest };
};

interface UsePoolTotalLpTokens {
  id?: Address;
  enabled?: boolean;
}
export const usePoolTotalLpTokens = ({ id }: UsePoolTotalLpTokens) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const chainId = useNetworkId(currentNetwork);

  const { tokenAddress } = EVM_POOL[currentNetwork]?.[0] ?? {};

  const { data } = useContractRead({
    address: tokenAddress as Address,
    abi: ERC20_TOKEN_ABI,
    functionName: 'totalSupply',
    chainId,
    staleTime: 1000 * 5,
    enabled: !!id && !!tokenAddress && isEvm,
  });

  return {
    data: data as bigint,
  };
};

interface UsePoolTokens {
  id?: Address;
  enabled?: boolean;
}
export const usePoolTokens = ({ id }: UsePoolTokens) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const address = EVM_CONTRACT_ADDRESS[currentNetwork]?.VAULT as Address;
  const chainId = useNetworkId(currentNetwork);

  const { data: res, ...rest } = useContractRead({
    address,
    abi: BALANCER_VAULT_ABI,
    functionName: 'getPoolTokens',
    args: [id],
    chainId,
    staleTime: 1000 * 5,
    enabled: !!address && !!id && isEvm,
  });
  const data = res as IPoolTokenBalanceRaw | undefined;

  return { data, ...rest };
};

interface UsePoolTokenNormalizedWeights {
  lpTokenAddress?: Address;
  enabled?: boolean;
}
export const usePoolTokenNormalizedWeights = ({
  lpTokenAddress,
}: UsePoolTokenNormalizedWeights) => {
  const { network } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const { data: res, ...rest } = useContractRead({
    address: lpTokenAddress,
    abi: BALANCER_LP_ABI,
    functionName: 'getNormalizedWeights',
    chainId,
    staleTime: Infinity,
    enabled: !!lpTokenAddress && isEvm,
  });
  const data = res as Array<bigint> | undefined;

  return { data, ...rest };
};
