import { useState } from 'react';
import tw from 'twin.macro';

import { IconSetting } from '~/assets/icons';
import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { InputNumber } from '~/components/inputs/number';
import { Token } from '~/components/token';
import { TOKEN, TOKEN_USD_MAPPER } from '~/constants';
import { formatNumber } from '~/utils/number';

interface TokenInfo {
  name: TOKEN;
  balance: number;
}
interface Props {
  tokenList: TokenInfo[];
}
export const AddLpInput = ({ tokenList }: Props) => {
  const priceImpact = 0.13; // TODO
  const [inputValue1, setInputValue1] = useState<number>(0);
  const [inputValue2, setInputValue2] = useState<number>(0);
  const [inputValue3, setInputValue3] = useState<number>(0);

  const handleSetting = () => {
    // TODO
  };

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
      <Header>
        <Title>Enter liquidity amount</Title>
        <IconWrapper onClick={() => handleSetting()}>
          <IconSetting fill="#9296AD" width={20} height={20} />
        </IconWrapper>
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
  clickable w-32 h-32
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
