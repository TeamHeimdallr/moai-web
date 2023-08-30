import { yupResolver } from '@hookform/resolvers/yup';
import { InputHTMLAttributes, ReactNode, useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import ReactSlider from 'react-slider';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { ButtonPrimarySmall } from '~/components/buttons/primary';
import { TOKEN, TOKEN_PRICE_MAPPER } from '~/constants';
import { HOOK_FORM_KEY } from '~/types/components/inputs';
import { formatNumber } from '~/utils/number';

type OmitType = 'type' | 'value' | 'defaultValue' | 'onChange' | 'onBlur';
interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, OmitType> {
  balance?: number;
  handleChange?: (value?: number) => void;

  token?: ReactNode;
  handleTokenClick?: () => void;

  maxButton?: boolean;
  slider?: boolean;
  sliderActive?: boolean;

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
  maxButton,
  slider,
  sliderActive,
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
                {maxButton && (
                  <ButtonPrimarySmall text="Max" onClick={() => onValueChange(currentBalance)} />
                )}
                <TokenPriceValue>${formatNumber(tokenPrice ?? 0, 2)}</TokenPriceValue>
              </BalanceWrapper>
              {slider && (
                <SliderWrapper sliderActive={sliderActive} error={!!errorMessage}>
                  <ReactSlider
                    disabled={!sliderActive}
                    className="slider"
                    thumbClassName="thumb"
                    trackClassName="track"
                    min={0}
                    max={currentBalance}
                    value={value || 0}
                    step={0.01}
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
  focused?: boolean;
  error?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ focused, error }) => [
  tw`
    w-404 flex flex-col gap-12 pt-15 pb-11 pl-11 pr-19 transition-colors
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
  text-neutral-60
`;
const TokenPriceValue = tw.div`
  text-neutral-60 flex-1 text-right
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
