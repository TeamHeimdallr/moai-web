import { HTMLAttributes } from 'react';
import tw from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {}
export const BadgeNew = ({ ...rest }: Props) => {
  return <Wrapper {...rest}>N</Wrapper>;
};

const Wrapper = tw.div`
  w-20 h-20 flex-center rounded-10 bg-primary-50 text-neutral-0 font-b-12
`;
