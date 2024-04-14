import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import tw, { css, styled } from 'twin.macro';

import { useCreateRecentlySelectedTokensMutate } from '~/api/api-server/token/create-recently-selected-tokens';
import { useGetRecentlySelectedTokensQuery } from '~/api/api-server/token/get-recently-selected-tokens';

import { COLOR } from '~/assets/colors';

import { THOUSAND } from '~/constants';

import { Popup } from '~/components/popup';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber, getNetworkAbbr, getNetworkFull } from '~/utils';
import { IToken, POPUP_ID } from '~/types';

import { useSwapStore } from '../states';

interface Props {
  userAllTokenBalances: (IToken & { balance: number })[];
}
export const SelectFromTokenPopup = ({ userAllTokenBalances }: Props) => {
  const { ref } = useGAInView({ name: 'swap-from-token-popup' });
  const { gaAction } = useGAAction();

  const queryClient = useQueryClient();
  const { network } = useParams();
  const { selectedNetwork, isEvm, isFpass } = useNetwork();
  const { evm, xrp, fpass } = useConnectedWallet();
  const { t } = useTranslation();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { toToken, fromToken, setFromToken } = useSwapStore();
  const { close } = usePopup(POPUP_ID.SWAP_SELECT_TOKEN_FROM);

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
    if (token.symbol === toToken?.symbol) return;

    await createRecentlySelectedTokens({
      network: currentNetwork,
      walletAddress,
      tokenId: token.id,
    });
    queryClient.invalidateQueries(recentlySelectedTokensQueryKey);

    gaAction({
      action: 'recent-selected-token',
      data: { page: 'swap', type: 'from', token: token.symbol },
    });

    setFromToken(token);
    close();
  };

  return (
    <Popup id={POPUP_ID.SWAP_SELECT_TOKEN_FROM} title={t('Select token')}>
      <Wrapper ref={ref}>
        <ContentContainer>
          <RecentWrapper>
            {t('Recent')}
            <Recent>
              {recentlySelectedTokens?.map(token => (
                <Token
                  key={token.symbol}
                  token={token.symbol}
                  image
                  imageUrl={token.image}
                  clickable
                  disabled={token.symbol === toToken?.symbol}
                  onClick={() => handleSelect(token)}
                />
              ))}
            </Recent>
          </RecentWrapper>
          <TokenLists>
            {userAllTokenBalances
              ?.filter(t => t.symbol !== toToken?.symbol)
              ?.map(token => (
                <TokenList
                  key={`${token.network}-${token.symbol}`}
                  title={token.symbol}
                  image={token.image}
                  type={'selectable'}
                  balance={
                    token.balance ? `${formatNumber(token.balance, 4, 'floor', THOUSAND, 0)}` : '0'
                  }
                  value={`$${token.price ? `${formatNumber(token.balance * token.price)}` : '0'}`}
                  selected={fromToken?.symbol === token.symbol}
                  onClick={() => {
                    gaAction({
                      action: 'select-from-token',
                      data: { page: 'swap', token: token.symbol },
                    });
                    handleSelect(token);
                  }}
                  backgroundColor={COLOR.NEUTRAL[15]}
                />
              ))}
          </TokenLists>
        </ContentContainer>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`pt-4 px-12`;
const ContentContainer = styled.div(() => [
  tw`
    px-12 flex flex-col gap-24 overflow-auto max-h-376
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
const RecentWrapper = tw.div`
  flex flex-col gap-8 font-r-14 text-neutral-40
`;
const Recent = tw.div`flex gap-8 flex-wrap`;

const TokenLists = tw.div`flex flex-col gap-8`;
