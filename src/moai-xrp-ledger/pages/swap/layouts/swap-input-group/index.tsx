import { useEffect } from 'react';
import tw from 'twin.macro';

import { IconDown } from '~/assets/icons';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { InputNumber } from '~/components/inputs/number';
import { Token } from '~/components/token';

import { usePopup } from '~/hooks/pages/use-popup';
import { formatNumber } from '~/utils/number';
import { POPUP_ID } from '~/types/components';

import { TOKEN } from '~/moai-xrp-root/types/contracts';

import { SwapArrowDown } from '../../components/arrow-down';
import { PopupSwapSelectTokenFrom } from '../../components/popup/popup-select-token-from';
import { PopupSwapSelectTokenTo } from '../../components/popup/popup-select-token-to';
import { PopupSwap } from '../../components/popup/popup-swap';
import { useSwapData } from '../../hooks/use-swap-data';

export const SwapInputs = () => {
  const {
    fromValue,
    fromToken,
    toToken,
    toValue,

    setFromToken,
    setToToken,

    setFromValue,
    setToValue,
    resetAll,

    fromTokenBalance,
    fromTokenPrice,
    toTokenBalance,
    toTokenPrice,

    fromSchema,
    toSchema,

    swapRatio,
    validToSwap,
  } = useSwapData();

  const { opened: selectTokenFromPopupOpened, open: openSelectTokenFromPopup } = usePopup(
    POPUP_ID.SWAP_SELECT_TOKEN_FROM
  );
  const { opened: selectTokenToPopupOpened, open: openSelectTokenToPopup } = usePopup(
    POPUP_ID.SWAP_SELECT_TOKEN_TO
  );
  const { opened: swapPopupOpened, open: openSwapPopup } = usePopup(POPUP_ID.SWAP);

  const arrowClick = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  useEffect(
    () => resetAll(),
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
              tokenValue={fromTokenPrice * (Number(fromValue) || 0)}
              schema={fromSchema}
              value={fromValue}
              maxButton
              slider
              handleChange={setFromValue}
              handleTokenClick={openSelectTokenFromPopup}
            />
            <IconWrapper onClick={() => arrowClick()}>
              <SwapArrowDown />
            </IconWrapper>
            <InputNumber
              token={<Token token={toToken as TOKEN} icon={<IconDown />} />}
              balance={toTokenBalance}
              tokenValue={toTokenPrice * (Number(toValue) || 0)}
              schema={toSchema}
              value={toValue}
              maxButton
              slider
              handleChange={setToValue}
              handleTokenClick={openSelectTokenToPopup}
            />
          </InputInnerWrapper>
          <InputLabel>{`1 ${fromToken} = ${formatNumber(swapRatio, 6)} ${toToken}`}</InputLabel>
        </InputWrapper>
        <ButtonPrimaryLarge text="Preview" disabled={!validToSwap} onClick={openSwapPopup} />
      </Wrapper>
      {selectTokenFromPopupOpened && <PopupSwapSelectTokenFrom />}
      {selectTokenToPopupOpened && <PopupSwapSelectTokenTo />}
      {swapPopupOpened && <PopupSwap />}
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
  absolute absolute-center-x bottom-118 z-1 clickable
`;

const InputLabel = tw.div`
  flex justify-end font-r-12 text-neutral-60
`;
