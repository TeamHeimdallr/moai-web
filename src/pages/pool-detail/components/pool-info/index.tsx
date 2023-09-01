import tw from 'twin.macro';

import { PoolInfoCard } from '../pool-info-card';

interface Props {
  totalBalances: string;
  volume: string;
  apy: string;
  fees: string;
}
export const PoolInfo = ({ totalBalances, volume, apy, fees }: Props) => {
  return (
    <PoolValueContainer>
      <PoolInfoCard name="Pool Value" value={totalBalances} />
      <PoolInfoCard name="Volume (24h)" value={volume} />
      <PoolInfoCard name="Fees (24h)" value={fees} />
      <PoolInfoCard name="APY" value={apy} />
    </PoolValueContainer>
  );
};

const PoolValueContainer = tw.div`flex gap-16`;
