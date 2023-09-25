import { useEffect } from 'react';
import tw from 'twin.macro';

import { Tab } from '~/components/tab';
import { Table } from '~/components/tables';

import { useSelectedLiquidityPoolCompositionTabStore } from '~/states/pages/selected-liquidity-pool-composition-tab';

import { useTableTotalComposition } from '~/moai-evm/hooks/components/tables/use-table-total-composition';
import { PoolCompositionTable, PoolInfo } from '~/moai-evm/types/components';

import { useConnectEvmWallet } from '~/moai-evm/hooks/data/use-connect-evm-wallet';

interface Props {
  pool: PoolInfo;
}
export const PoolCompositions = ({ pool }: Props) => {
  const { address } = useConnectEvmWallet();
  const tabs = address
    ? [
        { key: 'total-composition', name: 'Total composition' },
        { key: 'my-composition', name: 'My pool share' },
      ]
    : [{ key: 'total-composition', name: 'Total composition' }];

  const { selected: selectedTab, select: selectTab } =
    useSelectedLiquidityPoolCompositionTabStore();

  const { data, columns } = useTableTotalComposition(pool.id);

  useEffect(() => {
    if (!address) selectTab('total-composition');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <Wrapper>
      <Title>Pool composition</Title>
      <Tab tabs={tabs} selectedTab={selectedTab} onClick={selectTab} />
      <Table<PoolCompositionTable> data={data} columns={columns} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24
`;

const Title = tw.div`
  font-b-20 text-neutral-100
`;
