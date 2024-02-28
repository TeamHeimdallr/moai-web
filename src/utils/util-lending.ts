import { Address, formatEther, formatUnits, parseEther } from 'viem';

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

interface HelathFactorProps {
  markets: IMarketWithToken[];
  snapshots: ISnapshot[];
  deltaSupply?: {
    marketAddress: Address;
    delta: bigint; // underlying's delta
    isWithdraw: boolean;
  };
}
export const calcHealthFactor = ({ markets, snapshots, deltaSupply }: HelathFactorProps) => {
  // TODO: market index 를 먼저 찾는 방식으로 수정. snapshot 과 market 의 순서가 다를 수 있음
  // TODO: snapshots 의 mTokenBalance 가 collateral enabled 인 자사만 계산하도록 수정
  const numerator = snapshots.reduce((acc, s, i) => {
    const delta =
      deltaSupply?.marketAddress === markets[i].address
        ? deltaSupply.isWithdraw
          ? -deltaSupply.delta
          : deltaSupply.delta
        : 0n;
    const underlyingBalance =
      Number(formatUnits(s.exchangeRate * s.mTokenBalance, 18 + markets[i].underlyingDecimals)) +
      Number(formatUnits(delta, markets[i].underlyingDecimals));
    const values = underlyingBalance * (markets[i].price ?? 0);
    return acc + values * Number(formatEther(s.collateralFator ?? 0n));
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
