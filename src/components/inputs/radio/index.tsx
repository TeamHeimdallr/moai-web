import { HTMLAttributes } from 'react';
import tw, { styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  selected: boolean;
}

export const Radio = ({ selected, ...rest }: Props) => {
  return (
    <Wrapper selected={selected} {...rest}>
      <Circle selected={selected} />
    </Wrapper>
  );
};

interface DivProps {
  selected: boolean;
}

const Wrapper = styled.div<DivProps>(({ selected }) => [
  tw`w-20 h-20 rounded-12 clickable flex-center transition-color`,
  selected
    ? tw`border-transparent bg-primary-50`
    : tw`bg-neutral-0 border-1 border-solid border-neutral-60 hover:(border-1 border-solid border-neutral-80 bg-neutral-5)`,
]);

const Circle = styled.div<DivProps>(({ selected }) => [
  tw`w-12 h-12 border-0 rounded-6 transition-color`,
  selected && tw`visible bg-neutral-0`,
]);
