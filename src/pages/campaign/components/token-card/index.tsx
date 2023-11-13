import { ReactNode } from 'react';
import tw from 'twin.macro';

interface Props {
  title: string;
  token: ReactNode;
}
export const TokenCard = ({ title, token }: Props) => {
  return (
    <Wrapper>
      <SubTitle>{title}</SubTitle>
      {token}
    </Wrapper>
  );
};
const Wrapper = tw.div`flex flex-wrap flex-col gap-24 p-24 pt-20 bg-neutral-10 rounded-12`;
const SubTitle = tw.div`font-b-20`;
