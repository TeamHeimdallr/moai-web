import { InputHTMLAttributes, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { NumberFormatValues, NumericFormat } from 'react-number-format';
import tw, { css, styled } from 'twin.macro';

import { TOKEN, TOKEN_PRICE_MAPPER } from '~/constants/constant-token';
import { NUMBER_INPUT_ERROR_TYPE } from '~/types/components/inputs';
import { formatNumber } from '~/utils/number';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  value?: number | string;
  handleChange?: (value: NumberFormatValues) => void;

  balance?: number | string;

  token?: ReactNode;
  handleTokenClick?: () => void;

  handleError?: (type: NUMBER_INPUT_ERROR_TYPE) => void;
  handleResolveError?: () => void;
}

export const InputNumber = ({
  token,
  balance,
  placeholder = '0',
  value,
  disabled,
  handleChange,
  handleTokenClick,
}: Props) => {
  const [internalValue, setInternalValue] = useState<number>();
  const [focused, setFocus] = useState(false);
  const [error, setError] = useState(false);

  const onValueChange = (value: NumberFormatValues) => {
    handleChange?.(value);
    setInternalValue(value.floatValue);
  };

  const tokenPrice = (internalValue || 0) * TOKEN_PRICE_MAPPER[TOKEN.MNT];
  // TODO: get balance from wallet
  const currentBalance = balance || 1234.12;

  useEffect(() => {
    setFocus(internalValue !== undefined);
  }, [internalValue]);

  useEffect(() => {}, []);

  const CustomInput = useCallback(({ ...rest }: Props) => <Input {...rest} />, []);
  return (
    <Wrapper focused={focused}>
      <TokenInputWrapper>
        <TokenWrapper onClick={handleTokenClick}>{token}</TokenWrapper>
        <InputWrapper>
          <NumericFormat
            disabled={disabled}
            allowLeadingZeros={false}
            allowNegative={false}
            placeholder={placeholder}
            thousandSeparator
            maxLength={16}
            value={value}
            onValueChange={onValueChange}
            customInput={CustomInput}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </InputWrapper>
      </TokenInputWrapper>
      <BalanceWrapper>
        <BalanceLabel>Balance</BalanceLabel>
        <BalanceValue>{formatNumber(currentBalance ?? 0, 2)}</BalanceValue>
        <TokenPriceValue>${formatNumber(tokenPrice ?? 0, 2)}</TokenPriceValue>
      </BalanceWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  focused?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ focused }) => [
  tw`
    w-404 flex flex-col gap-12 pt-16 pb-12 pl-12 pr-20 transition-colors
    border-transparent border-solid bg-neutral-15 rounded-8 border-1
    hover:(border-neutral-80)
  `,
  focused && tw`border-primary-50 hover:(border-primary-50)`,
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
