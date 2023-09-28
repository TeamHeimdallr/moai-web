import { useState } from 'react';
import tw from 'twin.macro';

import { BASE_URL_SUBROUTE, TOKEN } from '~/constants';

import { FilterChip } from '~/components/filter-chip';
import { Table } from '~/components/tables';
import { Toggle } from '~/components/toggle';

import { useTableLiquidityPool } from '../hooks/use-table-liquidity-pool';

export const LiquidityPoolLayout = () => {
  const { data, columns } = useTableLiquidityPool();

  const handleRowClick = (chain: string, id: string) => {
    window.open(`${BASE_URL_SUBROUTE(chain)}/pools/${id}`);
  };

  const tokens = [TOKEN.MOAI, TOKEN.XRP, TOKEN.ROOT, TOKEN.WETH];

  // TODO : connect selecting all chian api
  const [selectedAll, selectAll] = useState(true);

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>Liquidity pools</Title>
        <AllChainToggle>
          All suported chains
          <Toggle selected={selectedAll} onClick={() => selectAll(prev => !prev)} />
        </AllChainToggle>
      </TitleWrapper>
      <TableWrapper>
        <BadgeWrapper>
          {tokens.map(token => (
            <FilterChip key={token} token={token} selected={false} />
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
