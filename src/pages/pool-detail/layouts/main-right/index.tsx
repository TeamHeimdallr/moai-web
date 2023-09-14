import tw from 'twin.macro';

import { PoolInfo, TokenInfo } from '~/types/components';

import { PoolBalance } from '../../components/pool-balance';

interface Props {
  pool: PoolInfo;
  compositions: TokenInfo[];
}
export const MainRight = ({ pool, compositions }: Props) => {
  return (
    <Wrapper>
      <PoolBalance pool={pool} compositions={compositions} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-400 flex items-start
`;
