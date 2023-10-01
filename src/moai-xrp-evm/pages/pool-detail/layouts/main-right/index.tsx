import tw from 'twin.macro';

import { PoolInfo, TokenInfo } from '~/moai-xrp-evm/types/components';

import { UserPoolBalance } from '../../components/user-pool-balance';

interface Props {
  pool: PoolInfo;
  userPoolBalances: TokenInfo[];
}
export const MainRight = ({ pool, userPoolBalances }: Props) => {
  return (
    <Wrapper>
      <UserPoolBalance pool={pool} userPoolBalances={userPoolBalances} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-400 flex items-start
`;
