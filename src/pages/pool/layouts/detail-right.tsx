import tw from 'twin.macro';

import { UserPoolBalances } from '../components/user-pool-balances';

export const DetailRight = () => {
  return (
    <Wrapper>
      <UserPoolBalances />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-400 flex items-start
`;
