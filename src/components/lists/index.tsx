import { HTMLAttributes, ReactNode } from 'react';
import tw from 'twin.macro';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: string;
  children?: ReactNode;
}

export const List = ({ title, children }: Props) => {
  return (
    <Wrapper>
      {title && <Header>{title}</Header>}
      <Body>{children}</Body>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full rounded-8 flex flex-col bg-neutral-15 overflow-hidden
`;
const Header = tw.div`
  px-16 py-12 font-m-14 text-neutral-100 bg-neutral-20
`;
const Body = tw.div``;
