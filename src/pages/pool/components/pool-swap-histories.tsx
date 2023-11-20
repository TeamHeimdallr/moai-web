import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
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
      <TitleWrapper>
        <Title>{t('Swaps')}</Title>
        <Icon opened={opened} onClick={() => open(prev => !prev)}>
          <ButtonIconLarge icon={<IconDown />} />
        </Icon>
      </TitleWrapper>
      {opened && (
        <TableWrapper>
          <Table data={tableData} columns={tableColumns} ratio={[2, 3, 2, 2]} type="lighter" />
          {hasNextPage && (
            <LoadMoreWrapper onClick={() => fetchNextPage()}>
              Load more <IconDown width={20} height={20} fill={COLOR.NEUTRAL[60]} />
            </LoadMoreWrapper>
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
const LoadMoreWrapper = tw.div`
  px-24 py-20 flex-center gap-6 font-m-14 text-neutral-60 bg-neutral-15 clickable
`;
