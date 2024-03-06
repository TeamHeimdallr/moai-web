import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
interface Props extends HTMLAttributes<HTMLDivElement> {
  selected: boolean;
  disabled?: boolean;
}

export const Toggle = ({ selected, disabled, ...rest }: Props) => {
  return (
    <Wrapper selected={selected} disabled={disabled} {...rest}>
      <Circle selected={selected} disabled={disabled} />
    </Wrapper>
  );
};

interface DivProps {
  selected: boolean;
  disabled?: boolean;
}

const Wrapper = styled.div<DivProps>(({ selected, disabled }) => [
  tw`relative w-40 h-24  rounded-12 clickable transition-color`,
  selected ? tw`bg-primary-50` : tw`bg-neutral-20 hover:bg-neutral-40`,
  !selected &&
    css`
      &:hover div {
        background-color: ${COLOR.NEUTRAL[90]};
      }
    `,

  disabled && tw`bg-neutral-20 non-clickable`,
]);

const Circle = styled.div<DivProps>(({ selected, disabled }) => [
  tw`absolute rounded-full  drop-shadow-default transition-toggle transition-color`,
  selected ? tw`top-3 w-19 h-19 bg-neutral-100 left-18` : tw`w-16 h-16 top-4 bg-neutral-80 left-4`,
  disabled && tw`bg-neutral-30 non-clickable top-4 left-4 w-16 h-16`,
]);
