import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { IconLink } from '~/assets/icons';

import { ButtonIconMedium } from '~/components/buttons';

import { InfoCard } from '~/pages/lending/components/info-card';

import { formatNumber } from '~/utils';

export const AssetInfo = () => {
  const { t } = useTranslation();

  // TODO: connect to API
  const reserveSize = 239845000;
  const availableLiquidity = 68908000;
  const utilizationRate = (availableLiquidity / reserveSize) * 100;
  const oraclePrice = 0.582378;

  const handleOracleLink = () => {};

  return (
    <Wrapper>
      <InnerWrapper>
        <InfoCard
          title={t('Reserve Size')}
          value={`$${formatNumber(reserveSize, 4, 'floor', 1000)}`}
        />
        <InfoCard
          title={t('Available Liquidity')}
          value={`$${formatNumber(availableLiquidity, 4, 'floor', 1000)}`}
        />
      </InnerWrapper>
      <InnerWrapper>
        <InfoCard
          title={t('Utilization Rate')}
          value={`${formatNumber(utilizationRate, 2, 'floor', 1000)}%`}
        />
        <InfoCard
          title={t('Oracle Price')}
          value={`$${formatNumber(oraclePrice, 4, 'floor', 1000)}`}
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
