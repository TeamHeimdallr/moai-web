import { ButtonHTMLAttributes } from 'react';
import tw, { styled } from 'twin.macro';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

export const ButtonPrimarySmallBlack = ({ text, ...rest }: Props) => {
  return <Wrapper {...rest}>{text}</Wrapper>;
};

const Wrapper = styled.button(() => [
  tw`
    gap-6 px-12 py-4 inline-flex-center rounded-8 clickable font-m-12 text-neutral-100 relative transition-colors

    bg-neutral-10
    hover:(bg-neutral-100 text-neutral-0)
    disabled:(non-clickable)
  `,
]);
