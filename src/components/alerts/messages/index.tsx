import { css } from '@emotion/react';
import { HTMLAttributes } from 'react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconAlert } from '~/assets/icons';

interface Props extends HTMLAttributes<HTMLDivElement> {
  type?: 'error' | 'warning';

  title: string;
  description?: string;
}
export const AlertMessage = ({ type = 'error', title, description, ...rest }: Props) => {
  return (
    <Wrapper type={type} {...rest}>
      <IconWrapper>
        <IconAlert />
      </IconWrapper>
      <TextWrapper>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
      </TextWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  type: 'error' | 'warning';
}
const Wrapper = styled.div<WrapperProps>(({ type }) => [
  tw`flex items-start gap-4 p-8 rounded-8`,

  type === 'error' && tw`bg-red-50/20 text-red-50`,
  type === 'error' &&
    css`
      & svg {
        width: 16px;
        height: 16px;
        fill: ${COLOR.RED[50]};
      }
    `,

  type === 'warning' && tw`bg-orange-50/20 text-orange-50`,
  type === 'warning' &&
    css`
      & svg {
        width: 16px;
        height: 16px;
        fill: ${COLOR.ORANGE[50]};
      }
    `,
]);

const IconWrapper = tw.div`
  py-3 flex-center
`;

const TextWrapper = tw.div`
  flex flex-col
`;
const Title = tw.div`
  font-m-14
`;

const Description = tw.div`
  font-r-12
`;
