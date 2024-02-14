import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';

import { IconDown } from '~/assets/icons';

import { ButtonIconLarge } from '~/components/buttons';
import { Tab } from '~/components/tab';
import { Table } from '~/components/tables';
import { TableMobile } from '~/components/tables/table-mobile';

import { useTableLiquidityProvision } from '~/pages/pool/hooks/components/table/use-table-liquidity-provisions';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { useTablePoolLiquidityProvisionSelectTabStore } from '~/states/components/table/tab';

export const PoolLiquidityProvisions = () => {
  const { ref } = useGAInView({ name: 'pool-detail-liquidity-provision' });
  const { gaAction } = useGAAction();

  const { network } = useParams();

  const { isMD } = useMediaQuery();
  const { t } = useTranslation();

  const { selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { currentAddress } = useConnectedWallet(currentNetwork);

  const { selectedTab, selectTab } = useTablePoolLiquidityProvisionSelectTabStore();
  const [opened, open] = useState(false);

  const tabs = [
    { key: 'total-provision', name: 'All liquidity provision' },
    { key: 'my-provision', name: 'My liquidity' },
  ];

  const {
    tableColumns,
    tableData,
    mobileTableColumn,
    mobileTableData,
    hasMyLiquidityProvision,
    hasNextPage,
    fetchNextPage,
  } = useTableLiquidityProvision();

  const hasMyLiquidity = !!currentAddress && hasMyLiquidityProvision;

  return (
    <Wrapper opened={opened} ref={ref}>
      <TitleWrapper
        onClick={() => {
          gaAction({
            action: 'pool-detail-liquidity-provision-open',
            data: { page: 'pool-detail', component: 'liquidity-provision', open: !opened },
          });

          open(prev => !prev);
        }}
      >
        <Title>{t('Liquidity provision')}</Title>
        <Icon opened={opened}>
          <ButtonIconLarge icon={<IconDown />} />
        </Icon>
      </TitleWrapper>
      {opened && (
        <>
          {hasMyLiquidity && (
            <Tab
              tabs={tabs}
              selectedTab={selectedTab}
              onClick={key => {
                gaAction({
                  action: 'pool-detail-liquidity-provision-tab',
                  data: { page: 'pool-detail', component: 'liquidity-provision', tab: key },
                });
                selectTab(key);
              }}
            />
          )}
          <TableWrapper>
            {isMD ? (
              <Table
                data={tableData}
                columns={tableColumns}
                ratio={[2, 3, 2, 2]}
                type="lighter"
                hasMore={hasNextPage}
                handleMoreClick={fetchNextPage}
              />
            ) : (
              <TableMobile
                data={mobileTableData}
                columns={mobileTableColumn}
                type="lighter"
                hasMore={hasNextPage}
                handleMoreClick={fetchNextPage}
              />
            )}
          </TableWrapper>
        </>
      )}
    </Wrapper>
  );
};

interface DivProps {
  opened?: boolean;
}
const Wrapper = styled.div<DivProps>(({ opened }) => [
  opened ? tw`pb-16 md:(pb-24)` : tw`pb-16 md:(pb-20)`,
  tw`
    flex flex-col gap-24 bg-neutral-10 rounded-12 px-20
    md:(px-24)
  `,
]);
const TitleWrapper = tw.div`
  flex justify-between pt-16 items-center
  md:(pt-20)
`;
const Title = tw.div`
  font-b-18 text-neutral-100
  md:(font-b-20)
`;

const Icon = styled.div<DivProps>(({ opened }) => [
  tw`
    p-0 transition-transform flex-center clickable
    md:(p-4)
  `,
  css`
    transform: rotate(${opened ? '-180deg' : '0deg'});
  `,
]);

const TableWrapper = tw.div`
  flex flex-col
`;
