import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import { IconMenu } from '~/assets/icons';
import LogoText from '~/assets/logos/logo-text.svg?react';

import { GNB_MENU } from '~/constants';

import { ButtonPrimaryMedium, ButtonPrimarySmallBlack } from '~/components/buttons/primary';
import { Notification } from '~/components/notification';
import { TooltipCommingSoon } from '~/components/tooltips/comming-soon';

import { useBanner } from '~/pages/home/hooks/components/alert-wallet/use-banner';

import { usePopup } from '~/hooks/components/use-popup';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { NETWORK, POPUP_ID, TOOLTIP_ID } from '~/types';

import { Account } from '../account';
import { AlertBanner } from '../alerts/banner';
import { LanguageChange } from '../language-change';
import { MobileMenu } from '../menu-mobile';
import { NetworkSelection } from '../network-selection';

export const Gnb = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLG } = useMediaQuery();
  const { open, opened } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { opened: openedBanner } = usePopup(POPUP_ID.WALLET_ALERT);
  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const { setWalletType } = useWalletTypeStore();

  const { evm, xrp } = useConnectedWallet();
  const { text, connectWallet } = useBanner();

  const { t } = useTranslation();

  const [mobileMenuOpened, mobileMenuOpen] = useState<boolean>(false);

  return (
    <>
      <Wrapper>
        <BannerWrapper>
          {openedBanner && (
            <AlertBanner
              text={text}
              button={
                <ButtonPrimarySmallBlack text={t('Connect wallet')} onClick={connectWallet} />
              }
            />
          )}
        </BannerWrapper>
        <NavWrapper>
          <LogoWrapper>
            <LogoText
              width={isLG ? 88 : 70}
              height={isLG ? 20 : 16}
              onClick={() => navigate('/')}
            />
          </LogoWrapper>
          <ContentWrapper>
            {isLG &&
              GNB_MENU.map(({ id, text, path, disabled, commingSoon }) => (
                <MenuWrapper
                  key={id}
                  onClick={() => navigate(path)}
                  selected={location.pathname === path}
                  disabled={!!disabled}
                  data-tooltip-id={commingSoon ? TOOLTIP_ID.COMMING_SOON : undefined}
                >
                  {text}
                </MenuWrapper>
              ))}
            <ButtonWrapper>
              {evm.address || xrp.address ? (
                <ConnectedButton>
                  <Notification />
                  <Account />
                </ConnectedButton>
              ) : (
                <ButtonPrimaryMedium
                  style={{ padding: isLG ? '9px 24px' : '9px 16px' }}
                  text={t('Connect wallet')}
                  isLoading={!!opened}
                  onClick={() => {
                    setWalletType({
                      evm: currentNetwork !== NETWORK.XRPL,
                      xrpl: currentNetwork === NETWORK.XRPL,
                    });
                    open();
                  }}
                />
              )}
              {isLG && <NetworkSelection />}
              {isLG && <LanguageChange />}
              {!isLG && (
                <HamburgerWrapper onClick={() => mobileMenuOpen(true)}>
                  <IconMenu width={24} />
                </HamburgerWrapper>
              )}
            </ButtonWrapper>
          </ContentWrapper>
        </NavWrapper>
        {mobileMenuOpened && <MobileMenu open={mobileMenuOpen} />}
      </Wrapper>
      <TooltipCommingSoon place="bottom" id={TOOLTIP_ID.COMMING_SOON} />
    </>
  );
};

const Wrapper = styled.div(() => [tw`flex items-center flex-col w-full z-20 bg-transparent`]);
const BannerWrapper = tw.div`w-full`;
const NavWrapper = tw.div`flex items-center justify-between px-24 py-20 w-full`;
const LogoWrapper = tw.div`clickable h-20`;

const ContentWrapper = tw.div`
  flex items-center gap-24
`;

const ConnectedButton = tw.div`
  flex 
  sm:gap-4 
  md:gap-8
`;

interface MenuProps {
  selected: boolean;
  disabled: boolean;
}
const MenuWrapper = styled.div(({ selected, disabled }: MenuProps) => [
  tw`text-white clickable font-b-16`,
  disabled ? tw`non-clickable text-neutral-60` : tw`hover:text-primary-80`,
  !disabled && selected && tw`text-primary-60 hover:text-primary-60`,
]);

const ButtonWrapper = tw.div`
  flex 
  sm:(gap-4) 
  md:(gap-8)
`;

const HamburgerWrapper = tw.div`flex-center p-8 rounded-10 bg-neutral-10 clickable hover:(bg-neutral-20)`;
