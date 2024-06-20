import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';
import { uniqBy, xorBy } from 'lodash-es';
import tw from 'twin.macro';

import { useGetRecentlySelectedTokensQuery } from '~/api/api-server/token/get-recently-selected-tokens';
import { useGetTrendingTokensQuery } from '~/api/api-server/token/get-trending-tokens';

import { IconSearch } from '~/assets/icons';

import { ASSET_URL } from '~/constants';

import { ButtonPrimaryMedium, ButtonPrimaryMediumIconLeading } from '~/components/buttons';
import { ButtonChipFilter } from '~/components/buttons/chip/filter';
import { TableMobileSkeleton } from '~/components/skeleton/table-mobile-skeleton';
import { TableSkeleton } from '~/components/skeleton/table-skeleton';
import { Table } from '~/components/tables';
import { TableMobile } from '~/components/tables/table-mobile';
import { Toggle } from '~/components/toggle';

import { useShowAllPoolsStore } from '~/pages/home/states';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr } from '~/utils';
import { useTablePoolCompositionSelectTokenStore } from '~/states/components/table';
import { IPoolTokenList, NETWORK, POPUP_ID } from '~/types';

import { TokenPopupXrpl } from '../components/token-popup-xrpl';
import { useTableLiquidityPool } from '../hooks/components/table/use-table-liquidity-pool';

interface Meta {
  network: NETWORK;
  id: string;
  poolId: string;
}

