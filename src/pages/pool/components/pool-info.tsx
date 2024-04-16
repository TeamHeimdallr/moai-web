import { HTMLAttributes, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import tw, { styled } from 'twin.macro';
import { formatUnits } from 'viem';

import { useUserLpFarmDeposited } from '~/api/api-contract/_evm/balance/lp-farm-balance';
import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';
import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';
import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { COLOR } from '~/assets/colors';
import { IconFarming, IconNext, IconQuestion } from '~/assets/icons';
import { imageMoai2 } from '~/assets/images';

import { LP_FARM_ADDRESS_WITH_POOL_ID, TRILLION } from '~/constants';

import { ButtonIconMedium, ButtonIconSmall } from '~/components/buttons';
import { Tooltip } from '~/components/tooltips/base';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useNetwork } from '~/hooks/contexts/use-network';
import { formatNumber, getNetworkAbbr, getNetworkFull } from '~/utils';
import { NETWORK, TOOLTIP_ID } from '~/types';

export const PoolInfo = () => {
  const { ref } = useGAInView({ name: 'pool-detail-info' });
  const { network, id } = useParams();
  const { selectedNetwork } = useNetwork();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;
  const isXrpl = selectedNetwork === NETWORK.XRPL;

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

  const formattedValue = value ? `$${formatNumber(value)}` : '-';
  const formattedVolume = volume ? `$${formatNumber(volume)}` : '-';

  const formattedApr = apr ? `${formatNumber(apr)}%` : '-'; // swap apr
  const formattedFees = tradingFee ? `${formatNumber(tradingFee * 100)}%` : '-';

  return (
    <Wrapper ref={ref}>
      <InnerWrapper>
        <PoolInfoCard
          name={t('Pool Value')}
          value={formattedValue}
          valueIcon={
            isXrpl &&
            !value && (
              <ButtonIconMedium
                icon={<IconQuestion />}
                data-tooltip-id={TOOLTIP_ID.XRPL_NO_ESTIMATE_VALUE}
              />
            )
          }
        />
        <PoolInfoCard
          name={t('Volume (24h)')}
          value={formattedVolume}
          valueIcon={
            isXrpl &&
            !value && (
              <ButtonIconMedium
                icon={<IconQuestion />}
                data-tooltip-id={TOOLTIP_ID.XRPL_NO_ESTIMATE_VALUE}
              />
            )
          }
        />
      </InnerWrapper>
      <InnerWrapper>
        <PoolInfoCard
          name={t('APR')}
          value={formattedApr}
          valueIcon={
            isXrpl &&
            !value && (
              <ButtonIconMedium
                icon={<IconQuestion />}
                data-tooltip-id={TOOLTIP_ID.XRPL_NO_ESTIMATE_VALUE}
              />
            )
          }
          subValue={isRoot ? `+ ${t('Moai Points')}` : undefined}
          subValue2={isRoot ? (formattedFarmApr ? `+ ${formattedFarmApr}` : '') : undefined}
        />
        <PoolInfoCard
          name={t('Trading Fee')}
          subValue={isXrpl ? t('Trading fee voting') : undefined}
          subValueIcon={
            isXrpl ? (
              <ButtonIconSmall icon={<IconNext />} onClick={() => navigate(`fee-voting`)} />
            ) : undefined
          }
          value={formattedFees}
          hover
          onClick={() => navigate('fee-voting')}
        />
      </InnerWrapper>

      <TooltipWrapper>
        <Tooltip id={TOOLTIP_ID.XRPL_NO_ESTIMATE_VALUE} place="bottom">
          {t('Not enough data to estimate')}
        </Tooltip>
      </TooltipWrapper>
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

const TooltipWrapper = tw.div`
  absolute
`;

interface PoolInfoCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  value: string;
  valueIcon?: ReactNode;

  nameIcon?: ReactNode;

  subValue?: string;
  subValueIcon?: ReactNode;

  subValue2?: string;
  subValueIcon2?: ReactNode;

  hoverable?: boolean;
  hover?: boolean;
}
// NOTE: need to refactor
const PoolInfoCard = ({
  name,
  nameIcon,
  value,
  valueIcon,
  subValue,
  subValueIcon = <MoaiIcon src={imageMoai2} />,
  subValue2,
  subValueIcon2 = <IconFarming width={16} height={16} fill={COLOR.GREEN[50]} />,
  hoverable,
  hover,
  ...rest
}: PoolInfoCardProps) => {
  return (
    <PoolInfoCardWrapper hover={hover} {...rest}>
      <Name>
        {name}
        {nameIcon}
      </Name>
      <ValueWrapper data-tooltip-id={hoverable ? TOOLTIP_ID.APR : undefined}>
        <Value>
          {value}
          {valueIcon}
        </Value>
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

interface PoolInfoCardWrapperProps {
  hover?: boolean;
}
const PoolInfoCardWrapper = styled.div<PoolInfoCardWrapperProps>(({ hover }) => [
  tw`
  w-full flex flex-1 flex-col items-start bg-neutral-10 rounded-12 transition-colors
  py-16 px-20 gap-12
  md:(py-20 px-24 gap-16)
`,
  hover && tw`hover:(bg-neutral-15 clickable)`,
]);

const Name = tw.div`
  font-m-14 text-neutral-80 flex items-center justify-between
  md:(font-m-16)
`;

const ValueWrapper = tw.div`
  flex flex-col gap-2
`;

const Value = tw.div`
  flex gap-2 items-center font-m-18 text-neutral-100
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
