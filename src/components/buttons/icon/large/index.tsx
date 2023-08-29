import { css } from '@emotion/react';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;

  selected?: boolean;
  onSelect?: () => void;
}

export const ButtonIconLarge = ({ icon, ...rest }: Props) => {
  return <Wrapper {...rest}>{icon}</Wrapper>;
};

interface WrapperProps {
  selected?: boolean;
}
const Wrapper = styled.button<WrapperProps>(({ selected }) => [
  tw`
    p-8 flex-center rounded-full clickable

    bg-transparent
    hover:(bg-neutral-10)
    disabled:(bg-transparent non-clickable hover:(bg-transparent))
  `,
  selected && tw``,
  css`
    & svg {
      width: 24px;
      height: 24px;
    }

    & path {
      fill: ${COLOR.NEUTRAL[60]};
    }

    &:hover {
      & path {
        fill: ${COLOR.PRIMARY[80]};
      }
    }

    &:disabled,
    &:disabled:hover {
      & path {
        fill: ${COLOR.NEUTRAL[20]};
      }
    }
  `,
  selected &&
    css`
      & path {
        fill: ${COLOR.PRIMARY[50]};
      }

      &:hover {
        & path {
          fill: ${COLOR.PRIMARY[50]};
        }
      }
    `,
]);
