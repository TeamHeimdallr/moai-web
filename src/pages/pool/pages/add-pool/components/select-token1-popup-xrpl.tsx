import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ScrollContainer from 'react-indiana-drag-scroll';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import tw, { css, styled } from 'twin.macro';

import { useUserAllTokenBalances } from '~/api/api-contract/_xrpl/balance/user-all-token-balances';
import { useUserTokenBalances } from '~/api/api-contract/_xrpl/balance/user-token-balances';
import { useCreateRecentlySelectedTokensMutate } from '~/api/api-server/token/create-recently-selected-tokens';
import { useGetRecentlySelectedTokensQuery } from '~/api/api-server/token/get-recently-selected-tokens';
import { useGetTrendingTokensQuery } from '~/api/api-server/token/get-trending-tokens';
import { useSearchTokensQuery } from '~/api/api-server/token/search-tokens';

import { COLOR } from '~/assets/colors';
import { IconPlus } from '~/assets/icons';

import { ASSET_URL, MILLION } from '~/constants';

import { ButtonPrimarySmallIconLeading } from '~/components/buttons/primary/small-icon-leading';
import { InputSearch } from '~/components/inputs';
import { Popup } from '~/components/popup';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber, getNetworkAbbr, getNetworkFull, truncateAddress } from '~/utils';
import { IPoolTokenList, IToken, POPUP_ID } from '~/types';

import { useXrplPoolAddTokenPairStore } from '../states/token-pair';

