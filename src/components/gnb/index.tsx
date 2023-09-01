import { useWeb3Modal } from '@web3modal/react';
import { useLocation, useNavigate } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';

import logo from '~/assets/logos/logo-text.svg';
import { Notification } from '~/components/notification';
import { useConnectWallet } from '~/hooks/data/use-connect-wallet';

import { AccountProfile } from '../account-profile/account-profile';
import { ButtonPrimaryMedium } from '../buttons/primary';

const MENU = [
  {
    id: 'pool',
    text: 'Pool',
    path: '/',
    disabled: false,
  },
  {
    id: 'swap',
    text: 'Swap',
    path: '/swap',
    disabled: false,
  },
  {
    id: 'launchpad',
    text: 'Launchpad',
    path: '/',
    disabled: true, // TODO: coming soon tooltip
  },
  {
    id: 'rewards',
    text: 'Rewards',
    path: '/',
    disabled: true, // TODO: coming soon tooltip
  },
];

export const Gnb = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected } = useConnectWallet();
  const { isOpen, open } = useWeb3Modal();

  return (
    <Wrapper>
      <LogoWrapper src={logo} alt="Moai" onClick={() => navigate('/')} />
      <ContentWrapper>
        {MENU.map(({ id, text, path, disabled }) => (
          <MenuWrapper
            key={id}
            onClick={() => navigate(path)}
            selected={location.pathname === path}
            disabled={disabled}
          >
            {text}
          </MenuWrapper>
        ))}
        {isConnected ? (
          <ConnectedButton>
            <Notification />
            <AccountProfile />
          </ConnectedButton>
        ) : (
          <ButtonPrimaryMedium
            style={{ padding: '9px 24px' }}
            text="Connect wallet"
            isLoading={isOpen}
            onClick={open}
          />
        )}
      </ContentWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div(() => [
  tw`fixed top-0 left-0 flex items-center justify-between w-full px-20 py-16 `,
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
