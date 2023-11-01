import { HTMLAttributes, ReactNode } from 'react';
import tw, { css, styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  text: string;
  icon?: ReactNode;

  align?: 'flex-start' | 'center' | 'flex-end';
  address?: boolean;
}
export const TableColumnIconText = ({ text, icon, align, address, ...rest }: Props) => {
  return (
    <Wrapper align={align} address={address} {...rest}>
      <IconWrapper>{icon}</IconWrapper>
      <TextWrapper>{text}</TextWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  align?: 'flex-start' | 'center' | 'flex-end';
  address?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ align, address }) => [
  tw`flex items-center justify-start w-full gap-12 font-r-16 text-neutral-100`,

  align &&
    css`
      justify-content: ${align};
    `,
  address && tw`address`,
]);

const IconWrapper = tw.div`
  flex-center
`;

const TextWrapper = tw.div`
  flex gap-4 items-center
`;
