/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputHTMLAttributes, ReactNode, useCallback, useEffect, useState } from 'react';
import { Control, Controller, FormState, UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';

import { NETWORK_IMAGE_MAPPER } from '~/constants';

import { ButtonPrimarySmall } from '~/components/buttons/primary';

import { formatNumber } from '~/utils';
import { NETWORK } from '~/types';

type OmitType = 'type' | 'onChange' | 'onBlur' | 'autoFocus';
interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, OmitType> {
  balance?: number;
  handleChange?: (value?: number) => void;

  token?: ReactNode;
  tokenName?: string;
  tokenValue?: number;
  handleTokenClick?: () => void;

  value?: number | string;
  defaultValue?: number;

  focus?: boolean;
  blured?: boolean;
  blurAll?: (focused: boolean) => void;
  autoFocus?: boolean;

  maxButton?: boolean;
  slider?: boolean;
  sliderActive?: boolean;

  name?: string;
  control?: Control<any>;
  setValue?: UseFormSetValue<any>;
  formState?: FormState<any>;

  title?: string;
  network?: NETWORK;
}

export const InputNumber = ({
  token,
  tokenValue: defaultTokenValue,
  balance,
  placeholder = '0',
  maxButton,

  title,
  network,

  focus = true,
  value,
  handleChange,
  handleTokenClick,
  blured,
  blurAll,
  autoFocus = false,

  name = '',
  control,
  setValue,
  formState,

  ...rest
}: Props) => {
  const [focused, setFocus] = useState(false);

  const { t } = useTranslation();

  const errorMessage = (formState?.errors?.[name ?? '']?.message ?? '') as string;
  const numValue = Number(value) || 0;
  const handledValue = numValue ? (numValue < 0 ? undefined : numValue) : undefined;

  const tokenValue = defaultTokenValue ?? 0;
  const currentBalance = balance || 0;

  const networkName = network === NETWORK.THE_ROOT_NETWORK ? 'The Root Network' : 'XRPL';

  useEffect(() => {
    if (!focus) return;
    if (!handledValue || blured) {
      setFocus(false);
      return;
    }
    if (autoFocus) {
      setFocus(handledValue > 0);
    }
  }, [handledValue, focus, blured, autoFocus]);

  useEffect(() => {
    setValue?.(name ?? '', Number(value || 0), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const CustomInput = useCallback((props: Props) => <Input {...props} />, []);
  return (
    <Controller
      name={name}
      control={control}
      render={formProps => {
        const { field } = formProps;
        const { onChange, onBlur, name } = field;

        const onValueChange = (handledValue?: number) => {
          setFocus(true);
          onChange(handledValue);
          handleChange?.(handledValue);
        };

        return (
          <Wrapper focus={focus} focused={focused} error={!!errorMessage}>
            <TitleWrapper>
              <Title>{title}</Title>
              {network && (
                <NetworkWrapper>
                  <NetworkImage src={NETWORK_IMAGE_MAPPER[network]} />
                  <NetworkName>{networkName}</NetworkName>
                </NetworkWrapper>
              )}
            </TitleWrapper>
            <ContentWrapper>
              <TokenInputWrapper>
                <TokenWrapper onClick={handleTokenClick}>{token}</TokenWrapper>
                <InputWrapper>
                  <NumericFormat
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    name={name}
                    allowLeadingZeros={false}
                    allowNegative={false}
                    placeholder={placeholder}
                    thousandSeparator
                    maxLength={16}
                    value={handledValue || ''}
                    onValueChange={values => onValueChange(values.floatValue)}
                    customInput={CustomInput}
                    inputMode="decimal"
                    onFocus={() => {
                      if (focus) {
                        setFocus(true);
                        blurAll?.(false);
                      }
                    }}
                    onBlur={() => {
                      onBlur();
                      setFocus(false);
                      blurAll?.(true);
                    }}
                    {...rest}
                  />
                </InputWrapper>
              </TokenInputWrapper>
              <BalanceOuterWrapper>
                <BalanceWrapper>
                  <BalanceLabel>{t('Balance')}</BalanceLabel>
                  <BalanceValue>{formatNumber(currentBalance ?? 0, 2, 'floor')}</BalanceValue>
                  {maxButton && (
                    <ButtonPrimarySmall
                      text={handledValue === currentBalance ? 'Maxed' : 'Max'}
                      onClick={() => {
                        onValueChange(currentBalance);
                        blurAll?.(false);
                      }}
                      style={{ width: 'auto' }}
                      disabled={handledValue === currentBalance}
                    />
                  )}
                  <TokenUSDValue>${formatNumber(tokenValue ?? 0, 2, 'floor')}</TokenUSDValue>
                </BalanceWrapper>
                {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
              </BalanceOuterWrapper>
            </ContentWrapper>
          </Wrapper>
        );
      }}
    />
  );
};

interface WrapperProps {
  focus?: boolean;
  focused?: boolean;
  error?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ focus, focused, error }) => [
  tw`w-full flex flex-col transition-colors bg-neutral-15 rounded-8 outline outline-1 outline-transparent`,
  focus && tw`hover:(outline-neutral-80)`,
  focused && tw`outline-primary-50 hover:(outline-primary-50)`,
  error && tw`outline-red-50 hover:(outline-red-50)`,
  error &&
    css`
      & input {
        color: ${COLOR.RED[50]};
      }
    `,
]);
const ContentWrapper = tw.div`
  flex flex-col gap-12 px-16 py-12
`;
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
  w-full flex flex-1 bg-transparent font-m-24 leading-30 px-0 border-none caret-primary-50 text-right
  text-neutral-100 placeholder-neutral-60
`;

const BalanceOuterWrapper = tw.div`
  flex flex-col gap-4
`;

const BalanceWrapper = tw.div`
  flex gap-6 h-28 text-neutral-80 font-r-14 items-center
`;
const BalanceLabel = tw.div`
  text-neutral-60
`;
const BalanceValue = tw.div`
  text-neutral-80 truncate max-w-120
`;
const TokenUSDValue = tw.div`
  text-neutral-80 flex-1 text-right
`;

const ErrorMessage = tw.div`
  w-full text-right font-r-14 text-red-50
`;

const TitleWrapper = tw.div`
  w-full flex justify-between items-center bg-neutral-20 px-16 py-12 rounded-t-8
`;
const Title = tw.div`
  text-neutral-80 font-m-14
`;
const NetworkWrapper = tw.div`flex gap-8`;
const NetworkImage = tw.img`
  w-24 h-24
`;
const NetworkName = tw.div`
  text-neutral-100 font-m-14
`;
