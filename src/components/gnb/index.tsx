import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import { IconMenu } from '~/assets/icons';
import LogoText from '~/assets/logos/logo-text.svg?react';

import { GNB_MENU } from '~/constants';

import { ButtonPrimaryMedium, ButtonPrimarySmallBlack } from '~/components/buttons/primary';
import { TooltipCommingSoon } from '~/components/tooltips/comming-soon';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useBanner } from '~/hooks/components/use-banner';
import { usePopup } from '~/hooks/components/use-popup';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { useWalletConnectorTypeStore } from '~/states/contexts/wallets/connector-type';
import { POPUP_ID, TOOLTIP_ID } from '~/types';

import { Account } from '../account';
import { AlertBanner } from '../alerts/banner';
import { BadgeGnbNew } from '../badges/new-gnb';
import { LanguageChange } from '../language-change';
import { MobileMenu } from '../menu-mobile';
import { NetworkSelection } from '../network-selection';

export const Gnb = () => {
  const { gaAction } = useGAAction();

  const navigate = useNavigate();
  const location = useLocation();

  const { isMLG } = useMediaQuery();

  const { open, opened } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { opened: openedBanner } = usePopup(POPUP_ID.WALLET_ALERT);

  const { network } = useParams();
  const { selectedNetwork } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { evm, xrp } = useConnectedWallet();
  const { text, type: bannerType, connectWallet, switchNetwork } = useBanner();

  const { setWalletConnectorType } = useWalletConnectorTypeStore();

  const { t } = useTranslation();

  const [mobileMenuOpened, mobileMenuOpen] = useState<boolean>(false);

  const currentGnbMenu = GNB_MENU.filter(menu => menu.network.includes(selectedNetwork)).filter(
    menu => menu.show
  );

  const handleConnetWallet = () => {
    connectWallet();
    gaAction({
      action: 'connect-wallet',
      buttonType: 'primary-small-black',
      text: 'Connect wallet',
      data: { component: 'gnb' },
    });
  };

  const handleSwitchNetwork = () => {
    switchNetwork();
    gaAction({
      action: 'switch-network',
      buttonType: 'primary-small-black',
      text: 'Switch network',
      data: { component: 'gnb' },
    });
  };

  const handleLogoClick = () => {
    navigate('/');
    gaAction({
      action: 'logo-click',
      buttonType: 'custom-button',
      data: { component: 'gnb', linkTo: '/' },
    });
  };

  return (
    <>
      <Wrapper>
        {/* SWITCH NETWORK BANNER */}
        {openedBanner && (
          <BannerWrapper>
            <AlertBanner
              text={text}
              button={
                <ButtonPrimarySmallBlack
                  text={bannerType === 'select' ? t('Connect wallet') : t('Switch network')}
                  onClick={bannerType === 'select' ? handleConnetWallet : handleSwitchNetwork}
                />
              }
            />
          </BannerWrapper>
        )}

        <NavWrapper>
          <LogoWrapper>
            <LogoText width={isMLG ? 88 : 70} height={isMLG ? 20 : 16} onClick={handleLogoClick} />
          </LogoWrapper>
          <ContentWrapper>
            {isMLG &&
              currentGnbMenu.map(({ id, text, path, showNew, disabled, commingSoon }) => (
                <MenuWrapper
                  key={id}
                  onClick={() => {
                    if (disabled || commingSoon) return;
                    navigate(path);
                    gaAction({
                      action: 'gnb-menu-click',
                      buttonType: 'custom-button',
                      data: { component: 'gnb', linkTo: path, name: text, disabled, commingSoon },
                    });
                  }}
                  selected={
                    location.pathname === '/'
                      ? id === 'pool'
                      : location.pathname.replace('/', '').includes(id)
                  }
                  disabled={!!disabled}
                  data-tooltip-id={commingSoon ? TOOLTIP_ID.COMMING_SOON : undefined}
                >
                  {text}
                  {showNew && (
                    <BadgeWrapper>
                      <BadgeGnbNew />
                    </BadgeWrapper>
                  )}
                </MenuWrapper>
              ))}
            <ButtonWrapper>
              {evm.address || xrp.address ? (
                <ConnectedButton>
                  <Account />
                </ConnectedButton>
              ) : (
                <ButtonPrimaryMedium
                  style={{ padding: isMLG ? '9px 24px' : '9px 16px' }}
                  text={t('Connect wallet')}
                  isLoading={!!opened}
                  onClick={() => {
                    setWalletConnectorType({ network: currentNetwork });
                    open();
                    gaAction({
                      action: 'connect-wallet',
                      buttonType: 'primary-medium',
                      data: { component: 'gnb', network: currentNetwork },
                    });
                  }}
                />
              )}
              {isMLG && <NetworkSelection />}
              {isMLG && <LanguageChange />}
              {!isMLG && (
                <HamburgerWrapper onClick={() => mobileMenuOpen(true)}>
                  <IconMenu width={24} />
                </HamburgerWrapper>
              )}
            </ButtonWrapper>
          </ContentWrapper>
        </NavWrapper>
        {mobileMenuOpened && <MobileMenu closeMenu={() => mobileMenuOpen(false)} />}
      </Wrapper>
      <TooltipCommingSoon place="bottom" id={TOOLTIP_ID.COMMING_SOON} />
    </>
  );
};

const Wrapper = styled.div(() => [tw`flex items-center flex-col w-full z-20 bg-transparent`]);
const BannerWrapper = tw.div`
  w-full
`;
const NavWrapper = tw.div`
  w-full flex items-center justify-between 
  px-20 py-16
  mlg:(px-24 py-20)
`;
const LogoWrapper = tw.div`
  clickable h-20
`;

const ContentWrapper = tw.div`
  flex items-center gap-24
`;

const ConnectedButton = tw.div`
  flex gap-4 
  mlg:(gap-8)
`;

interface MenuProps {
  selected: boolean;
  disabled: boolean;
}
const MenuWrapper = styled.div(({ selected, disabled }: MenuProps) => [
  tw`text-white clickable font-b-16 relative`,
  disabled ? tw`non-clickable text-neutral-60` : tw`hover:text-primary-80`,
  !disabled && selected && tw`text-primary-60 hover:text-primary-60`,
]);

const ButtonWrapper = tw.div`
  flex 
  gap-4 
  mlg:(gap-8)
`;

const HamburgerWrapper = tw.div`
  flex-center p-8 rounded-10 bg-neutral-10 clickable
  hover:(bg-neutral-20)
`;

const BadgeWrapper = styled.div(() => [tw`absolute -top-3 -right-18`]);
