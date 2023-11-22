import { useNavigate } from 'react-router-dom';
import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';

import { IconCancel } from '~/assets/icons';
import LogoText from '~/assets/logos/logo-text.svg?react';

import { GNB_MENU } from '~/constants';

import { TOOLTIP_ID } from '~/types';

import { ButtonIconLarge } from '../buttons';
import { Footer } from '../footer';
import { LanguageChange } from '../language-change';
import { NetworkSelection } from '../network-selection';
import { TooltipCommingSoon } from '../tooltips/comming-soon';

interface MobileMenuProps {
  closeMenu: () => void;
}

export const MobileMenu = ({ closeMenu }: MobileMenuProps) => {
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    closeMenu();
    navigate(path);
  };

  const handleCloseClick = () => {
    closeMenu();
  };

  return (
    <>
      <Dim onClick={handleCloseClick} />
      <Wrapper>
        <UpperWrapper>
          <HeaderWrapper>
            <LogoWrapper>
              <LogoText width={88} height={20} />
            </LogoWrapper>
            <ButtonWrapper>
              <NetworkSelection />
              <LanguageChange />
              <ButtonIconLarge
                icon={<IconCancel width={24} height={24} />}
                onClick={handleCloseClick}
              />
            </ButtonWrapper>
          </HeaderWrapper>
          <MenuWrapper>
            {GNB_MENU.map(({ id, text, path, disabled, commingSoon }) => (
              <Menu
                key={id}
                onClick={() => handleMenuClick(path)}
                selected={location.pathname === path}
                disabled={!!disabled}
                data-tooltip-id={commingSoon ? TOOLTIP_ID.COMMING_SOON : undefined}
              >
                {text}
              </Menu>
            ))}
          </MenuWrapper>
        </UpperWrapper>
        <Footer inMenu={true} />
      </Wrapper>
      <TooltipCommingSoon place="bottom" id={TOOLTIP_ID.COMMING_SOON} />
    </>
  );
};

const Wrapper = tw.div`
  fixed right-0 top-0 w-360 flex flex-col justify-between h-screen bg-neutral-10 z-12
`;
const UpperWrapper = tw.div`
  flex flex-col gap-40
`;
const HeaderWrapper = tw.div`
  flex items-center justify-between px-20 py-16
`;
const MenuWrapper = tw.div`
  flex flex-col gap-24 px-20
`;
const LogoWrapper = tw.div`
  clickable h-20
`;
const ButtonWrapper = tw.div`
  flex-center gap-8
`;
interface MenuProps {
  selected: boolean;
  disabled: boolean;
}
const Menu = styled.div(({ selected, disabled }: MenuProps) => [
  tw`w-fit text-white clickable font-b-16`,
  disabled ? tw`non-clickable text-neutral-60` : tw`hover:text-primary-60`,
  !disabled && selected && tw`text-primary-60`,
]);

const Dim = styled.div(() => [
  tw`
  fixed left-0 top-0 z-11 w-full h-full
`,
  css`
    background: rgba(25, 27, 40, 0.6);
    backdrop-filter: blur(4px);
  `,
]);
