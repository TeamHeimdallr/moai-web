import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { IconNext, IconQuestion } from '~/assets/icons';

import { ASSET_URL } from '~/constants';

import { ButtonIconMedium, ButtonIconSmall } from '~/components/buttons';
import { Tooltip } from '~/components/tooltips/base';

import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import {
  calculateCurrentLTVColor,
  calculateHealthFactorColor,
  formatNumber,
  getNetworkAbbr,
} from '~/utils';
import { NETWORK, POPUP_ID, TOOLTIP_ID } from '~/types';

import { MarketInfoCard } from './market-info-card';
import { MarketInfoCurrentLTVPopup } from './market-info-current-ltv-popup';
import { MarketInfoHealthFactorPopup } from './market-info-health-factor-popup';

export const MarketInfo = () => {
  const { ref } = useGAInView({ name: 'lending-main-info' });
  const { t } = useTranslation();

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = evm?.address || fpass?.address || 'test';

  const { selectedNetwork } = useNetwork();
  const networkAbbr = getNetworkAbbr(selectedNetwork);
  const backgroundUrl = `${ASSET_URL}/images/network-${networkAbbr}.png`;

  const titleMap = {
    [NETWORK.THE_ROOT_NETWORK]: 'The Root Network',
    [NETWORK.XRPL]: 'XRPL',
    [NETWORK.EVM_SIDECHAIN]: 'Evm Sidechain',
  };

  const { open: openHealthFactorPopup, opened: healthFactorPopupOpened } = usePopup(
    POPUP_ID.LENDING_HEALTH_FACTOR
  );
  const { open: openCurrentLTVPopup, opened: currentLTVPopupOpened } = usePopup(
    POPUP_ID.LENDING_CURRENT_LTV
  );

  // TODO: connect contract & api
  const netWorth = 104492.5;
  const netAPY = 1.05129392;
  const healthFactor = 100000 / 42000;
  const currentLTV = (42000 / 100000) * 100;

  const healthFactorCriteria = 3;
  const healthFactorColor = calculateHealthFactorColor(healthFactor);

  const currentLTVCriteria = 75;
  const currentLTVColor = calculateCurrentLTVColor(currentLTV);

  const handleHealthFactorClick = () => openHealthFactorPopup();
  const handleCurrentLTVClick = () => openCurrentLTVPopup();

  return (
    <Wrapper ref={ref}>
      <HeaderWrapper>
        <LogoWrapper style={{ backgroundImage: `url(${backgroundUrl})` }} />
        <Title>{`${titleMap[selectedNetwork]} Market`}</Title>
      </HeaderWrapper>
      <InfoWrapper>
        <InfoInnerWrapper>
          <MarketInfoCard title={t('Net Worth')} value={`$${formatNumber(netWorth, 2)}`} />
          <MarketInfoCard
            title={t('Net APY')}
            value={`${formatNumber(netAPY, 2)}%`}
            titleIcon={
              <ButtonIconSmall
                icon={<IconQuestion />}
                data-tooltip-id={TOOLTIP_ID.LENDING_NET_APY}
              />
            }
          />
        </InfoInnerWrapper>
        {evmAddress && (
          <InfoInnerWrapper>
            <MarketInfoCard
              title={t('Health Factor')}
              iconButton={
                <ButtonIconMedium icon={<IconNext />} onClick={handleHealthFactorClick} />
              }
              value={`${formatNumber(healthFactor, 1)}`}
              valueColor={`${healthFactorColor}`}
            />
            <MarketInfoCard
              title={t('Current LTV')}
              iconButton={<ButtonIconMedium icon={<IconNext />} onClick={handleCurrentLTVClick} />}
              value={`${formatNumber(currentLTV, 2)}%`}
              valueColor={`${currentLTVColor}`}
            />
          </InfoInnerWrapper>
        )}

        <Tooltip id={TOOLTIP_ID.LENDING_NET_APY} place="bottom">
          <TooltipContent>{t('net-apy')}</TooltipContent>
        </Tooltip>

        {healthFactorPopupOpened && (
          <MarketInfoHealthFactorPopup
            assets={100000}
            debt={42000}
            criteria={healthFactorCriteria}
          />
        )}
        {currentLTVPopupOpened && (
          <MarketInfoCurrentLTVPopup assets={100000} debt={42000} criteria={currentLTVCriteria} />
        )}
      </InfoWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24
`;

const HeaderWrapper = tw.div`
  flex items-center gap-16 px-20
  md:(px-0)
`;

const LogoWrapper = tw.div`
  w-40 h-40 bg-center bg-no-repeat bg-cover
`;

const Title = tw.div`
  font-b-24 text-neutral-100
`;

const InfoWrapper = tw.div`
  flex flex-col gap-16
  md:(flex-row)
`;

const InfoInnerWrapper = tw.div`
  flex flex-1 gap-16
`;

const TooltipContent = tw.div`
  w-266
`;
