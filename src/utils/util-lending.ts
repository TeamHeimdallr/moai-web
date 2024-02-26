import { formatEther, formatUnits, parseEther } from 'viem';

import { IMarketWithToken, ISnapshot } from '~/types/lending';

interface Props {
  markets: IMarketWithToken[];
  snapshots: ISnapshot[];
}
export const calcNetApy = ({ markets, snapshots }: Props) => {
  const netApyDenom = snapshots.reduce((acc, s) => {
    return acc + s.mTokenBalance + s.borrowBalance;
  }, 0n);

  const weightedBorrows = markets.map((m, i) => {
    return parseEther((m.borrowApy / 100).toFixed(6)) * (snapshots[i]?.borrowBalance || 0n);
  });
  const weightedSupplies = markets.map((m, i) => {
    return parseEther((m.supplyApy / 100).toFixed(6)) * (snapshots[i]?.mTokenBalance || 0n);
  });

  const nets =
    netApyDenom === 0n
      ? 0n
      : (weightedSupplies.reduce((acc, s) => {
          return acc + s;
        }, 0n) -
          weightedBorrows.reduce((acc, s) => {
            return acc + s;
          }, 0n)) /
        netApyDenom;
  const netAPY = Number(formatEther(nets)) * 100;
  return netAPY;
};

export const calcHealthFactor = ({ markets, snapshots }: Props) => {
  const numerator = snapshots.reduce((acc, s, i) => {
    const underlyingBalance = Number(
      formatUnits(s.exchangeRate * s.mTokenBalance, 18 + markets[i].underlyingDecimals)
    );
    const values = underlyingBalance * (markets[i].price ?? 0);
    return acc + values * Number(formatEther(s.collateralFator));
  }, 0);

  const denom = snapshots.reduce((acc, s, i) => {
    const values =
      Number(formatUnits(s.borrowBalance, markets[i].underlyingDecimals)) * (markets[i].price ?? 0);
    return acc + values;
  }, 0);

  const healthFactor = denom === 0 ? 0 : numerator / denom;
  return healthFactor;
};

export const calcLtv = ({ markets, snapshots }: Props) => {
  const numerator = snapshots.reduce((acc, s, i) => {
    const values =
      Number(formatUnits(s.borrowBalance, markets[i].underlyingDecimals)) * (markets[i].price ?? 0);
    return acc + values;
  }, 0);

  const denom = snapshots.reduce((acc, s, i) => {
    const underlyingBalance = Number(
      formatUnits(s.exchangeRate * s.mTokenBalance, 18 + markets[i].underlyingDecimals)
    );
    const values = underlyingBalance * (markets[i].price ?? 0);
    return acc + values;
  }, 0);

  const ltv = denom === 0 ? 0 : (100 * numerator) / denom;
  return { ltv, assets: denom, debts: numerator };
};
