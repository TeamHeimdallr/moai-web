import { FormState } from 'react-hook-form';

import { useTokenPrice } from '~/api/api-contract/token/price';

import { useNetwork } from '~/hooks/contexts/use-network';
import { IToken } from '~/types';

interface Input {
  token?: IToken;
  value: number | undefined;
  idx: number;
}

interface InputFormState {
  input1: number;
  input2: number;
}

export const useHandleInput = (
  tokens: IToken[],
  setInputValue1: (value: number) => void,
  setInputValue2: (value: number) => void,
  getInputValue: (token: string) => number,
  formState: FormState<InputFormState>
) => {
  const { isXrp } = useNetwork();
  const { getTokenPrice } = useTokenPrice();
  const totalValue =
    tokens?.reduce((sum, token) => {
      const inputValue = getInputValue(token.symbol) || 0;
      const tokenPrice = token?.price ?? 0;

      return sum + inputValue * tokenPrice;
    }, 0) ?? 0;

  const handleChange = (data: Input) => {
    const { value, idx } = data;
    if (idx === 0) setInputValue1(value ?? 0);
    else setInputValue2(value ?? 0);
  };

  const handleTotalMax = () => {
    setInputValue1(tokens?.[0]?.balance ?? 0);
    setInputValue2(tokens?.[1]?.balance ?? 0);
    return;
  };

  const isValid =
    tokens
      ?.filter(token => token.balance)
      ?.map((token, i) => {
        const currentValue = getInputValue(token.symbol);
        const isFormError = formState?.errors?.[`input${i + 1}`] !== undefined;

        if (isFormError) return false;
        return (token?.balance ?? 0) >= currentValue;
      })
      ?.every(v => v) || false;

  const totalValueMaxed = tokens.reduce((acc, cur) => acc + (cur?.value ?? 0), 0) === totalValue;

  const handleChangeAuto = (data: Input) => {
    const { token, value, idx } = data;
    if (!token) return;
    const remainTokenPrice =
      getTokenPrice(tokens.filter(t => t.symbol !== token.symbol)?.[0]?.symbol) ?? 0;
    const currentTokenTotalValue = (value || 0) * (getTokenPrice(token.symbol) || 0);
    const expectedRemainToken = remainTokenPrice ? currentTokenTotalValue / remainTokenPrice : 0;
    if (idx === 0) {
      setInputValue1(value ?? 0);
      setInputValue2(expectedRemainToken ?? 0);
    }
    if (idx === 1) {
      setInputValue1(expectedRemainToken ?? 0);
      setInputValue2(value ?? 0);
    }
  };
  const handleTotalMaxAuto = () => {
    const criteria = tokens.reduce((max, cur) =>
      (max?.value ?? 0) < (cur?.value ?? 0) ? max : cur
    );
    const idx = tokens.indexOf(criteria);
    handleChangeAuto({ token: criteria, value: criteria.balance, idx });
  };

  const isValidXrp = tokens?.filter(token => token.balance)?.length === tokens?.length && isValid;

  const totalValueMaxedXrp =
    (tokens.reduce(
      (max, cur) => ((max?.value ?? 0) < (cur?.value ?? 0) ? max : cur),
      tokens?.[0] ?? {}
    )?.value ?? 0) *
      2 ===
    totalValue;

  return {
    handleTotalMaxAuto,
    handleChange: isXrp ? handleChangeAuto : handleChange,
    handleTotalMax: isXrp ? handleTotalMaxAuto : handleTotalMax,
    isValid: isXrp ? isValidXrp : isValid,
    totalValueMaxed: isXrp ? totalValueMaxedXrp : totalValueMaxed,
  };
};
