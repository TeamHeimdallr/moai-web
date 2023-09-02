import tw from 'twin.macro';

import { Table } from '~/components/tables';
import { useTableSwap } from '~/hooks/components/tables/use-table-swap';
import { PoolInfo, SwapTable } from '~/types/components';

interface Props {
  pool: PoolInfo;
}
export const Swap = ({ pool }: Props) => {
  const { data, columns } = useTableSwap(pool.id);

  return (
    <Wrapper>
      <Title>Swaps</Title>
      <Table<SwapTable> data={data} columns={columns} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24
`;

const Title = tw.div`
  font-b-20 text-neutral-100
`;
