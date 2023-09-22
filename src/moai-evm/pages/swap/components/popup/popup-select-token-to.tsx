import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';

import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/pages/use-popup';
import { formatNumber } from '~/utils/number';

import { tokenInfos } from '~/moai-evm/data/token-info';

import { POPUP_ID } from '~/types';

import { useBalancesAll } from '~/moai-evm/hooks/data/use-balance-all';

import { useSwapData } from '../../hooks/use-swap-data';

export const PopupSwapSelectTokenTo = () => {
  const { balancesArray } = useBalancesAll();

  const { toToken, setToToken, setFromToken } = useSwapData();
  const { close } = usePopup(POPUP_ID.SWAP_SELECT_TOKEN_TO);

  return (
    <Popup
      id={POPUP_ID.SWAP_SELECT_TOKEN_TO}
      title="Select token"
      style={{ backgroundColor: COLOR.NEUTRAL[10] }}
    >
      <Wrapper>
        {balancesArray?.map((balanceInfo, idx) => {
          if (!balanceInfo) return <></>;

          const { name, value, balance } = balanceInfo;
          const token = tokenInfos.find(token => token.symbol === balanceInfo.name);

          const formattedTokenBalance = balance > 0 ? formatNumber(balance, 2) : undefined;
          const formattedTokenValue = value > 0 ? '$' + formatNumber(value, 2) : undefined;

          const handleClick = () => {
            setToToken(token?.symbol ?? '');
            setFromToken(tokenInfos[idx === 0 ? 1 : 0]?.symbol ?? 0);
            close();
          };

          return (
            <TokenList
              key={name + idx}
              title={name}
              image={token?.logoURI ?? ''}
              type={'selectable'}
              balance={formattedTokenBalance}
              value={formattedTokenValue}
              selected={toToken === (token?.symbol ?? '')}
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
