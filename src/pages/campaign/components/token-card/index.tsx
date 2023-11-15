import { HTMLAttributes, ReactNode } from 'react';
import tw, { styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  type: 'balance' | 'reward';
  title: string;
  token: ReactNode;
}
export const TokenCard = ({ title, token, type, ...rest }: Props) => {
  return (
    <Wrapper type={type} {...rest}>
      <SubTitle>{title}</SubTitle>
      {token}
    </Wrapper>
  );
};
interface DivProps {
  type: 'balance' | 'reward';
}
const Wrapper = styled.div<DivProps>(({ type }) => [
  tw`w-full flex flex-wrap flex-col gap-24 p-24 pt-20 bg-neutral-10 rounded-12`,
  type === 'reward' && tw`col-span-2`,
]);
const SubTitle = tw.div`font-b-18 md:font-b-20`;
