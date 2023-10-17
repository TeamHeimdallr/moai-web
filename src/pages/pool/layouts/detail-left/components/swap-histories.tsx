import tw from 'twin.macro';

import { Table } from '~/components/tables';

import { useTableSwapHistories } from '~/pages/pool/hooks/components/table/use-table-swap-histories';

import { IPool } from '~/types';

interface Props {
  pool: IPool;
}
export const SwapHistories = ({ pool }: Props) => {
  const { data, columns } = useTableSwapHistories(pool.id);

  return (
    <Wrapper>
      <Title>Swaps</Title>
      <Table data={data} columns={columns} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24
`;

const Title = tw.div`
  font-b-20 text-neutral-100
`;
