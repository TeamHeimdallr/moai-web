import { useEffect } from 'react';
import tw from 'twin.macro';

import { IconDown } from '~/assets/icons';
import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { InputNumber } from '~/components/inputs/number';
import { Token } from '~/components/token';
import { usePopup } from '~/hooks/pages/use-popup';
import { POPUP_ID } from '~/types/components';
import { TOKEN } from '~/types/contracts';

import { SwapArrowDown } from '../components/arrow-down';
import { PopupSwapSelectTokenFrom } from '../components/popup-select-token-from';
import { useSwap } from '../hooks/use-swap';

export const SwapInputs = () => {
  const {
    fromValue,
    fromToken,
    toToken,
    toValue,

    setFromValue,
    resetFromValue,

    fromTokenBalance,
    toTokenBalance,

    fromSchema,

    swapRatio,
    validToSwap,
  } = useSwap();

  const { opened: selectFromTokenPopupOpened, open: openSelectFromTokenPopup } = usePopup(
    POPUP_ID.SWAP_SELECT_TOKEN_FROM
  );

  useEffect(
    () => resetFromValue(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fromToken, toToken]
  );

  return (
    <>
      <Wrapper>
        <InputWrapper>
          <InputInnerWrapper>
            <InputNumber
              token={<Token token={fromToken as TOKEN} icon={<IconDown />} />}
              balance={fromTokenBalance}
              schema={fromSchema}
              value={fromValue}
              maxButton
              slider
              handleChange={setFromValue}
              handleTokenClick={openSelectFromTokenPopup}
            />
            <IconWrapper>
              <SwapArrowDown />
            </IconWrapper>
            <InputNumber
              disabled
              token={<Token token={toToken as TOKEN} icon={<IconDown />} />}
              balance={toTokenBalance}
              value={toValue}
              focus={false}
              handleTokenClick={() => console.log('token clicked')}
            />
          </InputInnerWrapper>
          <InputLabel>{`1 ${fromToken} = ${swapRatio} ${toToken}`}</InputLabel>
        </InputWrapper>
        <ButtonPrimaryLarge text="Preview" disabled={!validToSwap} />
      </Wrapper>
      {selectFromTokenPopupOpened && <PopupSwapSelectTokenFrom />}
    </>
  );
};

const Wrapper = tw.div`
   w-452 flex flex-col flex-shrink-0 rounded-12 bg-neutral-10 px-24 py-20 gap-24
`;

const InputWrapper = tw.div`
  flex flex-col gap-16
`;

const InputInnerWrapper = tw.div`
  flex flex-col gap-16 relative
`;

const IconWrapper = tw.div`
  absolute absolute-center-x bottom-100 z-1
`;

const InputLabel = tw.div`
  flex justify-end font-r-12 text-neutral-60
`;
