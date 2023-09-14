import { useRef, useState } from 'react';
import tw from 'twin.macro';
import * as yup from 'yup';

import { IconSetting } from '~/assets/icons';
import { Slippage } from '~/components/account-profile';
import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { InputNumber } from '~/components/inputs/number';
import { Token } from '~/components/token';
import { TOKEN_USD_MAPPER } from '~/constants';
import { useOnClickOutside } from '~/hooks/pages/use-onclick-outside';
import { usePopup } from '~/hooks/pages/use-popup';
import { HOOK_FORM_KEY, POPUP_ID, TokenInfo } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

import { AddLiquidityPopup } from '../add-liquidity-popup';

interface Props {
  tokenList: TokenInfo[];
}
export const AddLiquidityInput = ({ tokenList }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.ADD_LP);

  const priceImpact = 0.13; // TODO
  const [inputValue1, setInputValue1] = useState<number>(0);
  const [inputValue2, setInputValue2] = useState<number>(0);
  const [inputValue3, setInputValue3] = useState<number>(0);

  const getInputValue = (idx: number) => {
    if (idx === 0) return inputValue1;
    else if (idx === 1) return inputValue2;
    else if (idx === 2) return inputValue3;
    return 0;
  };

  const [opened, open] = useState(false);
  const toggle = () => open(!opened);

  useOnClickOutside([ref, iconRef], () => open(false));

  const handleMax = () => {
    // TODO
  };

  const handleChange = (idx: number, value: number | undefined) => {
    if (idx > 3) return; // TODO: for this version, only support 3 tokens

    if (idx === 0) setInputValue1(value ?? 0);
    else if (idx === 1) setInputValue2(value ?? 0);
    else if (idx === 2) setInputValue3(value ?? 0);
  };

  const totalValue = tokenList.reduce((sum, token, idx) => {
    const inputValue = getInputValue(idx) || 0;
    const tokenValue = TOKEN_USD_MAPPER[token.name] || 0;
    return sum + inputValue * tokenValue;
  }, 0);

  return (
    <Wrapper>
      <Header>
        <Title>Enter liquidity amount</Title>
        <IconWrapper onClick={toggle} ref={iconRef}>
          <IconSetting fill={opened ? '#F5FF83' : '#9296AD'} width={20} height={20} />
        </IconWrapper>
        {opened && (
          <SlippageWrapper ref={ref}>
            <Slippage shadow />
          </SlippageWrapper>
        )}
      </Header>
      <InnerWrapper>
        {tokenList &&
          tokenList.map((token, idx) => {
            const schema = yup.object({
              [HOOK_FORM_KEY.NUMBER_INPUT_VALUE]: yup
                .number()
                .min(0)
                .max(token.balance || 0, 'Exceeds wallet balance'),
            });
            return (
              // TODO: out of balance validation
              <InputNumber
                key={idx}
                schema={schema}
                token={<Token token={token.name as TOKEN} />}
                tokenName={token.name as TOKEN}
                balance={token.balance}
                value={getInputValue(idx)}
                handleChange={val => handleChange(idx, val)}
                slider={getInputValue(idx) > 0}
              />
            );
          })}
        <Total>
          <TotalInnerWrapper>
            <TotalText>Total</TotalText>
            <TotalValueWrapper>
              <TotalValue>{`$${formatNumber(totalValue, 2)}`}</TotalValue>
              <MaxButton onClick={() => handleMax()}>Max</MaxButton>
            </TotalValueWrapper>
          </TotalInnerWrapper>
          <PriceImpact>{`Price impact  ${formatNumber(priceImpact, 2)}%`}</PriceImpact>
        </Total>
      </InnerWrapper>
      <ButtonPrimaryLarge text="Preview" onClick={popupOpen} />
      {popupOpened && (
        <AddLiquidityPopup
          tokenList={tokenList.map((token, idx) => {
            return { name: token.name as TOKEN, amount: getInputValue(idx) };
          })}
          totalValue={totalValue}
          priceImpact={0.13}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 gap-24 px-24 py-20 rounded-12 w-452
`;

const Header = tw.div`
  flex justify-between items-center gap-10 w-full relative
`;

const SlippageWrapper = tw.div`
  absolute top-40 right-0
`;

const InnerWrapper = tw.div`
  flex flex-col gap-16
`;

const IconWrapper = tw.div`
  clickable w-32 h-32 items-center justify-center flex relative
`;

const Title = tw.div`
  text-neutral-100 font-b-16
`;

const Total = tw.div`
  flex flex-col bg-neutral-15 w-full gap-12 px-20 py-16 rounded-8
`;

const TotalInnerWrapper = tw.div`
  flex justify-between gap-8
`;

const TotalText = tw.div`
  text-neutral-100 font-r-18
`;

const TotalValueWrapper = tw.div`
  flex gap-8
`;

const TotalValue = tw.div`
  text-neutral-100 font-m-20
`;

const MaxButton = tw.div`
  bg-neutral-10 gap-6 px-12 py-5 rounded-8 text-primary-60 font-m-12 clickable
`;

const PriceImpact = tw.div`
  text-neutral-100 font-r-14 whitespace-pre-wrap
`;
