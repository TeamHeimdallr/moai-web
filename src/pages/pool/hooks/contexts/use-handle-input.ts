import { FormState } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { useLiquidityPoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useRequirePrarams } from '~/hooks/utils';
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
  myTokens: IToken[],
  setInputValue1: (value: number) => void,
  setInputValue2: (value: number) => void,
  getInputValue: (token: string) => number,
  formState: FormState<InputFormState>
) => {
  const { id } = useParams();
  const navigate = useNavigate();
  useRequirePrarams([!!id], () => navigate(-1));
  const { pool } = useLiquidityPoolBalance(id ?? '');
  const tokens = pool.compositions;

  const { isXrp } = useNetwork();
  const totalValue =
    myTokens?.reduce((sum, token) => {
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
    setInputValue1(myTokens?.[0]?.balance ?? 0);
    setInputValue2(myTokens?.[1]?.balance ?? 0);
    return;
  };

  const isValid =
    myTokens
      ?.filter(token => token.balance)
      ?.map((token, i) => {
        const currentValue = getInputValue(token.symbol);
        const isFormError = formState?.errors?.[`input${i + 1}`] !== undefined;

        if (isFormError) return false;
        return (token?.balance ?? 0) >= currentValue;
      })
      ?.every(v => v) || false;

  const totalValueMaxed = myTokens.reduce((acc, cur) => acc + (cur?.value ?? 0), 0) === totalValue;

  const handleChangeAuto = (data: Input) => {
    const { token, value, idx } = data;
    if (!token) return;
    const currnetToken = tokens.filter(t => t.symbol === token.symbol)?.[0];
    const remainedToken = tokens.filter(t => t.symbol !== token.symbol)?.[0];
    const expectedRemainedTokenValue =
      ((remainedToken?.balance ?? 0) * (value ?? 0)) / (currnetToken?.balance ?? 0 ?? 0);
    if (idx === 0) {
      setInputValue1(value ?? 0);
      setInputValue2(expectedRemainedTokenValue ?? 0);
    }
    if (idx === 1) {
      setInputValue1(expectedRemainedTokenValue ?? 0);
      setInputValue2(value ?? 0);
    }
  };
  const handleOptimize = () => {
    const criteria = myTokens.reduce((max, cur) =>
      (max?.value ?? 0) < (cur?.value ?? 0) ? max : cur
    );
    const idx = myTokens.indexOf(criteria);
    handleChangeAuto({ token: criteria, value: criteria.balance, idx });
  };

  const isValidXrp =
    myTokens?.filter(token => token.balance)?.length === myTokens?.length && isValid;

  const totalValueMaxedXrp =
    (myTokens.reduce(
      (max, cur) => ((max?.value ?? 0) < (cur?.value ?? 0) ? max : cur),
      myTokens?.[0] ?? {}
    )?.value ?? 0) *
      2 ===
    totalValue;

  return {
    handleOptimize,
    handleChange: isXrp ? handleChangeAuto : handleChange,
    handleTotalMax: isXrp ? handleOptimize : handleTotalMax,
    isValid: isXrp ? isValidXrp : isValid,
    totalValueMaxed: isXrp ? totalValueMaxedXrp : totalValueMaxed,
  };
};
