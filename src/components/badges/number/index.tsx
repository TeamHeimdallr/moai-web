import { HTMLAttributes } from 'react';
import tw, { styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  value: number;
  selected?: boolean;
}
export const BadgeNumber = ({ value, selected, ...rest }: Props) => {
  return (
    <Wrapper selected={selected} {...rest}>
      {value}
    </Wrapper>
  );
};

interface WrapperProps {
  selected?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ selected }) => [
  tw`w-24 h-24 flex-center rounded-8 font-b-12`,
  selected ? tw`bg-primary-50 text-neutral-0` : tw`bg-neutral-5 text-neutral-40`,
]);
