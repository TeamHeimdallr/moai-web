import tw from 'twin.macro';

import { UserPoolBalance } from '../../components/user-pool-balance';

export const DetailRight = () => {
  return (
    <Wrapper>
      <UserPoolBalance />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-400 flex items-start
`;
