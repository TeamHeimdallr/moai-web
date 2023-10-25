import { HTMLAttributes } from 'react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCheck } from '~/assets/icons';

interface Props extends HTMLAttributes<HTMLDivElement> {
  selected: boolean;
  error?: boolean;
}

export const Checkbox = ({ selected, error = false, ...rest }: Props) => {
  return (
    <Wrapper selected={selected} error={error} {...rest}>
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
  error: boolean;
}

const Wrapper = styled.div<DivProps>(({ selected, error }) => [
  tw`w-24 h-24 rounded-6 clickable flex-center transition-color`,

  selected
    ? tw`bg-primary-50`
    : error
    ? tw`border-1 border-solid border-red-50 hover:(border-1 border-solid border-red-50 bg-neutral-20)`
    : tw`bg-neutral-0 border-1 border-solid border-neutral-60 hover:(border-1 border-solid border-neutral-80 bg-neutral-20)`,
]);

const IconWrapper = tw.div`flex-center`;
