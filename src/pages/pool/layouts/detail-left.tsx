import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { useLiquidityPoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';

import { useRequirePrarams } from '~/hooks/utils';

import { PoolCompositions } from '../components/pool-compositions';
import { PoolInfo } from '../components/pool-info';
import { PoolLiquidityProvisions } from '../components/pool-liquidity-provisions';
import { PoolSwapHistories } from '../components/pool-swap-histories';

export const DetailLeft = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  useRequirePrarams([!!id], () => navigate(-1));

  const { pool } = useLiquidityPoolBalance(id ?? '');
  const { formattedValue, formattedVolume, formattedApr, formattedFees } = pool;

  return (
    <Wrapper>
      <PoolInfo
        value={formattedValue}
        volume={formattedVolume}
        apr={formattedApr}
        fees={formattedFees}
      />
      <PoolCompositions pool={pool} />
      <PoolLiquidityProvisions pool={pool} />
      <PoolSwapHistories pool={pool} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col gap-24
`;
