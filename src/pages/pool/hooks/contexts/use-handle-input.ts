import { FormState } from 'react-hook-form';
import { min, minBy } from 'lodash-es';
import { strip } from 'number-precision';

import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';

import { useNetwork } from '~/hooks/contexts/use-network';
import { IPool, IToken } from '~/types';

interface InputChange {
  token?: IToken; // for xrp
  value: number | undefined;
  idx: number;
}

interface InputFormState {
  input1: number;
  input2: number;
}

interface Props {
  pool: IPool;

  formState: FormState<InputFormState>;

  inputValues: number[];
  setInputValues: (value: number[]) => void;
}
export const useHandleInput = ({ pool, formState, inputValues, setInputValues }: Props) => {
  const { isXrp } = useNetwork();

  const { compositions } = pool || {};
  const { userPoolTokens, userPoolTokenTotalValue } = useUserPoolTokenBalances();

  /* evm add lp change handler */
  const handleChange = ({ idx, value }: InputChange) => {
    if (idx === 0) setInputValues([value || 0, inputValues[1]]);
    if (idx === 1) setInputValues([inputValues[0], value || 0]);
  };

  /*
   xrp add lp change handler - cannot add single token or amounts that can be break pool weight
   to make zero price impact, set value1:value2 to balanc1:balance2
  */
  const handleChangeAuto = ({ token, value, idx }: InputChange) => {
    if (!token) return;

    const changingPoolTokenBalance =
      compositions?.find(c => c.symbol === token.symbol)?.balance || 0;
    const remainPoolTokenBalance = compositions?.find(c => c.symbol !== token.symbol)?.balance || 0;

    const expectedRemainedTokenValue = changingPoolTokenBalance
      ? strip((remainPoolTokenBalance * (value || 0)) / changingPoolTokenBalance)
      : 0;

    const updateValue =
      idx === 0
        ? [value || 0, expectedRemainedTokenValue]
        : [expectedRemainedTokenValue, value || 0];
    setInputValues(updateValue);
  };

  const handleTotalMax = () => {
    setInputValues([userPoolTokens?.[0]?.balance || 0, userPoolTokens?.[1]?.balance || 0]);
    return;
  };

  const handleOptimize = (setMax?: boolean) => {
    const b1 = compositions?.[0]?.balance || 0;
    const b2 = compositions?.[1]?.balance || 0;

    const w1 = b1 + b1 ? b1 / (b1 + b2) : 0;
    const w2 = b1 + b2 ? b2 / (b1 + b2) : 0;

    // if pool weight 1:0 set second input to max
    if (w1 === 0) {
      setInputValues([0, userPoolTokens?.[1]?.balance || 0]);
      return;
    }
    // if pool weight 0:1 set first input to max
    if (w2 === 0) {
      setInputValues([userPoolTokens?.[0]?.balance || 0, 0]);
      return;
    }

    // all input zero, set first input to 1, second input to optimized
    if (inputValues.every(v => v === 0)) {
      if (setMax) {
        const firstInput = userPoolTokens?.[0]?.balance || 0;
        const secondInput = strip(1 * (w1 / w2));

        setInputValues([firstInput, secondInput]);
        return;
      }
      const firstInput = 1;
      const secondInput = strip(1 * (w1 / w2));

      setInputValues([firstInput, secondInput]);
      return;
    }

    // all input not zero, remain first input, change second input to optimized
    if (inputValues.every(v => v !== 0)) {
      const secondInput = strip(inputValues[0] * (w1 / w2));
      setInputValues([inputValues[0], secondInput]);

      return;
    }

    // input1 not zero, remain first input, change second input to optimized
    if (inputValues[0] !== 0 && inputValues[1] === 0) {
      const secondInput = strip(inputValues[0] * (w1 / w2));
      setInputValues([inputValues[0], secondInput]);

      return;
    }
    // input1 not zero, remain first input, change second input to optimized
    if (inputValues[0] === 0 && inputValues[1] !== 0) {
      const firstInput = strip(inputValues[1] * (w2 / w1));
      setInputValues([firstInput, inputValues[1]]);

      return;
    }

    return;
  };

  const isValid =
    userPoolTokens
      ?.filter(token => token.balance > 0)
      ?.map((token, i) => {
        const currentValue = inputValues[i];
        const isFormError = formState?.errors?.[`input${i + 1}`] !== undefined;

        if (isFormError) return false;
        return (token?.balance || 0) >= currentValue;
      })
      ?.every(v => v) || false;
  const isValidXrp =
    isValid &&
    userPoolTokens?.filter(token => token.balance > 0)?.length === userPoolTokens?.length;

  const totalValueMaxed =
    userPoolTokens.reduce((acc, _cur, i) => acc + (inputValues[i] || 0), 0) ===
    userPoolTokenTotalValue;

  const totalValueMaxedXrp =
    min(userPoolTokens.map((_, i) => inputValues[i])) === minBy(userPoolTokens, 'value')?.balance;

  return {
    handleOptimize,
    handleChange: isXrp ? handleChangeAuto : handleChange,
    handleTotalMax: isXrp ? () => handleOptimize(true) : handleTotalMax,
    isValid: isXrp ? isValidXrp : isValid,
    totalValueMaxed: isXrp ? totalValueMaxedXrp : totalValueMaxed,
  };
};
