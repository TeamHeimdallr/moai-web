import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { Table } from '~/components/tables';

import { useTableLiquidityMy } from '../hooks/components/table/use-table-liquidity-pool-my';

export const MyLiquidityLayout = () => {
  const { data, columns } = useTableLiquidityMy();

  const navigate = useNavigate();

  const handleRowClick = (_chain?: string, id?: string) => {
    navigate(`/pools/${id}`);
  };

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>My liquidity in Moai pools</Title>
      </TitleWrapper>
      <Table
        data={data}
        columns={columns}
        ratio="2111"
        type="darker"
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
