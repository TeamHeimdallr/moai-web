import { HTMLAttributes, ReactNode } from 'react';
import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  align?: 'flex-start' | 'flex-end' | 'center';
}

export const TableColumnButtons = ({ children, align, ...rest }: Props) => {
  return (
    <Wrapper align={align} {...rest}>
      {children}
    </Wrapper>
  );
};

interface WrapperProps {
  align?: 'flex-start' | 'flex-end' | 'center';
}
const Wrapper = styled.div<WrapperProps>(({ align }) => [
  tw`
    flex items-center justify-end gap-8
  `,
  align &&
    css`
      justify-content: ${align};
    `,
]);
