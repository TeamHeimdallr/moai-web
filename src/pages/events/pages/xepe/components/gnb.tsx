import { useNavigate } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import LogoText from '~/assets/logos/logo-text.svg?react';

import { useMediaQuery } from '~/hooks/utils';

export const Gnb = () => {
  const navigate = useNavigate();
  const { isMLG } = useMediaQuery();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <>
      <Wrapper>
        <NavWrapper>
          <LogoWrapper>
            <LogoText width={isMLG ? 88 : 70} height={isMLG ? 20 : 16} onClick={handleLogoClick} />
          </LogoWrapper>
        </NavWrapper>
      </Wrapper>
    </>
  );
};

const Wrapper = styled.div(() => [tw`flex items-center flex-col w-full z-20 bg-transparent`]);

const NavWrapper = tw.div`
  w-full flex items-center justify-between 
  px-20 py-16
  mlg:(px-24 py-20)
`;
const LogoWrapper = tw.div`
  clickable h-20
`;
