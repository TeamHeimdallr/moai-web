import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { useGetAllMarkets } from '~/api/api-contract/lending/get-all-markets';
import { useUserAccountSnapshotAll } from '~/api/api-contract/lending/user-account-snapshot-all';

import { IconInfinity, IconNext, IconQuestion } from '~/assets/icons';

import { ASSET_URL, MILLION } from '~/constants';

import { ButtonIconMedium, ButtonIconSmall } from '~/components/buttons';
import { Tooltip } from '~/components/tooltips/base';

import { APYLarge } from '~/pages/lending/components/apy';
import { InfoCard } from '~/pages/lending/components/info-card';
import { titleMap } from '~/pages/lending/data';

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
import { calcHealthFactor, calcLtv, calcNetApy, calcNetworth } from '~/utils/util-lending';
import { POPUP_ID, TOOLTIP_ID } from '~/types';

import { MarketInfoCurrentLTVPopup } from '../components/market-info-current-ltv-popup';
import { MarketInfoHealthFactorPopup } from '../components/market-info-health-factor-popup';

export const LayoutMarketInfo = () => {
  const { ref } = useGAInView({ name: 'lending-main-info' });
  const { t } = useTranslation();

  const { evm, fpass } = useConnectedWallet();
  const evmAddress = evm?.address || fpass?.address;

  const { selectedNetwork } = useNetwork();
  const networkAbbr = getNetworkAbbr(selectedNetwork);
  const backgroundUrl = `${ASSET_URL}/images/network-${networkAbbr}.png`;

  const { open: openHealthFactorPopup, opened: healthFactorPopupOpened } = usePopup(
    POPUP_ID.LENDING_HEALTH_FACTOR
  );
  const { open: openCurrentLTVPopup, opened: currentLTVPopupOpened } = usePopup(
    POPUP_ID.LENDING_CURRENT_LTV
  );

  const { markets: markets } = useGetAllMarkets();
  const { accountSnapshots: snapshots, refetch: _refetchSnapshot } = useUserAccountSnapshotAll();

  const netAPY = calcNetApy({ markets, snapshots });

  const healthFactor = calcHealthFactor({ markets, snapshots });
  const currentLTV = calcLtv({ markets, snapshots });
  const netWorth = calcNetworth({ markets, snapshots });

  const healthFactorCriteria = 3;
  const healthFactorColor = calculateHealthFactorColor(healthFactor);

  const currentLTVCriteria = 75;
  const currentLTVColor = calculateCurrentLTVColor(currentLTV.ltv);

  const handleHealthFactorClick = () => openHealthFactorPopup();
  const handleCurrentLTVClick = () => openCurrentLTVPopup();

  return (
    <Wrapper ref={ref}>
      <HeaderWrapper>
        <LogoWrapper style={{ backgroundImage: `url(${backgroundUrl})` }} />
        <Title>{`${titleMap[selectedNetwork]} Market`}</Title>
      </HeaderWrapper>
      {evmAddress && netWorth > 0 && (
        <InfoWrapper>
          <InfoInnerWrapper>
            <InfoCard title={t('Net Worth')} value={`$${formatNumber(netWorth)}`} />
            <InfoCard
              title={t('Net APY')}
              value={<APYLarge apy={netAPY} />}
              titleIcon={
                <ButtonIconSmall
                  icon={<IconQuestion />}
                  data-tooltip-id={TOOLTIP_ID.LENDING_NET_APY}
                />
              }
            />
          </InfoInnerWrapper>
          {currentLTV.ltv !== 0 && (
            <InfoInnerWrapper>
              <InfoCard
                title={t('Health Factor')}
                iconButton={
                  <ButtonIconMedium icon={<IconNext />} onClick={handleHealthFactorClick} />
                }
                value={`${isFinite(healthFactor) ? formatNumber(healthFactor) : ''}`}
                valueIcon={
                  isFinite(healthFactor) ? undefined : (
                    <IconInfinity width={30} height={30} fill={healthFactorColor} />
                  )
                }
                valueColor={`${healthFactorColor}`}
              />
              <InfoCard
                title={t('Current LTV')}
                iconButton={
                  <ButtonIconMedium icon={<IconNext />} onClick={handleCurrentLTVClick} />
                }
                value={`${formatNumber(currentLTV.ltv)}%`}
                valueColor={`${currentLTVColor}`}
              />
            </InfoInnerWrapper>
          )}
          <Tooltip id={TOOLTIP_ID.LENDING_NET_APY} place="bottom">
            <TooltipContent>{t('net-apy')}</TooltipContent>
          </Tooltip>
          {healthFactorPopupOpened && (
            <MarketInfoHealthFactorPopup
              healthFactor={healthFactor}
              criteria={healthFactorCriteria}
            />
          )}
          {currentLTVPopupOpened && (
            <MarketInfoCurrentLTVPopup
              assets={currentLTV.assets}
              debt={currentLTV.debts}
              criteria={currentLTVCriteria}
            />
          )}
        </InfoWrapper>
      )}
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
  font-b-20 text-neutral-100
  md:(font-b-24)
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
