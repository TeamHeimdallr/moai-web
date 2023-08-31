import { useState } from 'react';
import tw from 'twin.macro';

import { IconDown } from '~/assets/icons';
import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { InputNumber } from '~/components/inputs/number';
import { Token } from '~/components/token';
import { TOKEN } from '~/types/contracts';

import { SwapArrowDown } from '../components/arrow-down';
import { useSwap } from '../hooks/use-swap';

export const SwapInputs = () => {
  const {
    fromToken,
    toToken,
    toValue,

    setFromValue,

    fromTokenBalance,
    toTokenBalance,

    fromSchema,

    swapRatio,
    validToSwap,
  } = useSwap();

  return (
    <Wrapper>
      <InputWrapper>
        <InputInnerWrapper>
          <InputNumber
            token={<Token token={fromToken as TOKEN} icon={<IconDown />} />}
            balance={fromTokenBalance}
            schema={fromSchema}
            maxButton
            slider
            handleChange={setFromValue}
            handleTokenClick={() => console.log('token clicked')}
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
