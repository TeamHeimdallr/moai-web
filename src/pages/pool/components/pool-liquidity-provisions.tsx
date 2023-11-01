import { useState } from 'react';
import tw, { css, styled } from 'twin.macro';

import { IconDown } from '~/assets/icons';

import { ButtonIconLarge } from '~/components/buttons';
import { Tab } from '~/components/tab';
import { Table } from '~/components/tables';

import { useTableTotalProvision } from '~/pages/pool/hooks/components/table/use-table-total-provisions';

import { useConnectedWallet } from '~/hooks/wallets';
import { useTablePoolLiquidityProvisionSelectTabStore } from '~/states/components/table/tab';
import { IPool } from '~/types';

interface Props {
  pool: IPool;
}
export const PoolLiquidityProvisions = ({ pool }: Props) => {
  const { selectedTab, selectTab } = useTablePoolLiquidityProvisionSelectTabStore();
  const { evm, xrp } = useConnectedWallet();
  const address = evm?.address || xrp?.address;

  const [opened, open] = useState(false);

  const tabs = [
    { key: 'total-provision', name: 'All liquidity provision' },
    { key: 'my-provision', name: 'My liquidity' },
  ];
  const { data, columns, filteredData } = useTableTotalProvision(pool.id);
  const hasLiquidity = filteredData.filter(data => data.liquidityProvider === address).length > 0;

  return (
    <Wrapper opened={opened}>
      <TitleWrapper>
        <Title>Liquidity Provision</Title>
        <Icon opened={opened} onClick={() => open(prev => !prev)}>
          <ButtonIconLarge icon={<IconDown />} />
        </Icon>
      </TitleWrapper>
      {opened && (
        <>
          {hasLiquidity && <Tab tabs={tabs} selectedTab={selectedTab} onClick={selectTab} />}
          <Table data={data} columns={columns} ratio={[2, 3, 2, 2]} type="lighter" />
        </>
      )}
    </Wrapper>
  );
};

interface DivProps {
  opened?: boolean;
}
const Wrapper = styled.div<DivProps>(({ opened }) => [
  opened ? tw`pb-24` : tw`pb-20`,
  tw`flex flex-col gap-24 bg-neutral-10 rounded-12 px-24`,
]);
const TitleWrapper = tw.div`flex justify-between pt-20 items-center`;
const Title = tw.div`
  font-b-20 text-neutral-100
`;

const Icon = styled.div<DivProps>(({ opened }) => [
  tw`p-2 transition-transform flex-center clickable`,
  css`
    transform: rotate(${opened ? '-180deg' : '0deg'});
  `,
]);
