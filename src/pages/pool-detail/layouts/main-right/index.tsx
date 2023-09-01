import tw from 'twin.macro';

import { PoolInfo, TokenInfo } from '~/types/components';

import { MyPoolBalance } from '../../components/my-pool-balance';

interface Props {
  pool: PoolInfo;
  compositions: TokenInfo[];
}
export const MainRight = ({ pool, compositions }: Props) => {
  return (
    <Wrapper>
      <MyPoolBalance pool={pool} compositions={compositions} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-400 flex items-start
`;
