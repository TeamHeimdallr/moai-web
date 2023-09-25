import { ButtonHTMLAttributes, ReactNode } from 'react';
import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;

  selected?: boolean;
  onSelect?: () => void;
}

export const ButtonIconSmall = ({ icon, ...rest }: Props) => {
  return <Wrapper {...rest}>{icon}</Wrapper>;
};

interface WrapperProps {
  selected?: boolean;
}
const Wrapper = styled.button<WrapperProps>(({ selected }) => [
  tw`
    p-2 flex-center rounded-full clickable transition-colors

    bg-transparent
    hover:(bg-neutral-10)
    disabled:(bg-transparent non-clickable hover:(bg-transparent))
  `,
  selected && tw``,
  css`
    & svg {
      width: 16px;
      height: 16px;
    }

    & path {
      fill: ${COLOR.NEUTRAL[60]};
      transition-property: background-color, border-color, color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
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
