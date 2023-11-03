import { useLocation, useNavigate } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import LogoText from '~/assets/logos/logo-text.svg?react';

import { GNB_MENU } from '~/constants';

import { ButtonPrimaryMedium, ButtonPrimarySmallBlack } from '~/components/buttons/primary';
import { Notification } from '~/components/notification';
import { TooltipCommingSoon } from '~/components/tooltips/comming-soon';

import { useBanner } from '~/pages/home/hooks/components/alert-wallet/use-banner';

import { usePopup } from '~/hooks/components/use-popup';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { POPUP_ID, TOOLTIP_ID } from '~/types';

import { Account } from '../account';
import { AlertBanner } from '../alerts/banner';
import { NetworkSelection } from '../network-selection';

export const Gnb = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { open, opened } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { opened: openedBanner } = usePopup(POPUP_ID.WALLET_ALERT);

  const { evm, xrp } = useConnectedWallet();
  const { setWalletType } = useWalletTypeStore();
  const { text, connectWallet } = useBanner();

  return (
    <>
      <Wrapper>
        <BannerWrapper>
          {openedBanner && (
            <AlertBanner
              text={text}
              button={<ButtonPrimarySmallBlack text="Connect wallet" onClick={connectWallet} />}
            />
          )}
        </BannerWrapper>
        <NavWrapper>
          <LogoWrapper>
            <LogoText width={88} height={20} onClick={() => navigate('/')} />
          </LogoWrapper>
          <ContentWrapper>
            {GNB_MENU.map(({ id, text, path, disabled, commingSoon }) => (
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
                  style={{ padding: '9px 24px' }}
                  text="Connect wallet"
                  isLoading={!!opened}
                  onClick={() => {
                    setWalletType({ xrpl: true, evm: true });
                    open();
                  }}
                />
              )}
              <NetworkSelection />
            </ButtonWrapper>
          </ContentWrapper>
        </NavWrapper>
      </Wrapper>
      <TooltipCommingSoon />
      <TooltipCommingSoon place="bottom" id={TOOLTIP_ID.COMMING_SOON_NETWORK_SELECTION} />
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
  flex gap-8
`;

interface MenuProps {
  selected: boolean;
  disabled: boolean;
}
const MenuWrapper = styled.div(({ selected, disabled }: MenuProps) => [
  tw`text-white clickable font-b-16`,
  disabled ? tw`non-clickable text-neutral-60` : tw`hover:text-primary-60`,
  !disabled && selected && tw`text-primary-60`,
]);

const ButtonWrapper = tw.div`
  flex gap-8
`;
