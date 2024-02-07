import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';

import { THOUSAND } from '~/constants';

import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components/use-popup';
import { formatNumber } from '~/utils';
import { useAddLiquidityTokenStore } from '~/states/components/input-group/token';
import { IToken, ITokenComposition, POPUP_ID } from '~/types';

type Token = ITokenComposition & {
  balance: number;
  balanceRaw: bigint;
};
interface Props {
  userPoolTokenBalances: (IToken & { balance: number })[];
  compositions: ITokenComposition[];
}
export const AddLiquiditySelectTokenPopup = ({ userPoolTokenBalances, compositions }: Props) => {
  const { ref } = useGAInView({ name: 'add-liquidity-token-popup' });
  const { gaAction } = useGAAction();

  const { t } = useTranslation();

  const { token: selectedToken, setToken } = useAddLiquidityTokenStore();
  const { close } = usePopup(POPUP_ID.ADD_LIQUIDITY_SELECT_TOKEN);

  const handleSelect = async (token: Token) => {
    if (token.symbol === selectedToken?.symbol) return;

    setToken(token);
    close();
  };
  return (
    <Popup
      id={POPUP_ID.ADD_LIQUIDITY_SELECT_TOKEN}
      title={t('Select token')}
      style={{ backgroundColor: COLOR.NEUTRAL[10] }}
    >
      <Wrapper ref={ref}>
        <ContentContainer>
          <TokenLists>
            {compositions?.map(token => {
              const userToken = userPoolTokenBalances.find(t => t.address === token.address);
              const balance = userToken?.balance || 0;

              return (
                <TokenList
                  key={`${token.network}-${token.symbol}`}
                  title={token.symbol}
                  image={token.image}
                  type={'selectable'}
                  balance={balance ? `${formatNumber(balance, 4, 'floor', THOUSAND, 0)}` : '0'}
                  value={`$${token.price ? `${formatNumber(balance * token.price)}` : '0'}`}
                  selected={selectedToken?.symbol === token.symbol}
                  onClick={() => {
                    gaAction({
                      action: 'add-liquidity-select-token',
                      data: { page: 'add-liquidity', token: token.symbol },
                    });
                    handleSelect({ ...token, balance } as Token);
                  }}
                  backgroundColor={COLOR.NEUTRAL[15]}
                />
              );
            })}
          </TokenLists>
        </ContentContainer>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`px-8`;
const ContentContainer = styled.div(() => [
  tw`
    px-8 flex flex-col gap-24 overflow-auto max-h-376
    `,
  css`
    scroll-behavior: smooth;
    &::-webkit-scrollbar {
      width: 4px;
      height: auto;
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      visibility: hidden;
      background: #515a68;
      -webkit-border-radius: 2px;
    }
    &:hover::-webkit-scrollbar-thumb {
      visibility: visible;
    }
  `,
]);
const TokenLists = tw.div`flex flex-col gap-8`;
