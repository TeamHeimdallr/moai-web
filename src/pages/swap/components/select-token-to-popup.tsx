import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';
import { useQueryClient } from 'wagmi';

import { useCreateRecentlySelectedTokensMutate } from '~/api/api-server/token/create-recently-selected-tokens';
import { useGetRecentlySelectedTokensQuery } from '~/api/api-server/token/get-recently-selected-tokens';

import { COLOR } from '~/assets/colors';

import { Popup } from '~/components/popup';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components/use-popup';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber, getNetworkAbbr, getNetworkFull } from '~/utils';
import { useSwapStore } from '~/states/pages';
import { IToken, POPUP_ID } from '~/types';

interface Props {
  userAllTokenBalances: (IToken & { balance: number })[];
  tokenPrice: number;
}
export const SelectToTokenPopup = ({ userAllTokenBalances, tokenPrice }: Props) => {
  const queryClient = useQueryClient();
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, xrp, fpass } = useConnectedWallet();
  const { t } = useTranslation();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { toToken, fromToken, setToToken } = useSwapStore();
  const { close } = usePopup(POPUP_ID.SWAP_SELECT_TOKEN_TO);

  const walletAddress = isFpass ? fpass?.address : isEvm ? evm?.address : xrp?.address;

  const { mutateAsync: createRecentlySelectedTokens } = useCreateRecentlySelectedTokensMutate();
  const { data: recentlySelectedTokensData, queryKey: recentlySelectedTokensQueryKey } =
    useGetRecentlySelectedTokensQuery(
      {
        params: {
          networkAbbr: currentNetworkAbbr,
        },
        queries: {
          walletAddress,
        },
      },
      {
        staleTime: 1000 * 3,
        enabled: !!walletAddress,
      }
    );
  const { tokens: recentlySelectedTokens } = recentlySelectedTokensData || {};

  const handleSelect = async (token: IToken) => {
    if (token.symbol === fromToken?.symbol) return;

    await createRecentlySelectedTokens({
      network: currentNetwork,
      walletAddress,
      tokenId: token.id,
    });
    queryClient.invalidateQueries(recentlySelectedTokensQueryKey);

    setToToken(token);
    close();
  };
  return (
    <Popup
      id={POPUP_ID.SWAP_SELECT_TOKEN_TO}
      title={t('Select token')}
      style={{ backgroundColor: COLOR.NEUTRAL[10] }}
    >
      <Wrapper>
        <ContentContainer>
          <Tokens>
            {recentlySelectedTokens?.map(token => (
              <Token
                key={token.symbol}
                token={token.symbol}
                image
                imageUrl={token.image}
                clickable
                disabled={token.symbol === fromToken?.symbol}
                onClick={() => handleSelect(token)}
              />
            ))}
          </Tokens>
          <TokenLists>
            {userAllTokenBalances
              ?.filter(t => t.symbol !== fromToken?.symbol)
              ?.map(token => (
                <TokenList
                  key={`${token.network}-${token.symbol}`}
                  title={token.symbol}
                  image={token.image}
                  type={'selectable'}
                  balance={token.balance ? `${formatNumber(token.balance, 4)}` : '0'}
                  value={`$${
                    token.price
                      ? `${formatNumber(token.balance * (token.price || tokenPrice), 4)}`
                      : '0'
                  }`}
                  selected={toToken?.symbol === token.symbol}
                  onClick={() => handleSelect(token)}
                  backgroundColor={COLOR.NEUTRAL[15]}
                />
              ))}
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
const Tokens = tw.div`flex gap-8 flex-wrap`;
