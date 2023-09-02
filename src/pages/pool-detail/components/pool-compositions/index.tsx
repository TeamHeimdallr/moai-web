import tw from 'twin.macro';

import { Tab } from '~/components/tab';
import { Table } from '~/components/tables';
import { useTableTotalComposition } from '~/hooks/components/tables/use-table-total-composition';
import { PoolCompositionTable, PoolInfo } from '~/types/components';

interface Props {
  pool: PoolInfo;
}
export const PoolCompositions = ({ pool }: Props) => {
  const tabs = [
    { key: 'total-composition', name: 'Total composition' },
    { key: 'my-composition', name: 'My pool share' },
  ];
  const { data, columns } = useTableTotalComposition(pool.id);

  return (
    <Wrapper>
      <Title>Pool composition</Title>
      <Tab tabs={tabs} selectedTab={'total-composition'} />
      <Table<PoolCompositionTable> data={data} columns={columns} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24
`;

const Title = tw.div`
  font-b-20 text-neutral-100
`;
