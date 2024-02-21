import { formatEther, parseEther } from 'viem';

import { IMarket, ISnapshot } from '~/types/lending';

interface Props {
  markets: IMarket[];
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
