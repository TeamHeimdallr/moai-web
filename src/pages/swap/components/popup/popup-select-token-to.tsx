import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { tokenInfos } from '~/assets/tokens';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';
import { useBalancesAll } from '~/hooks/data/use-balance-all';
import { usePopup } from '~/hooks/pages/use-popup';
import { POPUP_ID } from '~/types/components';
import { TOKEN } from '~/types/contracts';
import { formatNumber } from '~/utils/number';

import { useSwapData } from '../../hooks/use-swap-data';

export const PopupSwapSelectTokenTo = () => {
  const { balancesMap } = useBalancesAll();
  const { toToken, setToToken, setFromToken } = useSwapData();
  const { close } = usePopup(POPUP_ID.SWAP_SELECT_TOKEN_TO);

  return (
    <Popup
      id={POPUP_ID.SWAP_SELECT_TOKEN_TO}
      title="Select token"
      style={{ backgroundColor: COLOR.NEUTRAL[10] }}
    >
      <Wrapper>
        {tokenInfos.map((token, idx) => {
          const balance = balancesMap?.[token.symbol as TOKEN];
          if (!balance) return <></>;

          const { value, valueUSD } = balance;
          const formattedTokenBalance = value > 0 ? formatNumber(value, 2) : undefined;
          const formattedTokenValue = valueUSD > 0 ? '$' + formatNumber(valueUSD, 2) : undefined;

          const handleClick = () => {
            setToToken(token.symbol);
            setFromToken(tokenInfos[idx === 0 ? 1 : 0]?.symbol);
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
