import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { formatUnits } from 'viem';

import { useUserLpFarmDeposited } from '~/api/api-contract/_evm/balance/lp-farm-balance';
import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';
import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';
import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { COLOR } from '~/assets/colors';
import { IconFarming } from '~/assets/icons';
import { imageMoai2 } from '~/assets/images';

import { LP_FARM_ADDRESS_WITH_POOL_ID, TRILLION } from '~/constants';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useNetwork } from '~/hooks/contexts/use-network';
import { formatNumber, getNetworkAbbr, getNetworkFull } from '~/utils';
import { NETWORK, TOOLTIP_ID } from '~/types';

export const PoolInfo = () => {
  const { ref } = useGAInView({ name: 'pool-detail-info' });
  const { network, id } = useParams();
  const { selectedNetwork } = useNetwork();
  const { t } = useTranslation();

  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;

  const queryEnabled = !!network && !!id;
  const { data } = useGetPoolQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetwokrAbbr = getNetworkAbbr(currentNetwork);

  const { pool } = data || {};
  const { poolId, value, volume, apr, tradingFee: tradingFeeRaw } = pool || {};
  const protocolFee = 0.0005;
  const tradingFee =
    currentNetwork === NETWORK.THE_ROOT_NETWORK ? tradingFeeRaw + protocolFee : tradingFeeRaw;

  const farmAddress = LP_FARM_ADDRESS_WITH_POOL_ID?.[NETWORK.THE_ROOT_NETWORK]?.[poolId ?? ''];
  const isLpFarmExisted = isRoot && farmAddress && farmAddress !== '0x0';

  const rootAddress = '0xcCcCCccC00000001000000000000000000000000';
  const { data: tokenData } = useGetTokenQuery(
    { queries: { networkAbbr: currentNetwokrAbbr, address: rootAddress } },
    { enabled: !!rootAddress && !!currentNetwokrAbbr }
  );
  const { token: rootToken } = tokenData || {};

  const { lpTokenPrice } = useUserPoolTokenBalances({
    network: 'trn',
    id: id ?? '',
  });
  const { rewardPerBlockRaw, totalDeposited } = useUserLpFarmDeposited({
    farmAddress,
    enabled: isLpFarmExisted,
  });

  const blocktime = 4; // TRN's blocktime
  const rewardValuesInYear =
    (365 *
      24 *
      60 *
      60 *
      Number(formatUnits(rewardPerBlockRaw || 0n, 6)) *
      (rootToken?.price || 0)) /
    blocktime;
  const totalDepositedValue = totalDeposited * lpTokenPrice;
  const _formattedFarmApr =
    totalDepositedValue !== 0
      ? formatNumber((100 * rewardValuesInYear) / totalDepositedValue, 0, 'round', TRILLION, 0)
      : Infinity;
  const formattedFarmApr = isLpFarmExisted ? `${_formattedFarmApr}%` : '';

  const formattedValue = value ? `$${formatNumber(value)}` : '$0';
  const formattedVolume = volume ? `$${formatNumber(volume)}` : '$0';

  const formattedApr = apr ? `${formatNumber(apr)}%` : '0%'; // swap apr
  const formattedFees = tradingFee ? `${formatNumber(tradingFee * 100)}%` : '0%';

  return (
    <Wrapper ref={ref}>
      <InnerWrapper>
        <PoolInfoCard name={t('Pool Value')} value={formattedValue} />
        <PoolInfoCard name={t('Volume (24h)')} value={formattedVolume} />
      </InnerWrapper>
      <InnerWrapper>
        <PoolInfoCard
          name={t('APR')}
          value={formattedApr}
          subValue={`+ ${t('Moai Points')}`}
          subValue2={formattedFarmApr ? `+ ${formattedFarmApr}` : ''}
        />
        <PoolInfoCard name={t('Trading Fee')} value={formattedFees} />
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex gap-16 flex-col
  md:(flex-row)
`;
const InnerWrapper = tw.div`
  flex flex-1 gap-16
`;

interface PoolInfoCardProps {
  name: string;
  value: string;

  subValue?: string;
  subValueIcon?: ReactNode;

  subValue2?: string;
  subValueIcon2?: ReactNode;

  hoverable?: boolean;
}
const PoolInfoCard = ({
  name,
  value,
  subValue,
  subValueIcon = <MoaiIcon src={imageMoai2} />,
  subValue2,
  subValueIcon2 = <IconFarming width={16} height={16} fill={COLOR.GREEN[50]} />,
  hoverable,
}: PoolInfoCardProps) => {
  return (
    <PoolInfoCardWrapper>
      <Name>{name}</Name>
      <ValueWrapper data-tooltip-id={hoverable ? TOOLTIP_ID.APR : undefined}>
        <Value>{value}</Value>
        {(subValue || subValue2) && (
          <SubValueOuterWrapper>
            {subValue && (
              <SubValueWrapper>
                {subValue}
                {subValueIcon}
              </SubValueWrapper>
            )}
            {subValue2 && (
              <SubValueWrapper>
                {subValue2}
                {subValueIcon2}
              </SubValueWrapper>
            )}
          </SubValueOuterWrapper>
        )}
      </ValueWrapper>
    </PoolInfoCardWrapper>
  );
};
const PoolInfoCardWrapper = tw.div`
  w-full flex flex-1 flex-col items-start bg-neutral-10 rounded-12
  py-16 px-20 gap-12
  md:(py-20 px-24 gap-16)
`;

const Name = tw.div`
  font-m-14 text-neutral-80
  md:(font-m-16)
`;

const ValueWrapper = tw.div`
  flex flex-col gap-2
`;

const Value = tw.div`
  font-m-18 text-neutral-100
  md:(font-m-20)
`;

const SubValueWrapper = tw.div`
  flex items-center gap-4
  font-r-14 text-neutral-80
`;

const SubValueOuterWrapper = tw.div`
  flex flex-col
`;

const MoaiIcon = tw.img`
  w-16 h-16 flex-center flex-shrink-0 rounded-full overflow-hidden
`;
