import { useState } from 'react';

import { AddTokenXrpl } from './add-token-xrpl';
import { FilterTokenPopupXrpl } from './filter-token-popup-xrpl';

export const TokenPopupXrpl = () => {
  const [addToken, setAddToken] = useState(false);

  return addToken ? (
    <AddTokenXrpl showTokens={() => setAddToken(false)} />
  ) : (
    <FilterTokenPopupXrpl showAddToken={() => setAddToken(true)} />
  );
};
