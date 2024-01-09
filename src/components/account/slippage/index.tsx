import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AutosizeInput from 'react-input-autosize';
import tw, { css, styled } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { COLOR } from '~/assets/colors';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useSlippageStore } from '~/states/data/slippage';

interface Props {
  shadow?: boolean;
}

const SLIPPAGE_PRESET = [0.5, 1, 2];
export const Slippage = ({ shadow }: Props) => {
  const { gaAction } = useGAAction();
  const manualSlippageRef = useRef<HTMLDivElement>(null);

  const [inputFocus, setInputFocus] = useState(false);

  const { t } = useTranslation();
  const { manual, slippage, setManualSlippage, setSlippage } = useSlippageStore();
  useOnClickOutside(manualSlippageRef, () => setInputFocus(false));

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value as number | string;
    const numValue = Number(value);

    if (numValue && numValue > 100) return;
    if (numValue && numValue < 0) return;

    if (!(typeof value === 'string' && value === '')) {
      gaAction({
        action: 'set-slippage',
        data: { component: 'slippage-input', text: `${numValue}%` },
      });
      setManualSlippage(numValue);
      return;
    }
    setManualSlippage(value);
  };

  useEffect(() => {
    if (!inputFocus && typeof slippage === 'string' && slippage === '') {
      setSlippage(0.5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slippage, inputFocus]);

  return (
    <SlippageWrapper shadow={shadow}>
      <SlippageInnerWarpper>
        <SlippageText>{t('Slippage tolerance')}</SlippageText>
        <SlippageOptions>
          {SLIPPAGE_PRESET.map((value, idx) => (
            <SlippageOption
              key={`${value}-${idx}`}
              selected={!manual && slippage === value}
              onClick={() => {
                gaAction({
                  action: 'set-slippage',
                  data: { component: 'slippage', text: `${value}%` },
                });
                setSlippage(value);
              }}
            >
              {`${value.toFixed(1)}%`}
            </SlippageOption>
          ))}
          {inputFocus || (manual && slippage) ? (
            <SlippageOption
              onClick={() => setInputFocus(true)}
              ref={manualSlippageRef}
              selected={!inputFocus && manual && !!slippage}
            >
              <SlippageInputWrapper>
                <AutosizeInput
                  name="slippage"
                  autoFocus
                  type="number"
                  inputMode="numeric"
                  placeholder="0.00"
                  extraWidth={0}
                  value={slippage}
                  onChange={handleInputChange}
                  min={0}
                  max={100}
                />
                %
              </SlippageInputWrapper>
            </SlippageOption>
          ) : (
            <SlippageOption onClick={() => setInputFocus(true)}>
              {t('or enter manually')}
            </SlippageOption>
          )}
        </SlippageOptions>
      </SlippageInnerWarpper>
    </SlippageWrapper>
  );
};

interface SlippageWrapperProps {
  shadow?: boolean;
}
const SlippageWrapper = styled.div<SlippageWrapperProps>(({ shadow }) => [
  tw`gap-20 px-16 py-12 bg-neutral-15 w-290`,
  shadow && tw`box-shadow-default rounded-8`,
]);

const SlippageInnerWarpper = tw.div`
  flex flex-col gap-12 max-w-230
`;

const SlippageText = tw.div`
  text-neutral-100 font-m-16
`;

const SlippageOptions = tw.div`
  flex gap-8 w-full flex-wrap
`;

interface SlippageOptionProps {
  selected?: boolean;
  disabled?: boolean;
}
const SlippageOption = styled.div<SlippageOptionProps>(({ selected, disabled }) => [
  tw`gap-10 px-16 py-6 bg-transparent border-solid rounded-8 text-neutral-60 font-r-16 border-1 border-neutral-60 clickable`,
  !disabled && selected
    ? tw`text-primary-50 border-primary-50 gradient-chip`
    : tw`hover:bg-neutral-20 hover:text-neutral-60 border-neutral-80`,
  disabled && tw`non-clickable`,
]);

const SlippageInputWrapper = styled.div(() => [
  tw`
    font-r-16 text-primary-50 flex-center gap-2
  `,
  css`
    & input {
      padding: 0;
      border: 0;
      outlint: 0;

      background: transparent;
      width: 32px;

      font-family: Pretendard Variable;
      font-size: 16px;
      font-weight: 400;
      line-height: 24px;

      display: flex;
      align-items: center;
      justify-content: center;

      color: ${COLOR.PRIMARY[50]};

      &:placeholder {
        color: ${COLOR.NEUTRAL[70]};
      }
    }
  `,
]);
