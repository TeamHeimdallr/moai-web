import { InputHTMLAttributes } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
}

export const InputTextField = ({ error, errorMessage, ...rest }: Props) => {
  return (
    <Wrapper>
      <EmailInput error={error} {...rest} />
      {error && errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-4
`;

interface EmailInputProps {
  error?: boolean;
}
const EmailInput = styled.input<EmailInputProps>(({ error }) => [
  tw`
    w-full rounded-6 h-48 px-11 py-7 bg-neutral-15 text-neutral-100 font-r-16 border-1 border-solid border-transparent transition-colors
    caret-primary-50

    hover:(border-neutral-80)
    focus:(border-primary-50)
    placeholder:(text-neutral-60)
  `,
  error &&
    tw`
      border-red-50
      hover:(border-red-50)
      focus:(border-red-50)
      caret-red-50
  `,
  !error &&
    css`
      &:not(:placeholder-shown) {
        border-color: ${COLOR.PRIMARY[50]};
      }
    `,
]);

const ErrorMessage = tw.div`
  font-r-12 text-red-50
`;
