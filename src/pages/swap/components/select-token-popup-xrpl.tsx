import { useState } from 'react';

import { IToken } from '~/types';

import { AddTokenXrpl } from './add-token-xrpl';
import { SelectFromTokenPopupXrpl } from './select-token-from-popup-xrpl';
import { SelectToTokenPopupXrpl } from './select-token-to-popup-xrpl';

interface Props {
  type: 'from' | 'to';

  userAllTokenBalances: (IToken & { balance: number })[];

  hasNextPage?: boolean;
  fetchNextPage?: () => void;
}
export const SelectTokenPopupXrpl = ({
  type,
  userAllTokenBalances,
  hasNextPage,
  fetchNextPage,
}: Props) => {
  const [addToken, setAddToken] = useState(false);

  if (type === 'from')
    return addToken ? (
      <AddTokenXrpl type={'from'} showTokens={() => setAddToken(false)} />
    ) : (
      <SelectFromTokenPopupXrpl
        userAllTokenBalances={userAllTokenBalances}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        showAddToken={() => setAddToken(true)}
      />
    );
  return addToken ? (
    <AddTokenXrpl type={'to'} showTokens={() => setAddToken(false)} />
  ) : (
    <SelectToTokenPopupXrpl
      userAllTokenBalances={userAllTokenBalances}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      showAddToken={() => setAddToken(true)}
    />
  );
};
