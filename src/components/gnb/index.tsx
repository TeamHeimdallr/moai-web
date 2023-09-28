import { useLocation, useNavigate } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';

import logo from '~/assets/logos/logo-text.svg';

import { GNB_MENU } from '~/constants';

import { ButtonPrimaryMedium } from '~/components/buttons/primary';
import { Notification } from '~/components/notification';
import { TooltipCommingSoon } from '~/components/tooltips/comming-soon';

import { useConnectEvmWallet } from '~/hooks/data/use-connect-evm-wallet';
import { useConnectXrplWallet } from '~/hooks/data/use-connect-xrpl-wallet';
import { usePopup } from '~/hooks/pages/use-popup';
import { POPUP_ID, TOOLTIP_ID } from '~/types';

import { AccountProfile } from '../account-profile';

export const Gnb = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { open } = usePopup(POPUP_ID.WALLET);
  const { isConnected: gemConnected, address: gemAddress } = useConnectXrplWallet();
  const { isConnected: metamaskConnected, address: metamaskAddress } = useConnectEvmWallet();

  return (
    <>
      <Wrapper>
        <LogoWrapper src={logo} alt="Moai" onClick={() => navigate('/')} />
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
          {metamaskConnected || gemConnected ? (
            <ConnectedButton>
              <Notification />
              <AccountProfile
                bothConnected={metamaskConnected && gemConnected}
                gemAddress={gemAddress}
                metamaskAddress={metamaskAddress}
              />
            </ConnectedButton>
          ) : (
            <ButtonPrimaryMedium
              style={{ padding: '9px 24px' }}
              text="Connect wallet"
              onClick={open}
            />
          )}
        </ContentWrapper>
      </Wrapper>
      <TooltipCommingSoon />
    </>
  );
};

const Wrapper = styled.div(() => [
  tw`flex items-center justify-between w-full px-20 py-20`,
  css`
    background: rgba(28, 32, 51, 0.01);
  `,
]);

const LogoWrapper = tw.img`
  flex-center object-cover h-28
`;

const ContentWrapper = tw.div`
  flex items-center gap-40
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
