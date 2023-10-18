import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import tw from 'twin.macro';
import { Address } from 'wagmi';
import * as yup from 'yup';

import { useLiquidityPoolTokenAmount } from '~/api/api-contract/_evm/pool/get-liquidity-pool-balance';
import { useTokenBalanceInPool } from '~/api/api-contract/balance/get-token-balance-in-pool';
import { useTokenPrice } from '~/api/api-contract/token/price';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { Token } from '~/components/token';

import { usePopup } from '~/hooks/components';
import { formatFloat, formatNumber } from '~/utils';
import { IPool, IToken, POPUP_ID } from '~/types';

import { AddLiquidityPopup } from './add-liquidity-popup';

interface InputFormState {
  input1: number;
  input2: number;
}
interface Props {
  pool: IPool;
}
export const AddLiquidityInputGroup = ({ pool }: Props) => {
  // const ref = useRef<HTMLDivElement>(null);
  // const iconRef = useRef<HTMLDivElement>(null);

  const [inputValue1, setInputValue1] = useState<number>(0);
  const [inputValue2, setInputValue2] = useState<number>(0);

  const { opened: popupOpened, open: popupOpen } = usePopup(POPUP_ID.ADD_LP);

  const { balancesMap } = useTokenBalanceInPool();
  const { getTokenPrice } = useTokenPrice();
  const { compositions } = pool;

  const tokens: IToken[] = compositions?.map(composition => {
    const data = balancesMap?.[composition.symbol];

    if (!data) return { symbol: composition.symbol, balance: 0, price: 0, value: 0 };
    return {
      symbol: composition.symbol,
      balance: data.balance,
      price: getTokenPrice(composition.symbol),
      value: data.value,
    };
  });

  const schema = yup.object().shape({
    input1: yup
      .number()
      .min(0)
      .max(tokens?.[0]?.balance ?? 0, 'Exceeds wallet balance')
      .required(),
    input2: yup
      .number()
      .min(0)
      .max(tokens?.[1]?.balance ?? 0, 'Exceeds wallet balance')
      .required(),
  });
  const { control, setValue, formState } = useForm<InputFormState>({
    resolver: yupResolver(schema),
  });

  const { priceImpact: priceImpactRaw } = useLiquidityPoolTokenAmount({
    poolId: pool.id as Address,
    amountsIn: [inputValue1, inputValue2],
  });

  const priceImpact = priceImpactRaw < 0.01 ? '< 0.01' : formatNumber(priceImpactRaw, 2);

  const getInputValue = (token: string) => {
    if (token === tokens[0].symbol) return inputValue1;
    if (token === tokens[1].symbol) return inputValue2;
    return 0;
  };

  // const [opened, open] = useState(false);
  // const toggle = () => open(!opened);

  // useOnClickOutside([ref, iconRef], () => open(false));

  const handleMax = () => {
    const criteria = tokens.reduce((max, cur) =>
      (max?.value ?? 0) < (cur?.value ?? 0) ? max : cur
    );

    const remainToken = tokens.filter(t => t.symbol !== criteria.symbol)?.[0];
    const remainTokenPrice = remainToken?.price ?? 0;
    const expectedRemainToken = remainTokenPrice ? (criteria?.value ?? 0) / remainTokenPrice : 0;

    if (criteria.symbol === tokens[0]?.symbol) {
      setInputValue1(criteria?.balance ?? 0);
      setInputValue2(expectedRemainToken);
    }
    if (criteria.symbol === tokens[1]?.symbol) {
      setInputValue1(expectedRemainToken);
      setInputValue2(criteria?.balance ?? 0);
    }
  };

  const handleChange = (token: IToken, value: number | undefined, idx: number) => {
    const remainTokenPrice = tokens.filter(t => t.symbol !== token.symbol)?.[0]?.price ?? 0;
    const currentTokenTotalValue = Number(formatFloat((value || 0) * (token?.price || 0), 4));
    const expectedRemainToken = remainTokenPrice
      ? Number(formatFloat(currentTokenTotalValue / remainTokenPrice, 4))
      : 0;

    if (idx === 0) {
      setInputValue1(value ?? 0);
      setInputValue2(expectedRemainToken ?? 0);
    }
    if (idx === 1) {
      setInputValue1(expectedRemainToken ?? 0);
      setInputValue2(value ?? 0);
    }
  };

  const isValid =
    tokens
      ?.map((token, i) => {
        const currentValue = getInputValue(token.symbol);
        const isFormError = formState?.errors?.[`input${i + 1}`] !== undefined;

        if (currentValue === 0 || isFormError) return false;
        return (token?.balance ?? 0) >= currentValue;
      })
      ?.every(v => v) || false;

  const tokenInputs =
    tokens?.map(token => ({
      symbol: token.symbol,
      amount: getInputValue(token.symbol),
    })) ?? [];

  const totalValue =
    tokens?.reduce((sum, token) => {
      const inputValue = getInputValue(token.symbol) || 0;
      const tokenValue = token?.price ?? 0;

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
            const tokenValue = (token?.price || 0) * (getInputValue(token?.symbol) || 0);
            return (
              <InputNumber
                key={token.symbol + idx}
                token={<Token token={token.symbol} />}
                tokenName={token.symbol}
                tokenValue={tokenValue}
                balance={token.balance}
                value={getInputValue(token.symbol)}
                handleChange={val => handleChange(token, val, idx)}
                slider={getInputValue(token.symbol) > 0}
                name={`input${idx + 1}`}
                control={control}
                setValue={setValue}
                formState={formState}
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
          pool={pool}
          tokenInputs={tokenInputs}
          totalValue={totalValue}
          priceImpact={priceImpact}
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
