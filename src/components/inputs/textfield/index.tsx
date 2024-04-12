import { InputHTMLAttributes, useState } from 'react';
import tw, { styled } from 'twin.macro';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;

  error?: boolean;
  errorMessage?: string;
}

export const InputTextField = ({ id, label, error, errorMessage, ...rest }: Props) => {
  const [focus, setFocus] = useState(false);

  return (
    <Wrapper focused={focus} error={error}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <InnerWrapper>
        <Input
          id={id}
          error={error}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          {...rest}
        />
        {error && errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </InnerWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  error?: boolean;
  focused?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ error, focused }) => [
  tw`
    flex flex-col gap-12 rounded-8 bg-neutral-15 p-15 border-1 border-solid border-transparent text-neutral-100 transition-colors
  `,
  focused && tw`border-primary-50 hover:(border-primary-50)`,
  error && tw`border-red-50 hover:(border-red-50)`,
]);

const Label = tw.label`
  font-r-14 text-neutral-80
`;
const InnerWrapper = tw.div`
  flex flex-col gap-4
`;

interface InputProps {
  error?: boolean;
}
const Input = styled.input<InputProps>(({ error }) => [
  tw`
    w-full h-32 font-m-24 caret-primary-50 bg-transparent border-none outline-none text-neutral-100
    placeholder:(text-neutral-60)
  `,
  error && tw`text-red-50 caret-red-50`,
]);

const ErrorMessage = tw.div`
  font-r-14 text-red-50
`;
