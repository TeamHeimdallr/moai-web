import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { IconQuestion } from '~/assets/icons';

import { MILLION } from '~/constants';

import { ButtonIconSmall } from '~/components/buttons';
import { ButtonPrimaryLarge, ButtonPrimaryMedium } from '~/components/buttons/primary';
import { Tooltip } from '~/components/tooltips/base';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkAbbr, getNetworkFull } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { TOOLTIP_ID } from '~/types';

export const UserAssetInfo = () => {
  const { ref } = useGAInView({ name: 'lending-detail-user-asset-info' });
  const { gaAction } = useGAAction();

  const navigate = useNavigate();

  const { network, address } = useParams();
  const { t } = useTranslation();

  const { selectedNetwork, isFpass } = useNetwork();

  const { evm, fpass } = useConnectedWallet();
  const { isMD } = useMediaQuery();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const currentNetworkAbbr = getNetworkAbbr(currentNetwork);

  const walletAddress = isFpass ? fpass.address : evm.address;

  const { data: tokenData } = useGetTokenQuery(
    { queries: { networkAbbr: currentNetworkAbbr, address: address } },
    { enabled: !!address && !!currentNetworkAbbr }
  );
  const { token } = tokenData || {};
  const { symbol, price } = token || {};

  // TODO connect api
  const availableSupply = 123123;
  const availableSupplyValue = availableSupply * (price || 0);
  const availableBorrow = 234234;
  const availableBorrowValue = availableBorrow * (price || 0);

  const walletBalance = 345345;

  const handleSupply = () => {
    if (!token || !walletAddress || availableSupply <= 0) return;

    const link = `/lending/${network}/${address}/supply`;
    gaAction({
      action: 'go-to-lending-supply',
      data: { page: 'lending-detail', component: 'user-asset-info', asset: token },
    });
    navigate(link);
  };

  const handleBorrow = () => {
    if (!token || !walletAddress || availableBorrow <= 0) return;

    const link = `/lendgin/${network}/${address}/borrow`;
    gaAction({
      action: 'go-to-lending-borrow',
      data: { page: 'lending-detail', component: 'user-asset-info', asset: token },
    });
    navigate(link);
  };

  const ButtonPrimary = isMD ? ButtonPrimaryLarge : ButtonPrimaryMedium;
  return (
    <Wrapper ref={ref}>
      <Header>{t('My info')}</Header>
      <Divider />
      <InfoWrapper>
        <InfoHeader>
          {t('Available to supply')}
          <ButtonIconSmall
            icon={<IconQuestion />}
            data-tooltip-id={TOOLTIP_ID.LENDING_DETAIL_AVAILABLE_TO_SUPPLY}
          />
        </InfoHeader>
        <InfoContent>
          <InfoAmountWrapper>
            {formatNumber(availableSupply, 2, 'floor', MILLION, 2)} {symbol}
            <InfoAmountValue>
              {`$${formatNumber(availableSupplyValue, 2, 'floor', MILLION, 2)}`}
            </InfoAmountValue>
          </InfoAmountWrapper>
          <ButtonPrimary
            text={t('Supply')}
            onClick={handleSupply}
            style={{ width: isMD ? '105px' : '92px' }}
            disabled={!walletAddress || availableSupply <= 0}
          />
        </InfoContent>
      </InfoWrapper>
      <InfoWrapper>
        <InfoHeader>
          {t('Available to borrow')}
          <ButtonIconSmall
            icon={<IconQuestion />}
            data-tooltip-id={TOOLTIP_ID.LENDING_DETAIL_AVAILABLE_TO_BORROW}
          />
        </InfoHeader>
        <InfoContent>
          <InfoAmountWrapper>
            {formatNumber(availableBorrow, 2, 'floor', MILLION, 2)} {symbol}
            <InfoAmountValue>
              {`$${formatNumber(availableBorrowValue, 2, 'floor', MILLION, 2)}`}
            </InfoAmountValue>
          </InfoAmountWrapper>
          <ButtonPrimary
            text={t('Borrow')}
            onClick={handleBorrow}
            style={{ width: isMD ? '105px' : '92px' }}
            disabled={!walletAddress || availableBorrow <= 0}
          />
        </InfoContent>
      </InfoWrapper>
      <Footer>
        {t('Wallet balance')}
        <FooterBalance>{`${formatNumber(
          walletBalance,
          2,
          'floor',
          MILLION,
          2
        )} ${symbol}`}</FooterBalance>
      </Footer>
      <Tooltip id={TOOLTIP_ID.LENDING_DETAIL_AVAILABLE_TO_SUPPLY} place="bottom">
        <TooltipContent>{t('available-to-supply-description')}</TooltipContent>
      </Tooltip>
      <Tooltip id={TOOLTIP_ID.LENDING_DETAIL_AVAILABLE_TO_BORROW} place="bottom">
        <TooltipContent>{t('available-to-borrow-description')}</TooltipContent>
      </Tooltip>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full bg-neutral-10 rounded-12
`;

const Header = tw.div`
  py-16 px-20 flex items-center font-b-18 text-neutral-100
  md:(font-b-20 py-20 px-24)
`;

const InfoWrapper = tw.div`
  flex flex-col gap-8 px-20 py-12
  md:(px-24 py-16)
`;

const InfoHeader = tw.div`
  flex gap-2 items-center text-neutral-80 font-m-14
  md:(font-m-16)
`;

const InfoContent = tw.div`
  flex gap-4
`;

const InfoAmountWrapper = tw.div`
  flex flex-col gap-2 text-neutral-100 flex-1 font-m-18
  md:(font-m-20)
`;
const InfoAmountValue = tw.div`
  font-r-12 text-neutral-70
  md:(font-r-14)
`;

const Footer = tw.div`
  flex w-full items-center justify-between bg-neutral-15 rounded-b-12
  font-m-14 pt-16 px-20 pb-20 text-neutral-100
  md:(pt-20 px-24 pb-24 font-m-16)
`;

const FooterBalance = tw.div`
  font-m-18
  md:(font-m-20)
`;

const Divider = tw.div`
  flex h-1 bg-neutral-15
`;

const TooltipContent = tw.div`
  w-266
`;
