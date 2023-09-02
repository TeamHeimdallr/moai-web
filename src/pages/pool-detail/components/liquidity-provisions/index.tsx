import tw from 'twin.macro';

import { Tab } from '~/components/tab';
import { Table } from '~/components/tables';
import { useTableTotalProvision } from '~/hooks/components/tables/use-table-total-provision';
import { LiquidityProvisionTable, PoolInfo } from '~/types/components';

interface Props {
  pool: PoolInfo;
}
export const LiquidityProvisions = ({ pool }: Props) => {
  const tabs = [
    { key: 'total-provision', name: 'All liquidity provision' },
    { key: 'my-provision', name: 'My liquidity' },
  ];
  const { data, columns } = useTableTotalProvision(pool.id);

  return (
    <Wrapper>
      <Title>Liquidity Provision</Title>
      <Tab tabs={tabs} selectedTab={'total-provision'} />
      <Table<LiquidityProvisionTable> data={data} columns={columns} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24
`;

const Title = tw.div`
  font-b-20 text-neutral-100
`;
