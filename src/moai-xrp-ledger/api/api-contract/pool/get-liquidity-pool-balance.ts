import { formatNumber } from '~/utils/number';

import { AMM } from '~/moai-xrp-ledger/constants';

import { Composition, PoolInfo } from '~/moai-xrp-ledger/types/components';

import { Amm } from '~/moai-xrp-ledger/types/contracts';

import { useAmmInfo } from '../amm/get-amm-info';

export const useLiquidityPoolBalance = (amm: Amm = AMM.XRP_MOI) => {
  const { ammInfo } = useAmmInfo(amm);

  const { account, poolTotalValue, fee, token1, token2, liquidityPoolToken } = ammInfo;

  const poolTokens = [token1, token2];

  // TODO:
  // const { data: swapHistoriesData } = useGetSwapHistories({ poolId, options: { enabled } });

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
  const poolVolume = 0;
  // TODO:
  // const poolVolume = swapHistoriesData?.reduce((acc, cur) => {
  //   const value = cur?.tokens?.reduce((tAcc, tCur) => tAcc + tCur.value, 0) ?? 0;
  //   return acc + value;
  // }, 0);
  const apr = poolTotalValue === 0 ? 0 : ((poolVolume * fee * 365) / poolTotalValue) * 100;

  // TODO: user's lp token balance
  // const { rawValue: liquidityPoolTokenBalanceData } = useERC20TokenBalances(
  //   walletAddress,
  //   liquidityPoolTokenAddress
  // );
  const liquidityPoolTokenBalance = 0;

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
