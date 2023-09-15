import tw from 'twin.macro';

import { PoolInfo } from '~/types/components';

import { LiquidityProvisions } from '../../components/liquidity-provisions';
import { PoolCompositions } from '../../components/pool-compositions';
import { PoolInfo as PoolInfoComponent } from '../../components/pool-info/pool-info';
import { Swap } from '../../components/swap';

interface Props {
  pool: PoolInfo;
}
export const MainLeft = ({ pool }: Props) => {
  const { value, volume, apr, fees } = pool;

  return (
    <Wrapper>
      <PoolInfoComponent value={value} volume={volume} apr={apr} fees={fees} />
      <PoolCompositions pool={pool} />
      <LiquidityProvisions pool={pool} />
      <Swap pool={pool} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col gap-80
`;
