import { XRP_TOKEN_ISSUER } from '~/constants';

import { formatNumber } from '~/utils/util-number';
import { IPool, ITokenComposition } from '~/types';

import { useAmmInfo } from '../amm/get-amm-info';
import { useLiquidityTokenBalances } from '../balance/get-token-balance-in-pool';
import { useGetSwapHistories } from '../swap/get-swap-histories';

export const useLiquidityPoolBalance = (id: string) => {
  const { ammInfo } = useAmmInfo(id);
  const { poolTotalValue, fee, token1, token2, liquidityPoolToken } = ammInfo;

  const poolTokens = [token1, token2];

  const { data: swapHistoriesData } = useGetSwapHistories(XRP_TOKEN_ISSUER.XRP_MOI);

  const compositions: ITokenComposition[] = poolTokens?.map(token => {
    const tokenIssuer = token.issuer ?? '';
    const symbol = token.currency;
    const weight = token.weight;
    const balance = token.balance;
    const price = token.price;

    return {
      symbol,

      address: tokenIssuer,

      balance,
      price,
      value: balance * price,

      weight,
    };
  }) ?? [
    { tokenIssuer: '', symbol: '', weight: 0, balance: 0, price: 0, value: 0 },
    { tokenIssuer: '', symbol: '', weight: 0, balance: 0, price: 0, value: 0 },
  ];

  const poolTotalBalance = compositions?.reduce((acc, cur) => acc + (cur?.balance ?? 0), 0) ?? 0;
  const poolVolume = swapHistoriesData?.reduce((acc, cur) => {
    const value = cur?.tokens?.reduce((tAcc, tCur) => tAcc + tCur.value, 0) ?? 0;
    return acc + value;
  }, 0);
  const apr = poolTotalValue === 0 ? 0 : ((poolVolume * fee * 365) / poolTotalValue) * 100;

  const liquidityPoolTokenBalance = useLiquidityTokenBalances(id);

  const pool: IPool = {
    id,

    lpTokenName: liquidityPoolToken.currency ?? '',
    lpTokenAddress: liquidityPoolToken.issuer ?? '',
    lpTokenTotalSupply: liquidityPoolToken?.balance ?? 0,

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
    fees: poolVolume * fee,
  };

  return {
    pool,

    // users lp token balance
    liquidityPoolTokenBalance,
    liquidityPoolTokenPrice: liquidityPoolToken.price,
  };
};
