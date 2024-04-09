import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { Table } from '~/components/tables';
import { TableMobile } from '~/components/tables/table-mobile';

import { useMediaQuery } from '~/hooks/utils';

import { useTableFeeVoting } from '../hooks/use-table-fee-voting';

export const VotingSlots = () => {
  const { t } = useTranslation();
  const { isMD } = useMediaQuery();

  const { tableColumns, tableData, mobileTableColumn, mobileTableData } = useTableFeeVoting();

  return (
    <Wrapper>
      <Title>{t('Vote slots')}</Title>
      <TableWrapper>
        {tableData &&
          mobileTableData &&
          (isMD ? (
            <Table
              data={tableData}
              columns={tableColumns}
              ratio={['48px', 1, 1, 1]}
              type="lighter"
            />
          ) : (
            <TableMobile data={mobileTableData} columns={mobileTableColumn} type="lighter" />
          ))}
      </TableWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24 pt-20 pb-24 px-24 rounded-12 bg-neutral-10
`;

const Title = tw.div`
  font-b-16 text-neutral-100
`;
const TableWrapper = tw.div``;
