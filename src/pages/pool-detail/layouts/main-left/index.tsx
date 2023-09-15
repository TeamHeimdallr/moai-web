import { useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { usePoolBalance } from '~/api/api-contract/pool-balance';

import { LiquidityProvisions } from '../../components/liquidity-provisions';
import { PoolCompositions } from '../../components/pool-compositions';
import { PoolInfo } from '../../components/pool-info/pool-info';
import { Swap } from '../../components/swap';

export const MainLeft = () => {
  const { id } = useParams();

  const { poolInfo, compositions } = usePoolBalance(id);
  console.log(poolInfo, compositions);

  const { value, volume, apr, fees } = poolInfo;

  return (
    <Wrapper>
      <PoolInfo value={value} volume={volume} apr={apr} fees={fees} />
      <PoolCompositions pool={poolInfo} />
      <LiquidityProvisions pool={poolInfo} />
      <Swap pool={poolInfo} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col gap-80
`;
