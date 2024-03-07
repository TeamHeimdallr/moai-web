import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { Address, formatUnits } from 'viem';

import { useGetInterestRateModel } from '~/api/api-contract/_evm/lending/get-interest-rate-model';
import { useGetMarket } from '~/api/api-contract/_evm/lending/get-market';
import { useGetUnderlyingPrice } from '~/api/api-contract/_evm/lending/underlying-price';

import { IconLink } from '~/assets/icons';

import { LENDING_ORACLE_ADDRESS, MILLION, SCANNER_URL } from '~/constants';

import { ButtonIconMedium } from '~/components/buttons';

import { InfoCard } from '~/pages/lending/components/info-card';

import { useNetwork } from '~/hooks/contexts/use-network';
import { formatNumber } from '~/utils';
import { NETWORK } from '~/types';

export const AssetInfo = () => {
  const { t } = useTranslation();
  const { address } = useParams();

  const { selectedNetwork } = useNetwork();
  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;

  const { market } = useGetMarket({
    marketAddress: address as Address,
  });
  const { totalReserves, price, underlyingDecimals, cash } = market || {};

  const { price: oraclePrice } = useGetUnderlyingPrice({
    mTokenAddress: (address as Address) ?? '0x0',
  });

  const { utilizationRate } = useGetInterestRateModel({
    marketAddress: address as Address,
  });

  const totalReservesNum = Number(formatUnits(totalReserves || 0n, underlyingDecimals || 18));
  const totalReservesValue = totalReservesNum * (price || 0);
  const totalCashNum = Number(formatUnits(cash || 0n, underlyingDecimals || 18));
  const totalCashValue = totalCashNum * (price || 0);
  const utilizationRateNum = 100 * utilizationRate;

  const handleOracleLink = () => {
    window.open(
      `${SCANNER_URL[NETWORK.THE_ROOT_NETWORK]}/${isRoot ? 'addresses' : 'address'}/${
        LENDING_ORACLE_ADDRESS[NETWORK.THE_ROOT_NETWORK]
      }${isRoot ? '/evm-transactions' : ''}`
    );
  };

  return (
    <Wrapper>
      <InnerWrapper>
        <InfoCard title={t('Reserve Size')} value={`$${formatNumber(totalReservesValue)}`} />
        <InfoCard
          title={t('Available Liquidity')}
          value={`$${formatNumber(totalCashValue, 2, 'floor', MILLION, 2)}`}
        />
      </InnerWrapper>
      <InnerWrapper>
        <InfoCard title={t('Utilization Rate')} value={`${formatNumber(utilizationRateNum)}%`} />
        <InfoCard
          title={t('Oracle Price')}
          titleIcon={<ButtonIconMedium icon={<IconLink />} onClick={handleOracleLink} />}
          titleIconNarrow={false}
          value={`$${formatNumber(oraclePrice, 2, 'floor', MILLION, 6)}`}
        />
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
