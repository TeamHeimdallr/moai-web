import { useState } from 'react';
import tw from 'twin.macro';
import * as yup from 'yup';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { InputNumber } from '~/components/inputs/number';
import { Token } from '~/components/token';

import { usePopup } from '~/hooks/pages/use-popup';
import { formatNumber } from '~/utils/number';
import { POPUP_ID } from '~/types';

import { PoolInfo, TokenInfo } from '~/moai-evm/types/components';

import { TOKEN } from '~/moai-evm/types/contracts';

import { AddLiquidityPopup } from '../../components/popup/popup-add-liquidity';

interface Props {
  poolInfo: PoolInfo;
  tokens: TokenInfo[];
}
export const AddLiquidityInput = ({ tokens, poolInfo }: Props) => {
  // const ref = useRef<HTMLDivElement>(null);
  // const iconRef = useRef<HTMLDivElement>(null);

  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.ADD_LP);

  const priceImpact = 0.13; // TODO
  const [inputValue1, setInputValue1] = useState<number>(0);
  const [inputValue2, setInputValue2] = useState<number>(0);

  // TODO
  const getInputValue = (token: string) => {
    if (token === tokens[0]?.name) return inputValue1;
    if (token === tokens[1]?.name) return inputValue2;
    return 0;
  };

  // const [opened, open] = useState(false);
  // const toggle = () => open(!opened);

  // useOnClickOutside([ref, iconRef], () => open(false));

  const handleMax = () => {
    const criteria = tokens.reduce((max, cur) => (max.value < cur.value ? max : cur));

    const remainToken = tokens.filter(t => t.name !== criteria.name)?.[0];
    const remainTokenPrice = remainToken?.price ?? 0;
    const exceptedRemainToken = remainTokenPrice ? (criteria?.value ?? 0) / remainTokenPrice : 0;

    if (criteria.name === tokens[0]?.name) {
      setInputValue1(criteria.balance);
      setInputValue2(exceptedRemainToken);
    }
    if (criteria.name === tokens[1]?.name) {
      setInputValue1(exceptedRemainToken);
      setInputValue2(criteria.balance);
    }
  };

  const handleChange = (token: TokenInfo, value: number | undefined, idx: number) => {
    const remainTokenPrice = tokens.filter(t => t.name !== token.name)?.[0]?.price ?? 0;
    const currentTokenTotalValue = token?.value ?? 0;
    const exceptedRemainToken = remainTokenPrice ? currentTokenTotalValue / remainTokenPrice : 0;

    if (idx === 0) {
      setInputValue1(value ?? 0);
      setInputValue2(exceptedRemainToken ?? 0);
    }
    if (idx === 1) {
      setInputValue1(exceptedRemainToken ?? 0);
      setInputValue2(value ?? 0);
    }
  };

  const isValid =
    tokens
      ?.map(token => {
        const currentValue = getInputValue(token.name);

        if (currentValue === 0) return false;
        return token.balance >= currentValue;
      })
      ?.every(v => v) || false;

  const tokenInputValues =
    tokens?.map(token => ({
      name: token.name as TOKEN,
      amount: getInputValue(token.name),
    })) ?? [];

  const totalValue =
    tokens?.reduce((sum, token) => {
      const inputValue = getInputValue(token.name) || 0;
      const tokenValue = token?.value ?? 0;

      return sum + inputValue * tokenValue;
    }, 0) ?? 0;

  return (
    <Wrapper>
      <Header>
        <Title>Enter liquidity amount</Title>
        {/* <IconWrapper onClick={toggle} ref={iconRef}>
          <IconSetting fill={opened ? '#F5FF83' : '#9296AD'} width={20} height={20} />
        </IconWrapper>
        {opened && (
          <SlippageWrapper ref={ref}>
            <Slippage shadow />
          </SlippageWrapper>
        )} */}
      </Header>
      <InnerWrapper>
        {tokens &&
          tokens.map((token, idx) => {
            const schema = yup.object({
              NUMBER_INPUT_VALUE: yup
                .number()
                .min(0)
                .max(token.balance || 0, 'Exceeds wallet balance'),
            });
            return (
              <InputNumber
                key={idx}
                schema={schema}
                token={<Token token={token.name as TOKEN} />}
                tokenName={token.name as TOKEN}
                balance={token.balance}
                value={getInputValue(token.name)}
                handleChange={val => handleChange(token, val, idx)}
                slider={getInputValue(token.name) > 0}
              />
            );
          })}
        <Total>
          <TotalInnerWrapper>
            <TotalText>Total</TotalText>
            <TotalValueWrapper>
              <TotalValue>{`$${formatNumber(totalValue, 2)}`}</TotalValue>
              <MaxButton onClick={handleMax}>Max</MaxButton>
            </TotalValueWrapper>
          </TotalInnerWrapper>
          <PriceImpact>{`Price impact  ${formatNumber(priceImpact, 2)}%`}</PriceImpact>
        </Total>
      </InnerWrapper>
      <ButtonPrimaryLarge text="Preview" onClick={popupOpen} disabled={!isValid} />
      {popupOpened && (
        <AddLiquidityPopup
          poolInfo={poolInfo}
          tokenInputValues={tokenInputValues}
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

// const SlippageWrapper = tw.div`
//   absolute top-40 right-0
// `;

const InnerWrapper = tw.div`
  flex flex-col gap-16
`;

// const IconWrapper = tw.div`
//   clickable w-32 h-32 items-center justify-center flex relative
// `;

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
  bg-neutral-10 gap-6 px-12 py-5 rounded-8 text-primary-60 font-m-12 non-clickable
`;

const PriceImpact = tw.div`
  text-neutral-100 font-r-14 whitespace-pre-wrap
`;
