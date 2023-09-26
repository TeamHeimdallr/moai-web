import { HTMLAttributes, ReactNode } from 'react';
import tw, { css, styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  value: ReactNode;

  width?: number | 'full';
  align?: 'flex-start' | 'center' | 'flex-end';
}
export const TableColumnBadge = ({ value, width, align, ...rest }: Props) => {
  return (
    <Wrapper width={width} align={align} {...rest}>
      {value}
    </Wrapper>
  );
};

interface WrapperProps {
  width?: number | 'full';
  align?: 'flex-start' | 'center' | 'flex-end';
}
const Wrapper = styled.div<WrapperProps>(({ width, align }) => [
  tw`flex items-center justify-start flex-shrink-0 font-r-16 text-neutral-100`,

  width === 'full' && tw`flex-1 w-full`,
  typeof width === 'number' &&
    css`
      width: ${width}px;
    `,

  align &&
    css`
      justify-content: ${align};
    `,
]);
