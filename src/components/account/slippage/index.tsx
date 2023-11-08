import { useTranslation } from 'react-i18next';
import tw, { styled } from 'twin.macro';

import { useSlippageStore } from '~/states/data/slippage';

interface Props {
  shadow?: boolean;
}

export const Slippage = ({ shadow }: Props) => {
  const { slippage, setSlippage } = useSlippageStore();
  const preset = [0.5, 1, 2];

  const { t } = useTranslation();

  return (
    <SlippageWrapper shadow={shadow}>
      <SlippageInnerWarpper>
        <SlippageText>{t('Slippage tolerance')}</SlippageText>
        <SlippageOptions>
          {preset.map((value, idx) => (
            <SlippageOption
              key={`${value}-${idx}`}
              selected={slippage === value}
              onClick={() => setSlippage(value)}
            >
              {`${value.toFixed(1)}%`}
            </SlippageOption>
          ))}
          {/* TODO: manually input handling */}
          <SlippageOption disabled={true}>{t('or enter manually')}</SlippageOption>
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
