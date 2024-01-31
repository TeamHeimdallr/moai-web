import { HTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

interface Props extends HTMLAttributes<HTMLDivElement> {
  text: string;

  backgroundColor?: string;
  color?: string;
}
export const BadgeText = ({ text, backgroundColor, color, ...rest }: Props) => {
  return (
    <Wrapper backgroundColor={backgroundColor} color={color} {...rest}>
      {text}
    </Wrapper>
  );
};

interface WrapperProps {
  backgroundColor?: string;
  color?: string;
}
const Wrapper = styled.div<WrapperProps>(({ backgroundColor, color }) => [
  tw`
    px-10 py-2 rounded-17 flex-center font-m-12
  `,
  backgroundColor &&
    css`
      background-color: ${backgroundColor};
    `,
  color &&
    css`
      color: ${color};
    `,
]);
