import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { useGetMaxBorrowPower } from '~/api/api-contract/_evm/lending/get-max-borrow-power';

import { IconQuestion } from '~/assets/icons';

import { MILLION, THOUSAND } from '~/constants';

import { ButtonIconSmall } from '~/components/buttons';
import { Table } from '~/components/tables';
import { TableMobile } from '~/components/tables/table-mobile';
import { Tooltip } from '~/components/tooltips/base';

import { APYMedium } from '~/pages/lending/components/apy';
import { InfoCard } from '~/pages/lending/components/info-card';
import { useTableAssetsToBorrow } from '~/pages/lending/hooks/table/use-table-assets-to-borrow';
import { useTableMyBorrows } from '~/pages/lending/hooks/table/use-table-my-borrows';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber, getNetworkAbbr } from '~/utils';
import { TOOLTIP_ID } from '~/types';

export const LayoutMarketBorrows = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { selectedNetwork } = useNetwork();
  const { currentAddress } = useConnectedWallet(selectedNetwork);
  const networkAbbr = getNetworkAbbr(selectedNetwork);
  const { maximumBorrowPower } = useGetMaxBorrowPower();

  const {
    tableColumns: tableColumnsMyBorrows,
    tableData: tableDataMyBorrows,
    mobileTableColumn: mobileTableColumnMyBorrows,
    mobileTableData: mobileTableDataMyBorrows,
    hasNextPage: hasNextPageMyBorrows,
    fetchNextPage: fetchNextPageMyBorrows,
  } = useTableMyBorrows();

  const {
    tableColumns: tableColumnsAssetsToBorrow,
    tableData: tableDataAssetsToBorrow,
    mobileTableColumn: mobileTableColumnAssetsToBorrow,
    mobileTableData: mobileTableDataAssetsToBorrow,
    hasNextPage: hasNextPageAssetsToBorrow,
    fetchNextPage: fetchNextPageAssetsToBorrow,
  } = useTableAssetsToBorrow();

  const balance = tableDataMyBorrows.map(data => data.debt.props.value).reduce((a, b) => a + b, 0);

  const borrowPowerUsed = (100 * balance) / maximumBorrowPower;
  const apySum = tableDataMyBorrows
    .map(data => data.debt.props.value * data.apy.props.value.props.apy)
    .reduce((a, b) => a + b, 0);

  const apy = apySum / balance;

  const { isMD } = useMediaQuery();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRowClick = (meta: any) => {
    if (!meta) return;

    const { address } = meta;
    if (!address) return;

    navigate(`/lending/${networkAbbr}/${address}`);
  };

  return (
    <Wrapper>
      {currentAddress && (
        <ContentWrapper>
          <Title>{t('My Borrows')}</Title>
          <CardWrapper>
            <InfoCard
              title={t('lending-balance')}
              value={`$${formatNumber(balance, 2, 'floor', MILLION, 2)}`}
              light
            />
            <InfoCard
              title={t('lending-apy')}
              titleIcon={
                <ButtonIconSmall
                  icon={<IconQuestion />}
                  data-tooltip-id={TOOLTIP_ID.LENDING_BORROW_APY}
                />
              }
              value={<APYMedium apy={apy} />}
              light
            />
            <InfoCard
              title={t('lending-borrow-power-used')}
              titleIcon={
                <ButtonIconSmall
                  icon={<IconQuestion />}
                  data-tooltip-id={TOOLTIP_ID.LENDING_BORROW_BORROW_POWER_USED}
                />
              }
              value={`${formatNumber(borrowPowerUsed, 2, 'floor', THOUSAND, 0)}%`}
              light
            />
          </CardWrapper>

          {isMD ? (
            <Table
              data={tableDataMyBorrows}
              columns={tableColumnsMyBorrows}
              ratio={[1, 1, 1, '94px']}
              type="lighter"
              emptyText={t('lending-my-borrows-empty')}
              hasMore={hasNextPageMyBorrows}
              handleRowClick={handleRowClick}
              handleMoreClick={() => fetchNextPageMyBorrows()}
            />
          ) : (
            <TableMobile
              data={mobileTableDataMyBorrows}
              columns={mobileTableColumnMyBorrows}
              type="lighter"
              emptyText={t('lending-my-borrows-empty')}
              hasMore={hasNextPageMyBorrows}
              handleMoreClick={fetchNextPageMyBorrows}
              handleClick={handleRowClick}
              overflow="visible"
            />
          )}
        </ContentWrapper>
      )}

      <ContentWrapper>
        <Title>{t('Assets to borrow')}</Title>
        {isMD ? (
          <Table
            data={tableDataAssetsToBorrow}
            columns={tableColumnsAssetsToBorrow}
            ratio={currentAddress ? [1, 1, 1, '94px'] : [1, 1, 1, '128px']}
            type="lighter"
            emptyText={t('lending-assets-to-borrow-empty')}
            hasMore={hasNextPageAssetsToBorrow}
            handleRowClick={handleRowClick}
            handleMoreClick={() => fetchNextPageAssetsToBorrow()}
          />
        ) : (
          <TableMobile
            data={mobileTableDataAssetsToBorrow}
            columns={mobileTableColumnAssetsToBorrow}
            type="lighter"
            emptyText={t('lending-assets-to-borrow-empty')}
            hasMore={hasNextPageAssetsToBorrow}
            handleMoreClick={fetchNextPageAssetsToBorrow}
            handleClick={handleRowClick}
          />
        )}
      </ContentWrapper>

      <Tooltip id={TOOLTIP_ID.LENDING_BORROW_APY} place="bottom">
        <TooltipContent>{t('lending-borrow-apy-tooltip')}</TooltipContent>
      </Tooltip>

      <Tooltip id={TOOLTIP_ID.LENDING_BORROW_BORROW_POWER_USED} place="bottom">
        <TooltipContent>{t('lending-borrow-borrow-power-used-tooltip')}</TooltipContent>
      </Tooltip>

      <Tooltip id={TOOLTIP_ID.LENDING_BORROW_APY_TYPE} place="bottom">
        <TooltipContent>{t('lending-borrow-apy-type-tooltip')}</TooltipContent>
      </Tooltip>

      <Tooltip id={TOOLTIP_ID.LENDING_BORROW_AVAIABLE} place="bottom">
        <TooltipContent>{t('lending-borrow-available-tooltip')}</TooltipContent>
      </Tooltip>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24
`;
const ContentWrapper = tw.div`
  flex flex-col gap-24 rounded-12 bg-neutral-10
  pt-16 px-20 pb-20
  md:(px-24 pt-20 pb-24)
`;

const Title = tw.div`
  font-b-18 text-neutral-100
  md:(font-b-20)
`;

const CardWrapper = tw.div`
  flex gap-16 flex-col
  md:(flex-row)
`;

const TooltipContent = tw.div`
  w-266
`;
