import { HTMLAttributes, ReactNode } from 'react';
import tw, { css, styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  text: string;
  icon?: ReactNode;

  width?: number | 'full';
  align?: 'flex-start' | 'center' | 'flex-end';
  isAddress?: boolean;
}
export const TableColumnIcon = ({ text, icon, width, align, isAddress, ...rest }: Props) => {
  return (
    <Wrapper width={width} align={align} isAddress={isAddress} {...rest}>
      <IconWrapper>{icon}</IconWrapper>
      <TextWrapper>{text}</TextWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  width?: number | 'full';
  align?: 'flex-start' | 'center' | 'flex-end';
  isAddress?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ width, align, isAddress }) => [
  tw`flex items-center justify-start flex-shrink-0 gap-12 font-r-16 text-neutral-100`,

  width === 'full' && tw`flex-1 w-full`,
  typeof width === 'number' &&
    css`
      width: ${width}px;
    `,

  align &&
    css`
      justify-content: ${align};
    `,
  isAddress && tw`address`,
]);

const IconWrapper = tw.div`
  flex-center
`;

const TextWrapper = tw.div`
  flex gap-4 items-center
`;
