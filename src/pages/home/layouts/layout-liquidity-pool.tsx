import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { ButtonChipFilter } from '~/components/buttons/chip/filter';
import { TableMobileSkeleton } from '~/components/skeleton/table-mobile-skeleton';
import { TableSkeleton } from '~/components/skeleton/table-skeleton';
import { Table } from '~/components/tables';
import { TableMobile } from '~/components/tables/table-mobile';
import { Toggle } from '~/components/toggle';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { getNetworkAbbr } from '~/utils';
import { useTablePoolCompositionSelectTokenStore } from '~/states/components/table';
import { useShowAllPoolsStore } from '~/states/pages';
import { IPoolTokenList, NETWORK, POPUP_ID } from '~/types';

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
  const { gaAction } = useGAAction();

  const isMounted = useRef(false);

  const { isMD } = useMediaQuery();
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  const { open: popupOpen } = usePopup(POPUP_ID.NETWORK_ALERT);
  const { selectedNetwork, setTargetNetwork } = useNetwork();

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
      popupOpen();
      setTargetNetwork(meta.network as NETWORK);
      return;
    }
    navigate(`/pools/${getNetworkAbbr(meta.network)}/${meta.poolId}`);
  };

  const handleTokenClick = (token: string) => {
    gaAction({
      action: 'token-filter',
      data: { page: 'home', layout: 'liquidity-pool', token: token },
    });

    if (selectedTokens.includes(token)) {
      setSelectedTokens(selectedTokens.filter(t => t !== token));
    } else {
      setSelectedTokens([...selectedTokens, token]);
    }
  };

  const sortTokensBySelection = (tokens: IPoolTokenList[], selectedTokens: string[]) => {
    return tokens.sort((a, b) => {
      const isASelected = selectedTokens.includes(a.symbol);
      const isBSelected = selectedTokens.includes(b.symbol);

      if (isASelected && !isBSelected) return -1;
      if (!isASelected && isBSelected) return 1;
      return 0;
    });
  };

  const sortedTokens = sortTokensBySelection(poolTokens, selectedTokens);

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
      <BadgeWrapper>
        {sortedTokens.map(token => (
          <ButtonChipFilter
            key={token.symbol}
            token={token}
            selected={selectedTokens.includes(token.symbol)}
            onClick={() => handleTokenClick(token.symbol)}
          />
        ))}
      </BadgeWrapper>
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

const BadgeWrapper = tw.div`
  flex gap-16 w-full flex-wrap px-20
  md:(px-0)
`;

const ToastPopup = tw.div`
  absolute absolute-center-x top-24 bg-neutral-30 rounded-20 px-20 py-8 z-2
`;
const ToastPopupText = tw.div`
  font-m-14 text-neutral-100 whitespace-nowrap
  md:(font-m-16)
`;