interface Props {
  showAddToken?: () => void;
}
export const SelectToken1PopupXrpl = ({ showAddToken }: Props) => {
  const { ref } = useGAInView({ name: 'xrpl-filter-token-popup' });
  const { gaAction } = useGAAction();

  const [searchText, setSearchText] = useState<string>('');

  const queryClient = useQueryClient();
  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const { xrp } = useConnectedWallet();
  const { t } = useTranslation();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const { close } = usePopup(POPUP_ID.XRPL_ADD_POOL_SELECT_TOKEN1);

  const walletAddress = xrp?.address;

  const { userAllTokenBalances } = useUserAllTokenBalances();
  const userAllTokenBalancesLpFiltered = userAllTokenBalances?.filter(t => !t.isLpToken);

  const { data: searchedTokensData } = useSearchTokensQuery(
    {
      params: { networkAbbr: currentNetworkAbbr },
      queries: { text: searchText || '' },
    },
    { enabled: !!searchText }
  );
  const { tokens: searchedTokens } = searchedTokensData || {};
  const { userTokenBalances: searchedTokensWithBalance } = useUserTokenBalances({
    targetTokens:
      searchedTokens?.map(t => ({ issuer: t?.address || '', currency: t?.currency || '' })) || [],
  });

  const { data: trendingToknesData } = useGetTrendingTokensQuery(
    { params: { networkAbbr: currentNetworkAbbr } },
    { staleTime: 1000 * 60 }
  );
  const { tokens: trendingTokens } = trendingToknesData || {};

  const { mutateAsync: createRecentlySelectedTokens } = useCreateRecentlySelectedTokensMutate();
  const { data: recentlySelectedTokensData, queryKey: recentlySelectedTokensQueryKey } =
    useGetRecentlySelectedTokensQuery(
      {
        params: { networkAbbr: currentNetworkAbbr },
        queries: { walletAddress },
      },
      {
        staleTime: 1000 * 3,
        enabled: !!walletAddress,
      }
    );
  const { tokens: recentlySelectedTokens } = recentlySelectedTokensData || {};

  const sortedTokens = [
    ...(userAllTokenBalancesLpFiltered
      ?.filter(t => t.balance > 0)
      ?.sort((a, b) => a.symbol.localeCompare(b.symbol)) || []),
    ...(userAllTokenBalancesLpFiltered
      ?.filter(t => t.balance <= 0)
      ?.sort((a, b) => a.symbol.localeCompare(b.symbol)) || []),
  ];
  const tokens = searchText ? searchedTokensWithBalance : sortedTokens;

  const { token1, token2, setToken1 } = useXrplPoolAddTokenPairStore();

  const disableTokenSelect = (token: IPoolTokenList) =>
    (token1?.address === token.address && token1?.currency === token.currency) ||
    (token2?.address === token.address && token2?.currency === token.currency);

  const handleTokenClick = (token: IPoolTokenList) => {
    gaAction({
      action: 'token-filter',
      data: { page: 'home', layout: 'liquidity-pool', token: token },
    });

    if (disableTokenSelect(token)) {
      return;
    } else {
      setToken1(token);
    }
  };

  const handleSelect = async (token: IToken) => {
    if (walletAddress && token.id) {
      await createRecentlySelectedTokens({
        network: currentNetwork,
        walletAddress,
        tokenId: token.id,
      });
      queryClient.invalidateQueries(recentlySelectedTokensQueryKey);
    }

    handleTokenClick({
      symbol: token.symbol,
      image: token.image,
      address: token.address,
      currency: token.currency,
    });

    gaAction({
      action: 'recent-selected-token',
      data: { page: 'swap', type: 'from', token: token.symbol },
    });

    close();
  };

  return (
    <Popup id={POPUP_ID.XRPL_ADD_POOL_SELECT_TOKEN1} title={t('Select token')}>
      <Wrapper ref={ref}>
        <SearchWrapper>
          <InputSearch
            placeholder={t('Search token')}
            onChange={e => setSearchText(e.currentTarget.value || '')}
            handleDelete={() => setSearchText('')}
            value={searchText}
          />
        </SearchWrapper>
        <ContentContainer>
          <RecommendWrapper>
            {recentlySelectedTokens && recentlySelectedTokens.length > 0 && (
              <RecommendInnerWrapper>
                {t('Recent')}

                <RecommendList>
                  {recentlySelectedTokens?.map(token => (
                    <Token
                      key={token.symbol}
                      token={token.symbol}
                      image
                      imageUrl={token.image}
                      clickable
                      disabled={disableTokenSelect(token)}
                      onClick={() => handleSelect(token)}
                    />
                  ))}
                </RecommendList>
              </RecommendInnerWrapper>
            )}
            {trendingTokens && trendingTokens.length > 0 && (
              <RecommendInnerWrapper>
                {t('Trending')}
                <RecommendList>
                  {trendingTokens?.map(token => (
                    <Token
                      key={token.symbol}
                      token={token.symbol}
                      image
                      imageUrl={token.image}
                      clickable
                      disabled={disableTokenSelect(token)}
                      onClick={() => handleSelect(token)}
                    />
                  ))}
                </RecommendList>
              </RecommendInnerWrapper>
            )}
          </RecommendWrapper>
          {tokens && tokens.length > 0 && (
            <TokenLists>
              {tokens?.map(token => (
                <TokenList
                  key={`${token.network}-${token.symbol}-${token.address}-${token.currency}`}
                  title={token.symbol}
                  image={token.image || `${ASSET_URL}/tokens/token-unknown.png`}
                  description={
                    token.issuerOrganization ? (
                      <Issuer>
                        {token.issuerOrganizationImage && (
                          <IssuerIcon src={token.issuerOrganizationImage} />
                        )}
                        {token.issuerOrganization}
                      </Issuer>
                    ) : (
                      <Issuer>{truncateAddress(token.address)}</Issuer>
                    )
                  }
                  type={'selectable'}
                  balance={`${formatNumber(token?.balance || 0, 4, 'floor', MILLION, 0)}`}
                  value={
                    token.price
                      ? `$${`${formatNumber(
                          (token?.balance || 0) * (token.price || 0),
                          2,
                          'floor',
                          MILLION,
                          2
                        )}`}`
                      : `-`
                  }
                  disabled={disableTokenSelect(token)}
                  selected={disableTokenSelect(token)}
                  onClick={() => {
                    gaAction({
                      action: 'select-from-token',
                      data: { page: 'swap', token: token.symbol },
                    });
                    if (disableTokenSelect(token)) return;
                    handleSelect(token);
                  }}
                  backgroundColor={COLOR.NEUTRAL[15]}
                />
              ))}
            </TokenLists>
          )}

          {searchText && tokens?.length === 0 && (
            <NotFound>
              {t('Sorry! No token found :(')}
              <NotFoundDescription>{t('Add the missing tokens.')}</NotFoundDescription>
            </NotFound>
          )}
          {searchText && (
            <AddTokenWrapper>
              <ButtonPrimarySmallIconLeading
                icon={<IconPlus />}
                text={t('Add token')}
                onClick={() => showAddToken?.()}
              />
            </AddTokenWrapper>
          )}
        </ContentContainer>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`pt-4 px-12`;

const SearchWrapper = tw.div`
  px-12 pb-24
`;
const ContentContainer = styled.div(() => [
  tw`
    px-12 flex flex-col gap-24 overflow-auto h-444
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

const RecommendWrapper = tw.div`
  flex flex-col gap-16
`;
const RecommendInnerWrapper = tw.div`
  flex flex-col gap-8 font-r-14 text-neutral-40
`;
const RecommendList = tw(ScrollContainer)`
  flex gap-8 w-full overflow-x-auto scrollbar-hide
`;

const TokenLists = tw.div`flex flex-col gap-8`;

const Issuer = tw.div`
  flex items-center gap-4 font-r-12 text-neutral-60
`;
const IssuerIcon = tw.img`
  w-16 h-16 rounded-full overflow-hidden object-cover
`;

const NotFound = tw.div`
  flex-center flex-col gap-4 font-m-16 text-neutral-100 pt-82
`;
const NotFoundDescription = tw.div`
  font-r-12 text-neutral-60
`;

const AddTokenWrapper = tw.div`
  w-full flex-center
`;
