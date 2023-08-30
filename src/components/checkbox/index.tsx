import { HTMLAttributes } from 'react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCheck } from '~/assets/icons';

interface Props extends HTMLAttributes<HTMLDivElement> {
  selected: boolean;
}

export const Checkbox = ({ selected, ...rest }: Props) => {
  return (
    <Wrapper selected={selected} {...rest}>
      {selected && (
        <IconWrapper>
          <IconCheck fill={COLOR.NEUTRAL[0]} />
        </IconWrapper>
      )}
    </Wrapper>
  );
};

interface DivProps {
  selected: boolean;
}

const Wrapper = styled.div<DivProps>(({ selected }) => [
  tw`
    w-24 h-24 rounded-6 clickable flex-center
  `,
  selected
    ? tw`bg-primary-50`
    : tw`bg-neutral-0 border-1 border-solid border-neutral-60 hover:(border-1 border-solid border-neutral-80 bg-neutral-5)`,
]);

const IconWrapper = tw.div`flex-center`;
