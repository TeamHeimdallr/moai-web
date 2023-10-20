import { useEffect } from 'react';
import tw from 'twin.macro';

import { Tab } from '~/components/tab';
import { Table } from '~/components/tables';

import { useTableTotalComposition } from '~/pages/pool/hooks/components/table/use-table-total-composition';

import { useConnectedWallet } from '~/hooks/wallets';
import { useTablePoolCompositionSelectTabStore } from '~/states/components/table/tab';
import { IPool } from '~/types';

interface Props {
  pool: IPool;
}
export const PoolCompositions = ({ pool }: Props) => {
  const { selectedTab, selectTab } = useTablePoolCompositionSelectTabStore();
  const { evm, xrp } = useConnectedWallet();
  const address = evm?.address || xrp?.address;

  const tabs = address
    ? [
        { key: 'total-composition', name: 'Total composition' },
        { key: 'my-composition', name: 'My pool share' },
      ]
    : [{ key: 'total-composition', name: 'Total composition' }];

  const { data, columns } = useTableTotalComposition(pool.id);

  useEffect(() => {
    if (!address) selectTab('total-composition');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <Wrapper>
      <Title>Pool composition</Title>
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
