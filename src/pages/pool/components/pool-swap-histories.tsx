import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { IconDown } from '~/assets/icons';

import { ButtonIconLarge } from '~/components/buttons';
import { Table } from '~/components/tables';
import { TableMobile } from '~/components/tables/table-mobile';

import { useTableSwapHistories } from '~/pages/pool/hooks/components/table/use-table-swap-histories';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useMediaQuery } from '~/hooks/utils';

export const PoolSwapHistories = () => {
  const { ref } = useGAInView({ name: 'pool-detail-swap-histories' });
  const { gaAction } = useGAAction();

  const [opened, open] = useState(false);

  const {
    tableColumns,
    tableData,
    mobileTableData,
    mobileTableColumn,
    hasNextPage,
    fetchNextPage,
  } = useTableSwapHistories();

  const { isMD } = useMediaQuery();
  const { t } = useTranslation();

  return (
    <Wrapper opened={opened} ref={ref}>
      <TitleWrapper
        onClick={() => {
          gaAction({
            action: 'pool-detail-swap-histories-open',
            data: { page: 'pool-detail', component: 'swap-histories', open: !opened },
          });
          open(prev => !prev);
        }}
      >
        <Title>{t('Swaps')}</Title>
        <Icon opened={opened}>
          <ButtonIconLarge icon={<IconDown />} />
        </Icon>
      </TitleWrapper>
      {opened && (
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
      )}
    </Wrapper>
  );
};

interface DivProps {
  opened?: boolean;
}
const Wrapper = styled.div<DivProps>(({ opened }) => [
  opened ? tw`pb-24` : tw`pb-20`,
  tw`flex flex-col gap-24 bg-neutral-10 rounded-12 px-24`,
]);
const TitleWrapper = tw.div`
  flex justify-between items-center pt-20
`;
const Title = tw.div`
  font-b-18 text-neutral-100
  md:(font-b-20)
`;

const Icon = styled.div<DivProps>(({ opened }) => [
  tw`p-2 transition-transform flex-center clickable`,
  css`
    transform: rotate(${opened ? '-180deg' : '0deg'});
  `,
]);

const TableWrapper = tw.div`
  flex flex-col
`;
