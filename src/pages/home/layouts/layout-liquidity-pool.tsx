import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { ButtonChipFilter } from '~/components/buttons/chip/filter';
import { Table } from '~/components/tables';
import { Toggle } from '~/components/toggle';

import { useTableLiquidityPool } from '../hooks/components/table/use-table-liquidity-pool';

interface Meta {
  chain: string;
  id: string;
}
export const LiquidityPoolLayout = () => {
  const navigate = useNavigate();
  const { data, columns } = useTableLiquidityPool();

  const handleRowClick = (meta?: Meta) => {
    if (!meta) return;
    navigate(`/pools/${meta.chain}/${meta.id}`);
  };

  // TODO: pool 구성에 있는 토큰 리스트
  const tokens = [{ symbol: 'MOAI' }, { symbol: 'XRP' }, { symbol: 'ROOT' }, { symbol: 'WETH' }];

  // TODO : connect selecting all chian api
  const [selectedAll, selectAll] = useState(true);

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>Liquidity pools</Title>
        <AllChainToggle>
          All supported chains
          <Toggle selected={selectedAll} onClick={() => selectAll(prev => !prev)} />
        </AllChainToggle>
      </TitleWrapper>
      <TableWrapper>
        <BadgeWrapper>
          {tokens.map(token => (
            <ButtonChipFilter key={token.symbol} token={token} selected={false} />
          ))}
        </BadgeWrapper>
        <Table data={data} columns={columns} handleRowClick={handleRowClick} />
      </TableWrapper>
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
const AllChainToggle = tw.div`flex gap-10 font-m-16 text-neutral-100`;
const TableWrapper = tw.div`flex flex-col gap-24`;
const BadgeWrapper = tw.div`flex gap-16`;
