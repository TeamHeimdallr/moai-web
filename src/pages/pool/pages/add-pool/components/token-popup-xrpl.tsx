import { useState } from 'react';

import { AddTokenXrpl as AddToken1Xrpl } from './add-token1-xrpl';
import { AddTokenXrpl as AddToken2Xrpl } from './add-token2-xrpl';
import { SelectToken1PopupXrpl } from './select-token1-popup-xrpl';
import { SelectToken2PopupXrpl } from './select-token2-popup-xrpl';

export const TokenPopup1Xrpl = () => {
  const [addToken, setAddToken] = useState(false);

  return addToken ? (
    <AddToken1Xrpl showTokens={() => setAddToken(false)} />
  ) : (
    <SelectToken1PopupXrpl showAddToken={() => setAddToken(true)} />
  );
};

export const TokenPopup2Xrpl = () => {
  const [addToken, setAddToken] = useState(false);

  return addToken ? (
    <AddToken2Xrpl showTokens={() => setAddToken(false)} />
  ) : (
    <SelectToken2PopupXrpl showAddToken={() => setAddToken(true)} />
  );
};
