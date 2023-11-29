/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputHTMLAttributes, ReactNode, useCallback, useEffect, useState } from 'react';
import { Control, Controller, FormState, UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import ReactSlider from 'react-slider';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';

import { ButtonPrimarySmall } from '~/components/buttons/primary';

import { formatNumber } from '~/utils';

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
}

export const InputNumber = ({
  token,
  tokenValue: defaultTokenValue,
  balance,
  placeholder = '0',
  maxButton,
  slider,
  sliderActive,
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

        const decimal = currentBalance?.toString()?.split('.')?.[1] || '';
        const length = Math.min(decimal ? decimal.length - 1 : 0, 14);

        const flooredBalance =
          length === 0 ? currentBalance : Math.floor(currentBalance * 10 ** length) / 10 ** length;
        const flooredBalanceForSlider =
          length === 0 ? currentBalance : Math.floor(currentBalance * 10 ** 4) / 10 ** 4;

        return (
          <Wrapper focus={focus} focused={focused} error={!!errorMessage}>
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
                      onValueChange(flooredBalance);
                      blurAll?.(false);
                    }}
                    style={{ width: 'auto' }}
                    disabled={handledValue === currentBalance}
                  />
                )}
                <TokenUSDValue>${formatNumber(tokenValue ?? 0, 2, 'floor')}</TokenUSDValue>
              </BalanceWrapper>
              {slider && (
                <SliderWrapper sliderActive={sliderActive} error={!!errorMessage}>
                  <ReactSlider
                    disabled={!sliderActive}
                    className="slider"
                    thumbClassName="thumb"
                    trackClassName="track"
                    min={0}
                    max={flooredBalanceForSlider || 100}
                    value={handledValue || 0}
                    step={0.00001}
                    onChange={onValueChange}
                    renderThumb={({ key, ...props }) => (
                      <div className={sliderActive ? 'thumb' : ''} key={key} {...props} />
                    )}
                  />
                </SliderWrapper>
              )}
              {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            </BalanceOuterWrapper>
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
  tw`w-full flex flex-col gap-12 transition-colors border-transparent border-solid pt-15 pb-11 pl-15 pr-15 bg-neutral-15 rounded-8 border-1`,
  focus && tw`hover:(border-neutral-80)`,
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

interface SliderWrapperProps {
  sliderActive?: boolean;
  error?: boolean;
}
const SliderWrapper = styled.div<SliderWrapperProps>(({ sliderActive, error }) => [
  tw`flex items-center w-full h-16`,
  css`
    & .slider {
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background-color: ${COLOR.NEUTRAL[30]};

      & .track {
        height: 100%;
      }

      & .track.track-0 {
        background-color: ${COLOR.GREEN[50]};
        border-radius: 2px;

        transition-property: left, right;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
      }

      & .thumb {
        transition-property: left, right;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
      }
    }
  `,
  sliderActive &&
    css`
      & .slider {
        & .track.track-0 {
          background-color: ${COLOR.PRIMARY[50]};
          border-radius: 2px;

          transition: none;
        }

        & .thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: ${COLOR.NEUTRAL[100]};
          transform: translate(1px, -6px);

          transition: none;
        }
      }
    `,

  error &&
    css`
      & .slider {
        & .track.track-0 {
          background-color: ${COLOR.RED[50]};
          border-radius: 2px;

          transition: none;
        }

        & .thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: ${COLOR.NEUTRAL[100]};
          transform: translate(1px, -6px);

          transition: none;
        }
      }
    `,
  !sliderActive &&
    error &&
    css`
      & .slider .thumb {
        display: none;
      }
    `,
]);