export const LiquidityPoolLayout = () => (
  <Suspense fallback={<_LiquidityPoolLayoutSkeleton />}>
    <_LiquidityPoolLayout />
  </Suspense>
);
const _LiquidityPoolLayout = () => {
  const navigate = useNavigate();

  const { ref } = useGAInView({ name: 'home-layout-liquidity-pool' });
  const { gaAction } = useGAAction();

  const isMounted = useRef(false);
  const { isMD } = useMediaQuery();
  const { t } = useTranslation();

  const { open: openNetworkAlert, reset } = usePopup(POPUP_ID.NETWORK_ALERT);
  const { selectedNetwork, isXrp, selectNetwork } = useNetwork();
  const { xrp } = useConnectedWallet();

  const networkAbbr = getNetworkAbbr(selectedNetwork);
  const xrpWalletAddress = xrp?.address || '';

  const { data: trendingToknesData } = useGetTrendingTokensQuery(
    { params: { networkAbbr } },
    {
      enabled: isXrp,
      staleTime: 1000 * 60,
    }
  );
  const { tokens: trendingTokens } = trendingToknesData || {};

  const { data: recentlySelectedTokensData } = useGetRecentlySelectedTokensQuery(
    {
      params: { networkAbbr },
      queries: { walletAddress: xrpWalletAddress },
    },
    {
      staleTime: 1000 * 3,
      enabled: isXrp && !!xrpWalletAddress,
    }
  );
  const { tokens: recentlySelectedTokens } = recentlySelectedTokensData || {};

  const { open: openXrplPoolFilter, opened: xrplPoolFilterOpened } = usePopup(
    POPUP_ID.XRPL_POOL_FILTER
  );
  const { showAllPools, setShowAllPools } = useShowAllPoolsStore();
  const { selectedTokens, setSelectedTokens } = useTablePoolCompositionSelectTokenStore();
  const {
    tableData,
    tableColumns,
    mobileTableData,
    mobileTableColumn,
    poolTokens,
    hasNextPage,
    handleMobileRowClick,
    fetchNextPage,
  } = useTableLiquidityPool();

  const [showToastPopup, setShowToastPopup] = useState<boolean>(false);

  const network =
    selectedNetwork === NETWORK.EVM_SIDECHAIN
      ? 'EVM sidechain'
      : selectedNetwork === NETWORK.THE_ROOT_NETWORK
      ? 'The Root Network'
      : 'XRPL';

  const handleRowClick = (meta?: Meta) => {
    if (!meta) return;

    gaAction({
      action: 'liquidity-pool-click',
      data: { page: 'home', layout: 'liquidity-pool', ...meta },
    });
    if (selectedNetwork !== meta.network) {
      const callback = () => {
        selectNetwork(meta.network as NETWORK);
        reset();
        navigate(`/pools/${getNetworkAbbr(meta.network)}/${meta.poolId}`);
      };

      openNetworkAlert({ callback });
      return;
    }
    navigate(`/pools/${getNetworkAbbr(meta.network)}/${meta.poolId}`);
  };

  const handleTokenClick = (token: IPoolTokenList) => {
    gaAction({
      action: 'token-filter',
      data: { page: 'home', layout: 'liquidity-pool', token: token },
    });

    if (
      selectedTokens.find(
        t =>
          t.symbol === token.symbol && t.address === token.address && t.currency === token.currency
      )
    ) {
      setSelectedTokens(
        selectedTokens.filter(
          t =>
            !(
              t.symbol === token.symbol &&
              t.address === token.address &&
              t.currency === token.currency
            )
        )
      );
    } else {
      setSelectedTokens([...selectedTokens, token]);
    }
  };

  useEffect(() => {
    setSelectedTokens([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork, showAllPools]);

  const sortTokensBySelection = (tokens: IPoolTokenList[], selectedTokens: IPoolTokenList[]) => {
    return tokens.sort((a, b) => {
      const isASelected = selectedTokens.find(
        t => t.symbol === a.symbol && t.address === a.address && t.currency === a.currency
      );
      const isBSelected = selectedTokens.find(
        t => t.symbol === b.symbol && t.address === b.address && t.currency === b.currency
      );

      if (isASelected && !isBSelected) return -1;
      if (!isASelected && isBSelected) return 1;
      return 0;
    });
  };

  const sortedTokens = sortTokensBySelection(poolTokens, selectedTokens);
  const sortedTokensXrpl = uniqBy(
    [
      ...(recentlySelectedTokens || []),
      ...xorBy(recentlySelectedTokens || [], trendingTokens || [], 'symbol'),
    ],
    'symbol'
  ).slice(0, 5);
  const tokens = network === 'XRPL' ? sortedTokensXrpl : sortedTokens;

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (!showAllPools) {
      setShowToastPopup(true);
      setTimeout(() => {
        setShowToastPopup(false);
      }, 3000);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllPools]);

  return (
    <Wrapper ref={ref}>
      {showToastPopup && (
        <ToastPopup>
          <ToastPopupText>{t('show-all-pools-message', { network: network })}</ToastPopupText>
        </ToastPopup>
      )}
      <TitleWrapper>
        <Title>{t(`Liquidity pools`)}</Title>
        <AllChainToggle>
          {t(`All supported chains`)}
          <Toggle
            selected={showAllPools}
            onClick={() => {
              gaAction({
                action: 'toggel-all-support-chains',
                data: { page: 'home', layout: 'liquidity-pool', showAllPools: !showAllPools },
              });
              setShowAllPools(!showAllPools);
            }}
          />
        </AllChainToggle>
      </TitleWrapper>
      <ButtonWrapper>
        <BadgeWrapper>
          {tokens.map(token => (
            <ButtonChipFilter
              key={token.symbol}
              token={token}
              image={token.image || `${ASSET_URL}/tokens/token-unknown.png`}
              selected={
                !!selectedTokens.find(
                  t =>
                    t.symbol === token.symbol &&
                    t.address === token.address &&
                    t.currency === token.currency
                )
              }
              onClick={() => handleTokenClick(token)}
            />
          ))}
        </BadgeWrapper>
        {selectedNetwork === NETWORK.XRPL && (
          <ButtonInnerWrapper>
            <ButtonPrimaryMediumIconLeading
              text={t('Filter by token')}
              icon={<IconSearch />}
              buttonType="outlined"
              onClick={() => openXrplPoolFilter()}
            />
            {xrpWalletAddress && (
              <ButtonPrimaryMedium
                text={t('Add a pool')}
                onClick={() => navigate('/pools/xrpl/add')}
              />
            )}
          </ButtonInnerWrapper>
        )}
      </ButtonWrapper>
      {isMD ? (
        <TableWrapper>
          <Table
            data={tableData}
            columns={tableColumns}
            ratio={showAllPools ? [1, 2, 1, 1, 1] : [2, 1, 1, 1]}
            type="darker"
            hasMore={hasNextPage}
            handleMoreClick={fetchNextPage}
            handleRowClick={handleRowClick}
          />
        </TableWrapper>
      ) : (
        <TableMobile
          data={mobileTableData}
          columns={mobileTableColumn}
          type="darker"
          hasMore={hasNextPage}
          handleMoreClick={fetchNextPage}
          handleClick={meta => handleMobileRowClick(meta.network, meta.poolId)}
        />
      )}
      {xrplPoolFilterOpened && <TokenPopupXrpl />}
    </Wrapper>
  );
};

const _LiquidityPoolLayoutSkeleton = () => {
  const isMounted = useRef(false);

  const { isMD } = useMediaQuery();
  const { t } = useTranslation();

  const { showAllPools, setShowAllPools } = useShowAllPoolsStore();
  const { tableColumns, mobileTableColumn } = useTableLiquidityPool();

  const { selectedNetwork } = useNetwork();

  const [showToastPopup, setShowToastPopup] = useState<boolean>(false);

  const network =
    selectedNetwork === NETWORK.EVM_SIDECHAIN
      ? 'EVM sidechain'
      : selectedNetwork === NETWORK.THE_ROOT_NETWORK
      ? 'The Root Network'
      : 'XRPL';

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (!showAllPools) {
      setShowToastPopup(true);
      setTimeout(() => {
        setShowToastPopup(false);
      }, 3000);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllPools]);

  return (
    <Wrapper>
      {showToastPopup && (
        <ToastPopup>
          <ToastPopupText>{t('show-all-pools-message', { network: network })}</ToastPopupText>
        </ToastPopup>
      )}
      <TitleWrapper>
        <Title>{t(`Liquidity pools`)}</Title>
        <AllChainToggle>
          {t(`All supported chains`)}
          <Toggle selected={showAllPools} onClick={() => setShowAllPools(!showAllPools)} />
        </AllChainToggle>
      </TitleWrapper>
      <BadgeWrapper>
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton
              key={i}
              width={68}
              height={24}
              inline
              highlightColor="#3F4359"
              baseColor="#2B2E44"
              duration={0.9}
              style={{ borderRadius: '40px' }}
            />
          ))}
      </BadgeWrapper>
      {isMD ? (
        <TableWrapper>
          <TableSkeleton
            columns={tableColumns}
            skeletonHeight={240}
            ratio={showAllPools ? [1, 2, 1, 1, 1] : [2, 1, 1, 1]}
            type="darker"
          />
        </TableWrapper>
      ) : (
        <TableMobileSkeleton columns={mobileTableColumn} skeletonHeight={510} type="darker" />
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24 relative
  md:(px-20)
  xl:(px-80)
`;

const TitleWrapper = tw.div`
  w-full flex
  flex-col gap-10 items-start px-20
  md:(flex-row items-center h-40 gap-10 px-0)
`;

const Title = tw.div`
  text-neutral-100 flex-1
  font-b-20
  md:(font-b-24)
`;
const AllChainToggle = tw.div`
  flex gap-10 text-neutral-100
  font-m-14
  md:(font-m-16)
`;
const TableWrapper = tw.div`
  flex flex-col gap-24
`;

const ButtonWrapper = tw.div`
  flex items-center justify-between w-full
`;

const BadgeWrapper = tw.div`
  flex flex-1 gap-16 flex-wrap px-20
  md:(px-0)
`;

const ButtonInnerWrapper = tw.div`
  flex items-center gap-8
`;

const ToastPopup = tw.div`
  absolute absolute-center-x top-24 bg-neutral-30 rounded-20 px-20 py-8 z-2
`;
const ToastPopupText = tw.div`
  font-m-14 text-neutral-100 whitespace-nowrap
  md:(font-m-16)
`;
