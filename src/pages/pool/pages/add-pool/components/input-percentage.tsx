import {
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';

import { formatComma } from '~/utils';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'css'> {
  name: string;

  label?: ReactNode;

  unit?: string;
  maxDecimals?: number;

  error?: boolean;
  errorMessage?: string;
}

export const InputPercentage = ({
  name,

  label,

  defaultValue = '',

  unit,

  error,
  errorMessage,
  maxDecimals = 3,

  style,
  ...rest
}: Props) => {
  const { control, setValue } = useFormContext();
  const inputId = useId();
  const { t } = useTranslation();

  const { ref: wrapperRef, handleFocus, handleBlur } = useInputOutline({ inputId, error });

  useEffect(() => {
    if (defaultValue !== '') {
      setValue(name, defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, name]);

  return (
    <Controller
      name={name}
      control={control}
      render={formProps => {
        const { field } = formProps;
        const { onChange, onBlur, value } = field;

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value || '';
          if (value.split('.') && value.split('.')[1]?.length > maxDecimals) return;

          const commaFormatted = formatComma(value);
          onChange(commaFormatted);
        };

        return (
          <Wrapper ref={wrapperRef} htmlFor={inputId} error={error} style={style}>
            <TopWrapper>
              <LabelWrapper>{label}</LabelWrapper>

              <Input
                id={inputId}
                error={error}
                value={value || defaultValue} // Prevent https://reactjs.org/link/controlled-components
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={() => {
                  handleBlur();
                  onBlur();
                }}
                {...rest}
              />

              <Unit>{unit || '%'}</Unit>
            </TopWrapper>
            {error && <ErrorWrapper>{t(errorMessage || '')}</ErrorWrapper>}
          </Wrapper>
        );
      }}
    />
  );
};

interface WrapperProps {
  error?: boolean;
}
const Wrapper = styled.label<WrapperProps>(({ error }) => [
  tw`
    w-407 flex flex-col rounded-8 outline-none outline-1 -outline-offset-1 transition-all overflow-hidden
    p-16 gap-12 bg-neutral-15

    hover:(outline outline-neutral-80)
  `,
  error && tw`hover:(outline-red-50)`,
]);

const TopWrapper = tw.div`
  flex gap-8 items-center
`;

const LabelWrapper = tw.div`
  flex-shrink-0
`;

interface InputProps {
  error?: boolean;
}
const Input = styled.input<InputProps>(({ error }) => [
  tw`
    border-none outline-none bg-transparent w-full h-32 p-0
    text-right font-m-24 text-neutral-100 placeholder-neutral-60 caret-primary-50 
  `,
  error && tw`text-red-50 caret-red-50`,
]);

const ErrorWrapper = tw.div`
  w-full text-right font-r-14 text-red-50
`;

const Unit = tw.div`
  font-m-24 text-neutral-100
`;

interface OutlineProps {
  inputId: string;
  error?: boolean;
}
const useInputOutline = ({ inputId, error }: OutlineProps) => {
  const wrapperRef = useRef<HTMLLabelElement>(null);

  const handleWrapperOutline = useCallback((type: 'focus' | 'blur' | 'error') => {
    if (!wrapperRef.current) return;

    if (type === 'focus') {
      wrapperRef.current.style.outlineStyle = 'solid';
      wrapperRef.current.style.outlineColor = COLOR.PRIMARY[50];
    }
    if (type === 'blur') {
      wrapperRef.current.style.outlineStyle = '';
      wrapperRef.current.style.outlineColor = '';
    }
    if (type === 'error') {
      wrapperRef.current.style.outlineStyle = 'solid';
      wrapperRef.current.style.outlineColor = COLOR.RED[50];
    }
  }, []);

  const handleFocus = useCallback(() => {
    handleWrapperOutline(error ? 'error' : 'focus');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleBlur = useCallback(() => {
    handleWrapperOutline(error ? 'error' : 'blur');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    const isActive = document.activeElement?.id === inputId;

    handleWrapperOutline(error ? 'error' : isActive ? 'focus' : 'blur');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, inputId]);

  return {
    ref: wrapperRef,
    handleFocus,
    handleBlur,
  };
};
