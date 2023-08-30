import { ButtonHTMLAttributes } from 'react';
import tw, { styled } from 'twin.macro';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  selected?: boolean;
}

export const ButtonChipMedium = ({ text, selected, ...rest }: Props) => {
  return (
    <Wrapper selected={selected} {...rest}>
      {text}
    </Wrapper>
  );
};

interface WrapperProps {
  selected?: boolean;
}
const Wrapper = styled.button<WrapperProps>(({ selected }) => [
  tw`
    py-5 transition-colors bg-transparent border-solid inline-flex-center
    px-15 font-r-16 text-neutral-60 clickable border-1 border-neutral-60 rounded-8

    hover:(bg-neutral-20 border-neutral-80)
  `,
  selected &&
    tw`
      bg-primary-20 border-primary-50 text-primary-50
      hover:(bg-primary-20 border-primary-50 text-primary-50)
  `,
]);
