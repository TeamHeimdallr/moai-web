import tw from 'twin.macro';

import { Tab } from '~/components/tab';
import { useTableLiquidityPool } from '~/hooks/components/tables/use-table-liquidity-pool';

export const Tables = () => {
  const compositionTabs = [
    { key: 'total', name: 'Total compositon' },
    { key: 'my', name: 'My pool share' },
  ];

  useTableLiquidityPool();
  return (
    <Wrapper>
      <TableWrapper>
        <Title>Pool composition</Title>
        <Tab tabs={compositionTabs} />
      </TableWrapper>

      <TableWrapper></TableWrapper>

      <TableWrapper></TableWrapper>
    </Wrapper>
  );
};
const Wrapper = tw.div`flex flex-col gap-80`;
const TableWrapper = tw.div`flex flex-col gap-24`;
const Title = tw.div``;
