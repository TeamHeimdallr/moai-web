import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { TOKEN } from '~/constants';

import { FilterChip } from '~/components/filter-chip';
import { Table } from '~/components/tables';
import { Toggle } from '~/components/toggle';

import { useConnectEvmWallet } from '~/hooks/wallets/use-connect-evm-wallet';

import { CURRENT_CHAIN } from '~/moai-xrp-root/constants';

import { useTableLiquidityPool } from '~/moai-xrp-root/hooks/components/tables/use-table-liquidity-pool';
import { LiquidityPoolTable } from '~/moai-xrp-root/types/components';

export const LiquidityPoolLayout = () => {
  const { address } = useConnectEvmWallet();
  const { data, columns } = useTableLiquidityPool();
  const navigate = useNavigate();

  const handleRowClick = (_chain?: string, id?: string) => {
    navigate(`/pools/${id}`);
  };

  const emptyText = !address ? `Please connect wallet` : `No liquidity pools on ${CURRENT_CHAIN}`;
  const tokens = [TOKEN.MOAI, TOKEN.XRP, TOKEN.ROOT, TOKEN.WETH];

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
            <FilterChip key={token} token={token} selected={false} />
          ))}
        </BadgeWrapper>
        <Table<LiquidityPoolTable>
          data={data}
          columns={columns}
          emptyText={emptyText}
          handleRowClick={handleRowClick}
        />
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
