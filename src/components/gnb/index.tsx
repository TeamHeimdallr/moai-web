import { useLocation, useNavigate } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import LogoText from '~/assets/logos/logo-text.svg?react';

import { GNB_MENU } from '~/constants';

import { ButtonPrimaryMedium } from '~/components/buttons/primary';
import { Notification } from '~/components/notification';
import { TooltipCommingSoon } from '~/components/tooltips/comming-soon';

import { usePopup } from '~/hooks/components/use-popup';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { POPUP_ID, TOOLTIP_ID } from '~/types';

import { Account } from '../account';
import { NetworkSelection } from '../network-selection';

export const Gnb = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { open, opened } = usePopup(POPUP_ID.CONNECT_WALLET);

  const { evm, xrp } = useConnectedWallet();
  const { setWalletType } = useWalletTypeStore();

  return (
    <>
      <Wrapper>
        <LogoText width={88} height={20} onClick={() => navigate('/')} />
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
      </Wrapper>
      <TooltipCommingSoon />
      <TooltipCommingSoon place="bottom" id={TOOLTIP_ID.COMMING_SOON_NETWORK_SELECTION} />
    </>
  );
};

const Wrapper = styled.div(() => [
  tw`flex items-center justify-between w-full px-24 py-20 z-20 bg-transparent`,
]);

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
