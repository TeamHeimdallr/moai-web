import { formatNumber } from '~/utils/number';

import { ISSUER } from '~/moai-xrp-ledger/constants';

import { Composition, PoolInfo } from '~/moai-xrp-ledger/types/components';

import { useLiquidityTokenBalances } from '~/moai-xrp-ledger/hooks/data/use-balance-all';

import { useAmmInfo } from '../amm/get-amm-info';
import { useGetSwapHistories } from '../swap/get-swap-histories';

export const useLiquidityPoolBalance = (account: string) => {
  const { ammInfo } = useAmmInfo(account);

  const { poolTotalValue, fee, token1, token2, liquidityPoolToken } = ammInfo;

  const poolTokens = [token1, token2];

  const { data: swapHistoriesData } = useGetSwapHistories(ISSUER.XRP_MOI);

  const compositions: Composition[] = poolTokens?.map(token => {
    const tokenIssuer = token.issuer ?? '';
    const name = token.currency;
    const weight = token.weight;
    const balance = token.balance;
    const price = token.price;

    return {
      tokenIssuer,
      name,
      weight,
      balance,
      price,
      value: balance * price,
    };
  }) ?? [
    { tokenIssuer: '', name: '', weight: 0, balance: 0, price: 0, value: 0 },
    { tokenIssuer: '', name: '', weight: 0, balance: 0, price: 0, value: 0 },
  ];

  const poolTotalBalance = compositions?.reduce((acc, cur) => acc + cur.balance, 0) ?? 0;
  const poolVolume = swapHistoriesData?.reduce((acc, cur) => {
    const value = cur?.tokens?.reduce((tAcc, tCur) => tAcc + tCur.value, 0) ?? 0;
    return acc + value;
  }, 0);
  const apr = poolTotalValue === 0 ? 0 : ((poolVolume * fee * 365) / poolTotalValue) * 100;

  const liquidityPoolTokenBalance = useLiquidityTokenBalances();

  const poolInfo: PoolInfo = {
    account: account ?? '',

    tokenName: liquidityPoolToken.currency ?? '',
    tokenIssuer: liquidityPoolToken.issuer ?? '',
    tokenTotalSupply: liquidityPoolToken?.balance ?? 0,

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
    poolInfo,

    // users lp token balance
    liquidityPoolTokenBalance,
    liquidityPoolTokenPrice: liquidityPoolToken.price,
  };
};
