import { HTMLAttributes, ReactNode } from 'react';
import tw, { css, styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  value: ReactNode;

  align?: 'flex-start' | 'center' | 'flex-end';
}
export const TableColumn = ({ value, align, ...rest }: Props) => {
  return (
    <Wrapper align={align} {...rest}>
      {value}
    </Wrapper>
  );
};

interface WrapperProps {
  align?: 'flex-start' | 'center' | 'flex-end';
}
const Wrapper = styled.div<WrapperProps>(({ align }) => [
  tw`flex items-center justify-start w-full font-r-16 text-neutral-100`,
  align &&
    css`
      justify-content: ${align};
    `,
]);
