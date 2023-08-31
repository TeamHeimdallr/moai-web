import { useRef, useState } from 'react';
import tw, { styled } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { IconSetting } from '~/assets/icons';
import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { InputNumber } from '~/components/inputs/number';
import { Token } from '~/components/token';
import { TOKEN_USD_MAPPER } from '~/constants';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

interface TokenInfo {
  name: TOKEN;
  balance: number;
}
interface Props {
  tokenList: TokenInfo[];
}
export const AddLpInput = ({ tokenList }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [slippage, setSlippage] = useState(1);

  const priceImpact = 0.13; // TODO
  const [inputValue1, setInputValue1] = useState<number>(0);
  const [inputValue2, setInputValue2] = useState<number>(0);
  const [inputValue3, setInputValue3] = useState<number>(0);

  const [opened, open] = useState(false);
  const toggle = () => open(!opened);

  useOnClickOutside(ref, () => open(false));

  const handleMax = () => {
    // TODO
  };

  const handleChange = (idx: number, value: number | undefined) => {
    if (idx > 3) return; // TODO: for this version, only support 3 tokens

    if (idx === 0) setInputValue1(value ?? 0);
    else if (idx === 1) setInputValue2(value ?? 0);
    else if (idx === 2) setInputValue3(value ?? 0);
  };

  return (
    <Wrapper>
      <Header ref={ref}>
        <Title>Enter liquidity amount</Title>
        <IconWrapper onClick={toggle}>
          <IconSetting fill={opened ? '#F5FF83' : '#9296AD'} width={20} height={20} />
        </IconWrapper>
        {opened && (
          <SlippageWrapper>
            <SlippageInnerWarpper>
              <SlippageText>Slippage tolerance</SlippageText>
              <SlippageOptions>
                <SlippageOption selected={slippage === 0} onClick={() => setSlippage(0)}>
                  {'0.5%'}
                </SlippageOption>
                <SlippageOption selected={slippage === 1} onClick={() => setSlippage(1)}>
                  {'1.0%'}
                </SlippageOption>
                <SlippageOption selected={slippage === 2} onClick={() => setSlippage(2)}>
                  {'2.0%'}
                </SlippageOption>
                <SlippageOption selected={slippage === 3} disabled={true}>
                  {'or enter manually'}
                </SlippageOption>
              </SlippageOptions>
            </SlippageInnerWarpper>
          </SlippageWrapper>
        )}
      </Header>
      <InnerWrapper>
        {tokenList &&
          tokenList.map((token, idx) => (
            <InputNumber
              key={idx}
              token={<Token token={token.name} />}
              tokenName={token.name}
              balance={token.balance}
              handleChange={val => handleChange(idx, val)}
            />
          ))}
        <Total>
          <TotalInnerWrapper>
            <TotalText>Total</TotalText>
            <TotalValueWrapper>
              <TotalValue>{`$${formatNumber(
                (tokenList.length > 0
                  ? (inputValue1 || 0) * TOKEN_USD_MAPPER[tokenList[0].name]
                  : 0) +
                  (tokenList.length > 1
                    ? (inputValue2 || 0) * TOKEN_USD_MAPPER[tokenList[1].name]
                    : 0) +
                  (tokenList.length > 2
                    ? (inputValue3 || 0) * TOKEN_USD_MAPPER[tokenList[2].name]
                    : 0),
                2
              )}`}</TotalValue>
              <MaxButton onClick={() => handleMax()}>Max</MaxButton>
            </TotalValueWrapper>
          </TotalInnerWrapper>
          <PriceImpact>{`Price impact  ${formatNumber(priceImpact, 2)}%`}</PriceImpact>
        </Total>
      </InnerWrapper>
      <ButtonPrimaryLarge text="Preview" />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col bg-neutral-10 gap-24 px-24 py-20 rounded-12 w-452
`;

const Header = tw.div`
  flex justify-between gap-10 w-full
`;

const InnerWrapper = tw.div`
  flex flex-col gap-16
`;

const IconWrapper = tw.div`
  clickable w-32 h-32 items-center justify-center flex
`;

const SlippageWrapper = tw.div`
  gap-12 bg-neutral-15 rounded-8 box-shadow-default px-16 py-12 max-w-294 absolute top-60 right-24
`;

const SlippageInnerWarpper = tw.div`
  flex flex-col gap-12
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
  tw`
  gap-10 px-16 py-6 rounded-8 bg-transparent text-neutral-60 font-r-16 border-solid border-1 border-neutral-60 clickable
`,
  !disabled && selected
    ? tw`text-primary-50 border-primary-50 gradient-chip`
    : tw`hover:bg-neutral-20 hover:text-neutral-60 border-neutral-80`,
  disabled && tw`non-clickable`,
]);

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
