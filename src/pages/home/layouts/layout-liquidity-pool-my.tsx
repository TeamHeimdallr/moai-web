import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { Table } from '~/components/tables';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkAbbr } from '~/utils';
import { NETWORK, POPUP_ID } from '~/types';

import { useTableMyLiquidityPool } from '../hooks/components/table/use-table-liquidity-pool-my';

interface Meta {
  network: NETWORK;
  id: string;
  poolId: string;
}
export const MyLiquidityLayout = () => {
  const { tableColumns, tableData } = useTableMyLiquidityPool();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { open: popupOpen } = usePopup(POPUP_ID.NETWORK_ALERT);
  const { selectedNetwork, setTargetNetwork } = useNetwork();

  const handleRowClick = (meta?: Meta) => {
    if (!meta) return;
    if (selectedNetwork !== meta.network) {
      popupOpen();
      setTargetNetwork(meta.network as NETWORK);
      return;
    }
    navigate(`/pools/${getNetworkAbbr(meta.network)}/${meta.poolId}`);
  };

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>{t('My liquidity in Moai pools')}</Title>
      </TitleWrapper>
      <Table
        data={tableData}
        columns={tableColumns}
        ratio={[2, 1, 1, 1]}
        type="darker"
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
