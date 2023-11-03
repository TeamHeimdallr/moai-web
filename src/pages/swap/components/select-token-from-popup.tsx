import tw from 'twin.macro';

import { useTokenBalanceInPool } from '~/api/api-contract/balance/get-token-balance-in-pool';

import { COLOR } from '~/assets/colors';

import { TOKEN_IMAGE_MAPPER } from '~/constants';

import { Popup } from '~/components/popup';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { formatNumber } from '~/utils';
import { useSwapStore } from '~/states/pages';
import { POPUP_ID } from '~/types';

export const SelectFromTokenPopup = () => {
  const { balancesArray } = useTokenBalanceInPool();

  const { toToken, fromToken, setFromToken } = useSwapStore();
  const { close } = usePopup(POPUP_ID.SWAP_SELECT_TOKEN_FROM);

  return (
    <Popup
      id={POPUP_ID.SWAP_SELECT_TOKEN_FROM}
      title="Select token"
      style={{ backgroundColor: COLOR.NEUTRAL[10] }}
    >
      <Wrapper>
        <Tokens>
          {balancesArray
            ?.filter(t => (t.balance ?? 0) > 0)
            ?.filter(t => t.symbol !== toToken)
            .map(token => {
              const handleClick = () => {
                setFromToken(token.symbol ?? '');
                close();
              };
              return <Token key={token.symbol} token={token.symbol} onClick={handleClick} />;
            })}
        </Tokens>
        <TokenLists>
          {balancesArray
            ?.filter(t => (t.balance ?? 0) > 0)
            ?.filter(t => t.symbol !== toToken)
            ?.map((balanceInfo, idx) => {
              if (!balanceInfo) return <></>;

              const { symbol, value, balance } = balanceInfo;
              const formattedTokenBalance =
                (balance ?? 0) > 0 ? formatNumber(balance, 2) : undefined;
              const formattedTokenValue =
                (value ?? 0) > 0 ? '$' + formatNumber(value, 2) : undefined;

              const handleClick = () => {
                setFromToken(symbol ?? '');
                close();
              };
              return (
                <TokenList
                  key={symbol + idx}
                  title={symbol}
                  image={TOKEN_IMAGE_MAPPER[symbol] ?? ''}
                  type={'selectable'}
                  balance={formattedTokenBalance}
                  value={formattedTokenValue}
                  selected={fromToken === (symbol ?? '')}
                  onClick={handleClick}
                  backgroundColor={COLOR.NEUTRAL[15]}
                />
              );
            })}
        </TokenLists>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  px-16 flex flex-col gap-24 scroll
`;
const TokenLists = tw.div`flex flex-col gap-8`;
const Tokens = tw.div`flex gap-8`;
