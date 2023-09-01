import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { Table } from '~/components/tables';
import { CURRENT_CHAIN } from '~/constants';
import { useTableMyLiquidity } from '~/hooks/components/tables/use-table-my-liquidity';
import { MyLiquidityTable } from '~/types/components';

export const MyLiquidityLayout = () => {
  const { data, columns } = useTableMyLiquidity();
  const navigate = useNavigate();

  const handleRowClick = (id?: string) => {
    navigate(`/pools/${id}`);
  };

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>My liquidity in Moai pools</Title>
      </TitleWrapper>
      <Table<MyLiquidityTable>
        data={data}
        columns={columns}
        emptyText={`You have no unsktaked liquidity on ${CURRENT_CHAIN}`}
        handleRowClick={handleRowClick}
      />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24
`;

const TitleWrapper = tw.div`
  h-40 flex gap-10 items-center w-full
`;

const Title = tw.div`
  font-b-24 text-neutral-100 flex-1
`;
