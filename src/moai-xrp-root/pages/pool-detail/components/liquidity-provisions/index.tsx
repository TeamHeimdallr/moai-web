import { useEffect } from 'react';
import tw from 'twin.macro';

import { Tab } from '~/components/tab';
import { Table } from '~/components/tables';

import { useConnectEvmWallet } from '~/hooks/data/use-connect-evm-wallet';
import { useSelectedLiquidityPoolProvisionTabStore } from '~/states/pages/selected-liquidity-pool-provision-tab';

import { useTableTotalProvision } from '~/moai-xrp-root/hooks/components/tables/use-table-total-provision';
import { LiquidityProvisionTable, PoolInfo } from '~/moai-xrp-root/types/components';

interface Props {
  pool: PoolInfo;
}
export const LiquidityProvisions = ({ pool }: Props) => {
  const { address } = useConnectEvmWallet();
  const tabs = address
    ? [
        { key: 'total-provision', name: 'All liquidity provision' },
        { key: 'my-provision', name: 'My liquidity' },
      ]
    : [{ key: 'total-provision', name: 'All liquidity provision' }];

  const { selected: selectedTab, select: selectTab } = useSelectedLiquidityPoolProvisionTabStore();

  const { data, columns } = useTableTotalProvision(pool.id);

  useEffect(() => {
    if (!address) selectTab('total-provision');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <Wrapper>
      <Title>Liquidity Provision</Title>
      <Tab tabs={tabs} selectedTab={selectedTab} onClick={selectTab} />
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
