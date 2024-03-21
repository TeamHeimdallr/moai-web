import { InputHTMLAttributes, useState } from 'react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCancel, IconSearch } from '~/assets/icons';

import { ButtonIconMedium } from '~/components/buttons';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  handleDelete?: () => void;
}

export const InputSearch = ({ handleDelete, value, ...rest }: Props) => {
  const [focus, setFocus] = useState(false);

  return (
    <Wrapper>
      <InputWrapper focus={focus}>
        <Label htmlFor="input-search">
          <IconSearch width={24} height={24} fill={COLOR.NEUTRAL[40]} />
        </Label>
        <InputInnerWrapper>
          <Input
            id="input-search"
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            value={value}
            {...rest}
          />
          {!!value && <ButtonIconMedium icon={<IconCancel />} onClick={handleDelete} />}
        </InputInnerWrapper>
      </InputWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-4
`;

interface InputProps {
  focus?: boolean;
}
const InputWrapper = styled.div<InputProps>(({ focus }) => [
  tw`
    flex items-center gap-16 py-7 px-15 rounded-24 bg-neutral-15 border-solid border-1 border-transparent
    hover:(border-neutral-80)
  `,
  focus && tw`border-primary-50 hover:(border-primary-50)`,
]);

const Label = tw.label`
  flex-center
`;
const InputInnerWrapper = tw.div`
  flex flex-1 w-full gap-4 items-center h-32
`;

const Input = tw.input`
  w-full h-24 bg-neutral-15 text-neutral-100 font-r-16 caret-primary-50 border-none
  placeholder:(text-neutral-40 font-r-16)
`;
