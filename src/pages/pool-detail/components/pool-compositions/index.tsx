import tw from 'twin.macro';

import { PoolInfo } from '~/types/components';

interface Props {
  pool: PoolInfo;
}
export const PoolCompositions = ({ pool }: Props) => {
  return (
    <Wrapper>
      <Title>Pool composition</Title>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24
`;

const Title = tw.div`
  font-b-20 text-neutral-100
`;
