import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { tokenInfos } from '~/assets/tokens/token-mantle-testnet';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';
import { TOKEN_USD_MAPPER } from '~/constants';
import { usePopup } from '~/hooks/pages/use-popup';
import { POPUP_ID } from '~/types/components';
import { formatNumber } from '~/utils/number';

import { useSwap } from '../hooks/use-swap';

export const PopupSwapSelectTokenTo = () => {
  const { tokenBalances, toToken, setToToken } = useSwap();
  const { close } = usePopup(POPUP_ID.SWAP_SELECT_TOKEN_TO);

  return (
    <Popup
      id={POPUP_ID.SWAP_SELECT_TOKEN_TO}
      title="Select token"
      style={{ backgroundColor: COLOR.NEUTRAL[10] }}
    >
      <Wrapper>
        {tokenInfos.map(token => {
          const tokenBalance =
            tokenBalances.find(tokenBalance => tokenBalance.symbol === token.symbol)?.balance ?? 0;
          const formattedTokenBalance = tokenBalance ? formatNumber(tokenBalance, 2) : undefined;

          const tokenValue = TOKEN_USD_MAPPER[token.symbol];
          const formattedTokenValue = tokenValue
            ? '$' + formatNumber(tokenValue * tokenBalance, 2)
            : undefined;

          const handleClick = () => {
            setToToken(token.symbol);
            close();
          };

          return (
            <TokenList
              key={token.symbol}
              title={token.symbol}
              image={token.logoURI}
              type={'selectable'}
              balance={formattedTokenBalance}
              value={formattedTokenValue}
              selected={toToken === token.symbol}
              onClick={handleClick}
            />
          );
        })}
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  px-16
`;
