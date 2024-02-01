import { HTMLAttributes, useState } from 'react';
import classNames from 'classnames';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
interface Props extends HTMLAttributes<HTMLDivElement> {
  selected: boolean;
}

export const Toggle = ({ selected, ...rest }: Props) => {
  const [hover, setHover] = useState(false);

  return (
    <Wrapper
      className={classNames({
        toggle: true,
        'toggle-selected': selected,
        'toggle-hover': hover,
      })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      selected={selected}
      {...rest}
    >
      <Circle selected={selected} />
    </Wrapper>
  );
};

interface DivProps {
  selected: boolean;
}

const Wrapper = styled.div<DivProps>(({ selected }) => [
  tw`relative w-40 h-24  rounded-12 clickable transition-color`,
  selected ? tw`bg-primary-50` : tw`bg-neutral-20 hover:bg-neutral-40`,
  !selected &&
    css`
      &:hover div {
        background-color: ${COLOR.NEUTRAL[90]};
      }
    `,
]);

const Circle = styled.div<DivProps>(({ selected }) => [
  tw`absolute rounded-full  drop-shadow-default transition-toggle transition-color`,
  selected ? tw`top-3 w-19 h-19 bg-neutral-100 left-18` : tw`w-16 h-16 top-4 bg-neutral-80 left-4`,
]);
