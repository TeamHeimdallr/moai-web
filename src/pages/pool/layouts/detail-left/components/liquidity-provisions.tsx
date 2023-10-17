import { useEffect } from 'react';
import tw from 'twin.macro';

import { Tab } from '~/components/tab';
import { Table } from '~/components/tables';

import { useTableTotalProvision } from '~/pages/pool/hooks/components/table/use-table-total-provisions';

import { useConnectedWallet } from '~/hooks/wallets';
import { useTablePoolLiquidityProvisionSelectTabStore } from '~/states/components/table/tab';
import { IPool } from '~/types';

interface Props {
  pool: IPool;
}
export const LiquidityProvisions = ({ pool }: Props) => {
  const { selectedTab, selectTab } = useTablePoolLiquidityProvisionSelectTabStore();
  const { evm, xrp } = useConnectedWallet();
  const address = evm?.address ?? xrp?.address;

  const tabs = address
    ? [
        { key: 'total-provision', name: 'All liquidity provision' },
        { key: 'my-provision', name: 'My liquidity' },
      ]
    : [{ key: 'total-provision', name: 'All liquidity provision' }];

  const { data, columns } = useTableTotalProvision(pool.id);

  useEffect(() => {
    if (!address) selectTab('total-provision');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <Wrapper>
      <Title>Liquidity Provision</Title>
      <Tab tabs={tabs} selectedTab={selectedTab} onClick={selectTab} />
      <Table data={data} columns={columns} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24
`;

const Title = tw.div`
  font-b-20 text-neutral-100
`;
