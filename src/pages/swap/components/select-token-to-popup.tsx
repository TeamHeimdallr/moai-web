import tw from 'twin.macro';

import { useTokenBalanceInPool } from '~/api/api-contract/balance/get-token-balance-in-pool';

import { COLOR } from '~/assets/colors';

import { TOKEN_IMAGE_MAPPER } from '~/constants';

import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components/use-popup';
import { formatNumber } from '~/utils';
import { useSwapStore } from '~/states/pages';
import { POPUP_ID } from '~/types';

export const SelectToTokenPopup = () => {
  const { balancesArray } = useTokenBalanceInPool();

  const { toToken, fromToken, setToToken } = useSwapStore();
  const { close } = usePopup(POPUP_ID.SWAP_SELECT_TOKEN_TO);

  return (
    <Popup
      id={POPUP_ID.SWAP_SELECT_TOKEN_TO}
      title="Select token"
      style={{ backgroundColor: COLOR.NEUTRAL[10] }}
    >
      <Wrapper>
        {balancesArray
          ?.filter(t => t.symbol !== fromToken)
          ?.map((balanceInfo, idx) => {
            if (!balanceInfo) return <></>;

            const { symbol, value, balance } = balanceInfo;
            const formattedTokenBalance = (balance ?? 0) > 0 ? formatNumber(balance, 2) : '0';
            const formattedTokenValue = (value ?? 0) > 0 ? '$' + formatNumber(value, 2) : '$0';

            const handleClick = () => {
              setToToken(symbol ?? '');
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
                selected={toToken === (symbol ?? '')}
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
