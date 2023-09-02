import tw from 'twin.macro';

import { PoolInfoCard } from '../pool-info-card';

interface Props {
  totalBalances: string;
  volume: string;
  apr: string;
  fees: string;
}
export const PoolInfo = ({ totalBalances, volume, apr, fees }: Props) => {
  return (
    <PoolValueContainer>
      <PoolInfoCard name="Pool Value" value={totalBalances} />
      <PoolInfoCard name="Volume (24h)" value={volume} />
      <PoolInfoCard name="Fees (24h)" value={fees} />
      <PoolInfoCard name="APR" value={apr} />
    </PoolValueContainer>
  );
};

const PoolValueContainer = tw.div`flex gap-16`;
