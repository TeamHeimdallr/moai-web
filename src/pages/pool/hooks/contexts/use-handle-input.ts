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

  getInputValue: (symbol: string) => number;

  setInputValue1: (value: number) => void;
  setInputValue2: (value: number) => void;
}
export const useHandleInput = ({
  pool,
  formState,
  getInputValue,
  setInputValue1,
  setInputValue2,
}: Props) => {
  const { isXrp } = useNetwork();

  const { compositions } = pool || {};
  const { userPoolTokens, userPoolTokenTotalValue } = useUserPoolTokenBalances();

  /* evm add lp change handler */
  const handleChange = ({ idx, value }: InputChange) => {
    if (idx === 0) setInputValue1(value || 0);
    else setInputValue2(value || 0);
  };

  /*
   xrp add lp change handler - cannot add single token or amounts that can be break pool weight
   to make zero price impact, set value1:value2 to balanc1:balance2
  */
  // TODO: fix input changed twice
  const handleChangeAuto = ({ token, value, idx }: InputChange) => {
    if (!token) return;

    const changingPoolTokenBalance =
      compositions?.find(c => c.symbol === token.symbol)?.balance || 0;
    const remainPoolTokenBalance = compositions?.find(c => c.symbol !== token.symbol)?.balance || 0;

    const expectedRemainedTokenValue = changingPoolTokenBalance
      ? strip((remainPoolTokenBalance * (value ?? 0)) / changingPoolTokenBalance)
      : 0;

    if (idx === 0) {
      setInputValue1(value || 0);
      setInputValue2(expectedRemainedTokenValue);
      return;
    }
    if (idx === 1) {
      setInputValue1(expectedRemainedTokenValue);
      setInputValue2(value || 0);
      return;
    }
  };

  const handleTotalMax = () => {
    setInputValue1(userPoolTokens?.[0]?.balance || 0);
    setInputValue2(userPoolTokens?.[1]?.balance || 0);
    return;
  };

  const handleOptimize = () => {
    const criteria = userPoolTokens?.reduce(
      (max, cur) => ((max?.value ?? 0) < (cur?.value ?? 0) ? max : cur),
      userPoolTokens?.[0] || {}
    );
    const idx = userPoolTokens?.findIndex(t => t.symbol === criteria.symbol);

    handleChangeAuto({ token: criteria, value: criteria.balance, idx });
  };

  const isValid =
    userPoolTokens
      ?.filter(token => token.balance > 0)
      ?.map((token, i) => {
        const currentValue = getInputValue(token.symbol);
        const isFormError = formState?.errors?.[`input${i + 1}`] !== undefined;

        if (isFormError) return false;
        return (token?.balance ?? 0) >= currentValue;
      })
      ?.every(v => v) || false;
  const isValidXrp =
    isValid &&
    userPoolTokens?.filter(token => token.balance > 0)?.length === userPoolTokens?.length;

  const totalValueMaxed =
    userPoolTokens.reduce((acc, cur) => acc + (getInputValue(cur.symbol) || 0), 0) ===
    userPoolTokenTotalValue;

  const totalValueMaxedXrp =
    min(userPoolTokens.map(t => getInputValue(t.symbol))) ===
    minBy(userPoolTokens, 'value')?.balance;

  return {
    handleOptimize,
    handleChange: isXrp ? handleChangeAuto : handleChange,
    handleTotalMax: isXrp ? handleOptimize : handleTotalMax,
    isValid: isXrp ? isValidXrp : isValid,
    totalValueMaxed: isXrp ? totalValueMaxedXrp : totalValueMaxed,
  };
};
