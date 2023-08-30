import { yupResolver } from '@hookform/resolvers/yup';
import { InputHTMLAttributes, ReactNode, useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { TOKEN, TOKEN_PRICE_MAPPER } from '~/constants/constant-token';
import { HOOK_FORM_KEY } from '~/types/components/inputs';
import { formatNumber } from '~/utils/number';

interface Props
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'onBlur'
  > {
  balance?: number | string;
  handleChange?: (value?: number) => void;

  token?: ReactNode;
  handleTokenClick?: () => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: any;
}

interface FormState {
  [HOOK_FORM_KEY.NUMBER_INPUT_VALUE]?: number;
}

export const InputNumber = ({
  token,
  balance,
  placeholder = '0',
  schema,
  handleChange,
  handleTokenClick,
  ...rest
}: Props) => {
  const [focused, setFocus] = useState(false);

  const { control, watch, formState } = useForm<FormState>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: schema && yupResolver(schema),
  });

  const errorMessage = formState?.errors?.[HOOK_FORM_KEY.NUMBER_INPUT_VALUE]?.message ?? '';
  const value = watch(HOOK_FORM_KEY.NUMBER_INPUT_VALUE);

  const tokenPrice = (value || 0) * TOKEN_PRICE_MAPPER[TOKEN.MNT];
  // TODO: get balance from wallet
  const currentBalance = balance || 1234.12;

  useEffect(() => {
    setFocus(value !== undefined);
  }, [value]);

  useEffect(() => {}, []);

  const CustomInput = useCallback(({ ...rest }: Props) => <Input {...rest} />, []);
  return (
    <Controller
      name={HOOK_FORM_KEY.NUMBER_INPUT_VALUE}
      control={control}
      render={formProps => {
        const { field } = formProps;
        const { onChange, onBlur, name, value } = field;

        const onValueChange = (value?: number) => {
          onChange(value);
          handleChange?.(value);
        };
        return (
          <Wrapper focused={focused} error={!!errorMessage}>
            <TokenInputWrapper>
              <TokenWrapper onClick={handleTokenClick}>{token}</TokenWrapper>
              <InputWrapper>
                <NumericFormat
                  name={name}
                  allowLeadingZeros={false}
                  allowNegative={false}
                  placeholder={placeholder}
                  thousandSeparator
                  maxLength={16}
                  value={value}
                  onValueChange={values => onValueChange(values.floatValue)}
                  customInput={CustomInput}
                  onFocus={() => setFocus(true)}
                  onBlur={() => {
                    onBlur();
                    setFocus(false);
                  }}
                  {...rest}
                />
              </InputWrapper>
            </TokenInputWrapper>
            <BalanceOuterWrapper>
              <BalanceWrapper>
                <BalanceLabel>Balance</BalanceLabel>
                <BalanceValue>{formatNumber(currentBalance ?? 0, 2)}</BalanceValue>
                <TokenPriceValue>${formatNumber(tokenPrice ?? 0, 2)}</TokenPriceValue>
              </BalanceWrapper>
              {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            </BalanceOuterWrapper>
          </Wrapper>
        );
      }}
    />
  );
};

interface WrapperProps {
  focused?: boolean;
  error?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ focused, error }) => [
  tw`
    w-404 flex flex-col gap-12 pt-16 pb-12 pl-12 pr-20 transition-colors
    border-transparent border-solid bg-neutral-15 rounded-8 border-1
    hover:(border-neutral-80)
  `,
  focused && tw`border-primary-50 hover:(border-primary-50)`,
  error && tw`border-red-50 hover:(border-red-50)`,
  error &&
    css`
      & input {
        color: ${COLOR.RED[50]};
      }
    `,
]);

const TokenInputWrapper = tw.div`
  flex gap-8
`;

const TokenWrapper = tw.div`
  flex-center flex-shrink-0
`;
const InputWrapper = tw.div`
  w-full flex items-center py-4
`;

const Input = tw.input`
  w-full flex flex-1 bg-transparent font-m-24 px-0 border-none caret-primary-50 text-right
  text-neutral-100 placeholder-neutral-60
`;

const BalanceOuterWrapper = tw.div`
  flex flex-col gap-4
`;

const BalanceWrapper = tw.div`
  flex gap-6 py-3 text-neutral-80 font-r-14
`;
const BalanceLabel = tw.div`
  text-neutral-60
`;
const BalanceValue = tw.div`
  text-neutral-60
`;
const TokenPriceValue = tw.div`
  text-neutral-60 flex-1 text-right
`;

const ErrorMessage = tw.div`
  w-full text-right font-r-14 text-red-50
`;
