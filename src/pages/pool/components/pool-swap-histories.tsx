import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { IconDown } from '~/assets/icons';

import { ButtonIconLarge } from '~/components/buttons';
import { Table } from '~/components/tables';

import { useTableSwapHistories } from '~/pages/pool/hooks/components/table/use-table-swap-histories';

export const PoolSwapHistories = () => {
  const [opened, open] = useState(false);

  const { tableColumns, tableData, hasNextPage, fetchNextPage } = useTableSwapHistories();

  const { t } = useTranslation();

  return (
    <Wrapper opened={opened}>
      <TitleWrapper onClick={() => open(prev => !prev)}>
        <Title>{t('Swaps')}</Title>
        <Icon opened={opened}>
          <ButtonIconLarge icon={<IconDown />} />
        </Icon>
      </TitleWrapper>
      {opened && (
        <TableWrapper>
          <Table
            data={tableData}
            columns={tableColumns}
            ratio={[2, 3, 2, 2]}
            type="lighter"
            hasMore={hasNextPage}
            handleMoreClick={() => fetchNextPage()}
          />
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
const TitleWrapper = tw.div`flex justify-between items-center pt-20`;
const Title = tw.div`
  font-b-20 text-neutral-100
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
