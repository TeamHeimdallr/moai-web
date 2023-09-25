import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { Table } from '~/components/tables';

import { CURRENT_CHAIN } from '~/moai-evm/constants';

import { useTableMyLiquidity } from '~/moai-evm/hooks/components/tables/use-table-my-liquidity-pool';
import { MyLiquidityPoolTable } from '~/moai-evm/types/components';

import { useConnectEvmWallet } from '~/moai-evm/hooks/data/use-connect-evm-wallet';

export const MyLiquidityLayout = () => {
  const { address } = useConnectEvmWallet();
  const { data, columns, empty } = useTableMyLiquidity();
  const navigate = useNavigate();

  const handleRowClick = (id?: string) => {
    navigate(`/pools/${id}`);
  };

  if (!address || empty) return <></>;
  return (
    <Wrapper>
      <TitleWrapper>
        <Title>My liquidity in Moai pools</Title>
      </TitleWrapper>
      <Table<MyLiquidityPoolTable>
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
