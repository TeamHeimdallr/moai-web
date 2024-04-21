import { InputHTMLAttributes, useState } from 'react';
import tw, { styled } from 'twin.macro';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
}

export const InputText = ({ label, error, errorMessage, ...rest }: Props) => {
  const [focus, setFocus] = useState(false);

  return (
    <Wrapper>
      <InputWrapper error={error} focus={focus}>
        {!!label && <Label htmlFor="input-text">{label}</Label>}
        <InputInnerWrapper>
          <Input
            id="input-text"
            error={error}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            {...rest}
          />
          {error && errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </InputInnerWrapper>
      </InputWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-4
`;

interface InputProps {
  error?: boolean;
  focus?: boolean;
}
const InputWrapper = styled.div<InputProps>(({ error, focus }) => [
  tw`
    p-16 flex flex-col gap-12 bg-neutral-15 rounded-8 border-1 border-solid border-transparent transition-colors

    hover:(border-neutral-80)
  `,
  focus && tw`border-primary-50 hover:(border-primary-50)`,
  error &&
    tw`
      border-red-50
      hover:(border-red-50)
      focus:(border-red-50)
      caret-red-50
  `,
]);

const InputInnerWrapper = tw.div`
  flex flex-col gap-4
`;

interface InputProps {
  error?: boolean;
}
const Input = styled.input<InputProps>(({ error }) => [
  tw`
    w-full h-32 bg-neutral-15 text-neutral-100 font-m-24 caret-primary-50 border-none
    placeholder:(text-neutral-60)
    disabled:(text-neutral-60)
  `,
  error && tw`text-red-50`,
]);

const ErrorMessage = tw.div`
  font-r-12 text-red-50
`;

const Label = tw.label`
  font-r-14 text-neutral-80
`;
