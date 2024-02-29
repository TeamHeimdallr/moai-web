import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { Address, formatEther, formatUnits } from 'viem';

import { useGetUnderlyingPrice } from '~/api/api-contract/_evm/lending/underlying-price';
import { useGetAllMarkets } from '~/api/api-contract/lending/get-all-markets';

import { IconLink } from '~/assets/icons';

import { MILLION } from '~/constants';

import { ButtonIconMedium } from '~/components/buttons';

import { InfoCard } from '~/pages/lending/components/info-card';

import { formatNumber } from '~/utils';

export const AssetInfo = () => {
  const { t } = useTranslation();
  const { address } = useParams();

  const { markets } = useGetAllMarkets();
  const market = markets.find(m => m.address === address);
  const { totalReserves, totalSupply, totalBorrows, utilizationRate, price, decimals } =
    market || {};

  // TODO: connect to API
  const { price: oraclePrice } = useGetUnderlyingPrice({
    mTokenAddress: (address as Address) ?? '0x0',
  });

  const totalReservesNum = Number(formatEther(totalReserves || 0n));
  const totalSupplyNum = Number(formatUnits(totalSupply || 0n, decimals || 18));
  const totalborrowNum = Number(formatUnits(totalBorrows || 0n, decimals || 18));
  const utilizationRateNum = Number(utilizationRate);

  const handleOracleLink = () => {};

  return (
    <Wrapper>
      <InnerWrapper>
        <InfoCard title={t('Reserve Size')} value={`$${formatNumber(totalReservesNum)}`} />
        <InfoCard
          title={t('Available Liquidity')}
          value={`$${formatNumber(
            (totalSupplyNum - totalborrowNum) * (price || 0),
            2,
            'floor',
            MILLION,
            2
          )}`}
        />
      </InnerWrapper>
      <InnerWrapper>
        <InfoCard title={t('Utilization Rate')} value={`${formatNumber(utilizationRateNum)}%`} />
        <InfoCard
          title={t('Oracle Price')}
          value={`$${formatNumber(oraclePrice, 2, 'floor', MILLION, 2)}`}
          valueIcon={<ButtonIconMedium icon={<IconLink />} onClick={handleOracleLink} />}
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
