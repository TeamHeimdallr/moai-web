import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { TableMobileSkeleton } from '~/components/skeleton/table-mobile-skeleton';
import { TableSkeleton } from '~/components/skeleton/table-skeleton';
import { Table } from '~/components/tables';
import { TableMobile } from '~/components/tables/table-mobile';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { getNetworkAbbr } from '~/utils';
import { NETWORK, POPUP_ID } from '~/types';

import { useTableMyLiquidityPool } from '../hooks/components/table/use-table-liquidity-pool-my';

interface Meta {
  network: NETWORK;
  id: string;
  poolId: string;
}

export const MyLiquidityLayout = () => (
  <Suspense fallback={<_MyLiquidityLayoutSkeleton />}>
    <_MyLiquidityLayout />
  </Suspense>
);

const _MyLiquidityLayout = () => {
  const {
    tableColumns,
    tableData,
    mobileTableData,
    mobileTableColumn,
    hasNextPage,
    handleMobileRowClick,
    fetchNextPage,
  } = useTableMyLiquidityPool();

  const { isMD } = useMediaQuery();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { open: popupOpen } = usePopup(POPUP_ID.NETWORK_ALERT);
  const { selectedNetwork, setTargetNetwork } = useNetwork();

  const handleRowClick = (meta?: Meta) => {
    if (!meta) return;
    if (selectedNetwork !== meta.network) {
      popupOpen();
      setTargetNetwork(meta.network as NETWORK);
      return;
    }
    navigate(`/pools/${getNetworkAbbr(meta.network)}/${meta.poolId}`);
  };

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>{t('My liquidity in Moai pools')}</Title>
      </TitleWrapper>
      {isMD ? (
        <Table
          data={tableData}
          columns={tableColumns}
          ratio={[2, 1, 1, 1]}
          type="darker"
          hasMore={hasNextPage}
          handleRowClick={handleRowClick}
          handleMoreClick={() => fetchNextPage()}
        />
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

const _MyLiquidityLayoutSkeleton = () => {
  const { tableColumns, mobileTableColumn } = useTableMyLiquidityPool();

  const { isMD } = useMediaQuery();
  const { t } = useTranslation();

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>{t('My liquidity in Moai pools')}</Title>
      </TitleWrapper>
      {isMD ? (
        <TableSkeleton
          skeletonHeight={210}
          columns={tableColumns}
          ratio={[2, 1, 1, 1]}
          type="darker"
        />
      ) : (
        <TableMobileSkeleton skeletonHeight={210} columns={mobileTableColumn} type="darker" />
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24
  md:(px-20)
  xl:(px-80)
`;

const TitleWrapper = tw.div`
  w-full flex gap-10 items-center px-20
  md:(h-40 px-0)
`;

const Title = tw.div`
  text-neutral-100 flex-1
  font-b-20
  md:(font-b-24)
`;
