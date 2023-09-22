import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { IconNext } from '~/assets/icons';

import { ButtonPrimaryMediumIconTrailing } from '~/components/buttons/primary';
import { Table } from '~/components/tables';

import { CHAIN, CURRENT_CHAIN } from '~/moai-evm/constants';

import { useTableLiquidityPool } from '~/moai-evm/hooks/components/tables/use-table-liquidity-pool';
import { LiquidityPoolTable } from '~/moai-evm/types/components';

import { useConnectWallet } from '~/moai-evm/hooks/data/use-connect-wallet';

export const LiquidityPoolLayout = () => {
  const { address } = useConnectWallet();
  const { data, columns } = useTableLiquidityPool();
  const navigate = useNavigate();

  const handleRowClick = (id?: string) => {
    navigate(`/pools/${id}`);
  };

  const emptyText =
    CHAIN === 'root' && !address
      ? `Please connect wallet`
      : `No liquidity pools on ${CURRENT_CHAIN}`;

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>Liquidity pools</Title>
        <ButtonPrimaryMediumIconTrailing text="Create a pool" icon={<IconNext />} disabled />
      </TitleWrapper>
      <Table<LiquidityPoolTable>
        data={data}
        columns={columns}
        emptyText={emptyText}
        handleRowClick={handleRowClick}
      />
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
