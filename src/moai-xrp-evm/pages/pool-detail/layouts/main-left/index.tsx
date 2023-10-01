import tw from 'twin.macro';

import { PoolInfo } from '~/moai-xrp-evm/types/components';

import { LiquidityProvisions } from '../../components/liquidity-provisions';
import { PoolCompositions } from '../../components/pool-compositions';
import { PoolInfo as PoolInfoComponent } from '../../components/pool-info/pool-info';
import { Swap } from '../../components/swap';

interface Props {
  pool: PoolInfo;
}
export const MainLeft = ({ pool }: Props) => {
  const { formattedValue, formattedVolume, formattedApr, formattedFees } = pool;

  return (
    <Wrapper>
      <PoolInfoComponent
        value={formattedValue}
        volume={formattedVolume}
        apr={formattedApr}
        fees={formattedFees}
      />
      <PoolCompositions pool={pool} />
      <LiquidityProvisions pool={pool} />
      <Swap pool={pool} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col gap-80
`;
