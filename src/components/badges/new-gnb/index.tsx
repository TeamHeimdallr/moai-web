import { HTMLAttributes } from 'react';
import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {}

export const BadgeGnbNew = ({ ...rest }: Props) => {
  return <Wrapper {...rest}>New!</Wrapper>;
};

const Wrapper = styled.div(() => [
  tw`
    h-14 px-5 flex-center rounded-10 text-primary-50 text-11 font-medium leading-14
  `,
  css`
    background: rgba(245, 255, 131, 0.2);
    backdrop-filter: blur(2px);
  `,
]);
