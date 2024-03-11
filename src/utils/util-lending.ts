import { Address, formatEther, formatUnits } from 'viem';

import { HEALTH_FACTOR_THRESHOLD } from '~/constants';

import { IMarketWithToken, ISnapshot } from '~/types/lending';

interface Props {
  markets: IMarketWithToken[];
  snapshots: ISnapshot[];
}
export const calcNetApy = ({ markets, snapshots }: Props) => {
  if (!markets || !snapshots || markets.length === 0 || snapshots.length === 0) {
    return 0;
  }
  const denomList = markets?.map((m, i) => {
    const borrowValues =
      Number(formatUnits(snapshots?.[i]?.borrowBalance || 0n, m?.underlyingDecimals || 0)) *
      (m?.price || 0);

    const underlyingBalance = Number(
      formatUnits(
        (snapshots?.[i]?.exchangeRate || 0n) * (snapshots?.[i]?.mTokenBalance || 0n),
        16 + 8
      )
    );
    const supplyValues = underlyingBalance * (m?.price || 0);

    return borrowValues + supplyValues;
  });

  const netApyDenom = denomList?.reduce((acc, s) => {
    return acc + s;
  }, 0);

  const weightedBorrows = markets?.map((m, i) => {
    const borrowValues =
      Number(formatUnits(snapshots?.[i]?.borrowBalance || 0n, m?.underlyingDecimals || 0)) *
      (m.price || 0);
    return Number(m?.borrowApy?.toFixed(6) || 0) * borrowValues;
  });
  const weightedSupplies = markets?.map((m, i) => {
    const underlyingBalance = Number(
      formatUnits(
        (snapshots?.[i]?.exchangeRate || 0n) * (snapshots?.[i]?.mTokenBalance || 0n),
        16 + 8
      )
    );
    const supplyValues = underlyingBalance * (m?.price || 0);
    return Number(m?.supplyApy?.toFixed(6) || 0) * supplyValues;
  });

  const netAPY =
    netApyDenom === 0
      ? 0
      : ((weightedSupplies?.reduce((acc, s) => {
          return acc + s;
        }, 0) || 0) -
          (weightedBorrows?.reduce((acc, s) => {
            return acc + s;
          }, 0) || 0)) /
        netApyDenom;
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
  deltaBorrow?: {
    marketAddress: Address;
    delta: bigint; // underlying's delta
    isRepay: boolean;
  };
}
export const calcHealthFactor = ({
  markets,
  snapshots,
  deltaSupply,
  deltaBorrow,
}: HelathFactorProps) => {
  const numerator = snapshots?.reduce((acc, s) => {
    const market = markets?.find(m => m.address === s.mTokenAddress);

    if (!s?.isCollateral || !market) {
      return acc;
    }
    const delta =
      deltaSupply?.marketAddress === market.address
        ? deltaSupply?.isWithdraw
          ? -deltaSupply?.delta
          : deltaSupply?.delta
        : 0n;
    const underlyingBalance =
      Number(formatUnits((s?.exchangeRate || 0n) * (s?.mTokenBalance || 0n), 16 + 8)) +
      Number(formatUnits(delta || 0n, market.underlyingDecimals || 0));
    const values = underlyingBalance * (market.price ?? 0);
    return acc + values * Number(formatEther(s?.collateralFator || 0n));
  }, 0);

  const denom = snapshots?.reduce((acc, s) => {
    const market = markets?.find(m => m.address === s.mTokenAddress);
    if (!market) {
      return acc;
    }
    const delta =
      deltaBorrow?.marketAddress === market.address
        ? deltaBorrow?.isRepay
          ? -deltaBorrow?.delta
          : deltaBorrow?.delta
        : 0n;

    const values =
      Number(
        formatUnits((s?.borrowBalance || 0n) + (delta || 0n), market.underlyingDecimals || 0)
      ) * (market.price ?? 0);

    return acc + values;
  }, 0);

  const healthFactor = denom === 0 ? Infinity : numerator / denom;
  return healthFactor >= HEALTH_FACTOR_THRESHOLD ? Infinity : healthFactor;
};

export const calcLtv = ({ markets, snapshots }: Props) => {
  const numerator = snapshots?.reduce((acc, s) => {
    const market = markets?.find(m => m.address === s.mTokenAddress);
    if (!market) {
      return acc;
    }

    const values =
      Number(formatUnits(s?.borrowBalance || 0n, market?.underlyingDecimals || 0)) *
      (market?.price ?? 0);
    return acc + values;
  }, 0);

  const denom = snapshots?.reduce((acc, s) => {
    const market = markets?.find(m => m.address === s.mTokenAddress);
    if (!s?.isCollateral || !market) {
      return acc;
    }

    const underlyingBalance = Number(
      formatUnits((s?.exchangeRate || 0n) * (s?.mTokenBalance || 0n), 16 + 8)
    );
    const values = underlyingBalance * (market?.price || 0);
    return acc + values;
  }, 0);

  const ltv = denom === 0 ? 0 : Number((100 * (numerator / denom)).toFixed(2));
  return { ltv, assets: denom, debts: numerator };
};

export const calcNetworth = ({ markets, snapshots }: Props) => {
  const borrowValue = snapshots?.reduce((acc, s, i) => {
    const values =
      Number(formatUnits(s?.borrowBalance || 0n, markets?.[i]?.underlyingDecimals || 0)) *
      (markets?.[i].price || 0);
    return acc + values;
  }, 0);

  const supplyValue = snapshots?.reduce((acc, s, i) => {
    const underlyingBalance = Number(
      formatUnits((s?.exchangeRate || 0n) * (s?.mTokenBalance || 0n), 16 + 8)
    );
    const values = underlyingBalance * (markets?.[i].price || 0);
    return acc + values;
  }, 0);

  return supplyValue - borrowValue;
};
