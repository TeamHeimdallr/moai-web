import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { TOKEN, TOKEN_IMAGE_MAPPER } from '~/constants';

import { Table } from '~/components/tables';
import { Toggle } from '~/components/toggle';

import { CURRENT_CHAIN } from '~/moai-xrp-root/constants';

import { useTableLiquidityPool } from '~/moai-xrp-root/hooks/components/tables/use-table-liquidity-pool';
import { LiquidityPoolTable } from '~/moai-xrp-root/types/components';

import { useConnectWallet } from '~/moai-xrp-root/hooks/data/use-connect-wallet';

export const LiquidityPoolLayout = () => {
  const { address } = useConnectWallet();
  const { data, columns } = useTableLiquidityPool();
  const navigate = useNavigate();

  const handleRowClick = (id?: string) => {
    navigate(`/pools/${id}`);
  };

  const emptyText = !address ? `Please connect wallet` : `No liquidity pools on ${CURRENT_CHAIN}`;
  const tokens = [TOKEN.MOAI, TOKEN.XRP, TOKEN.ROOT, TOKEN.WETH];

  // TODO : connect filter api
  const [selected, select] = useState(true);

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>Liquidity pools</Title>
        <AllChainToggle>
          All suported chains
          <Toggle selected={selected} onClick={() => select(prev => !prev)} />
        </AllChainToggle>
      </TitleWrapper>
      <TableWrapper>
        <BadgeWrapper>
          {tokens.map(token => (
            <Badge key={token}>
              <Image src={TOKEN_IMAGE_MAPPER[token]} /> {token}
            </Badge>
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
const Badge = tw.div`flex gap-8 items-center font-r-16 text-neutral-80`;
const Image = tw.img`w-20 h-20 rounded-10 bg-black`;
