import { Dispatch } from 'react';
import { useNavigate } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import { IconCancel, IconEnglish } from '~/assets/icons';
import LogoText from '~/assets/logos/logo-text.svg?react';

import { GNB_MENU } from '~/constants';

import { TOOLTIP_ID } from '~/types';

import { Footer } from '../footer';
import { TooltipCommingSoon } from '../tooltips/comming-soon';

interface MobileMenuProps {
  open: Dispatch<React.SetStateAction<boolean>>;
}

export const MobileMenu = ({ open }: MobileMenuProps) => {
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    open(false);
    navigate(path);
  };

  const handleCloseClick = () => {
    open(false);
  };

  return (
    <>
      <Wrapper>
        <UpperWrapper>
          <HeaderWrapper>
            <LogoWrapper>
              <LogoText width={88} height={20} />
            </LogoWrapper>
            <ButtonWrapper>
              <ButtonInnerWrapper>
                <IconEnglish width={24} height={24} />
              </ButtonInnerWrapper>
              <ButtonInnerWrapper onClick={handleCloseClick}>
                <IconCancel width={24} height={24} />
              </ButtonInnerWrapper>
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
        <Footer />
      </Wrapper>
      <TooltipCommingSoon place="bottom" id={TOOLTIP_ID.COMMING_SOON} />
    </>
  );
};

const Wrapper = tw.div`absolute flex flex-col justify-between w-full h-screen bg-neutral-5 overflow-hidden z-11`;
const UpperWrapper = tw.div`flex flex-col gap-40`;
const HeaderWrapper = tw.div`flex items-center justify-between px-20 py-16`;
const MenuWrapper = tw.div`flex flex-col gap-24 px-20`;
const LogoWrapper = tw.div`clickable h-20`;
const ButtonWrapper = tw.div`flex-center gap-8`;
const ButtonInnerWrapper = tw.div`flex-center w-40 h-40 clickable`;
interface MenuProps {
  selected: boolean;
  disabled: boolean;
}
const Menu = styled.div(({ selected, disabled }: MenuProps) => [
  tw`w-fit text-white clickable font-b-16`,
  disabled ? tw`non-clickable text-neutral-60` : tw`hover:text-primary-60`,
  !disabled && selected && tw`text-primary-60`,
]);
