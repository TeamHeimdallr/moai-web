import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import tw, { css } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { COLOR } from '~/assets/colors';
import { IconLink } from '~/assets/icons';
import LogoLanding from '~/assets/logos/logo-landing.svg?react';

import { ButtonPrimaryLarge, ButtonPrimaryMedium } from '~/components/buttons';
import { Footer } from '~/components/footer';

import { useMediaQuery } from '~/hooks/utils';

export const Contents = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const { isSMD, isMLG } = useMediaQuery();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [footerShowing, footerShow] = useState(false);
  useOnClickOutside(dropdownRef, () => setDropdownOpen(false));

  const handleMainnetClick = () => {
    window.open('https://app.moai-finance.xyz/');
    setDropdownOpen(false);
  };

  const handleDevnetClick = () => {
    window.open('https://app-devnet.moai-finance.xyz/');
    setDropdownOpen(false);
  };

  const logoSize = isMLG
    ? { width: '691px', height: '60px' }
    : isSMD
    ? { width: '461px', height: '40px' }
    : { width: '276px', height: '24px' };
  const scale = isMLG ? 0.33 : isSMD ? 0.45 : 0.67;

  return (
    <Wrapper
      initial={{ top: isSMD ? '320px' : '240px' }}
      animate={{ top: '160px' }}
      transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.6, delay: 0.4 }}
      onAnimationComplete={() => footerShow(true)}
    >
      <LogoWrapper
        initial={{ scale: 1 }}
        animate={{ scale: scale }}
        transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.6, delay: 0.4 }}
      >
        <LogoLanding width={logoSize.width} height={logoSize.height} />
      </LogoWrapper>
      <BottomWrapper
        initial={{ opacity: 0, translateY: '50%' }}
        animate={{ opacity: 1, translateY: '0%' }}
        transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.6, delay: 0.4 }}
      >
        <TextMain>
          Your Universal
          <br />
          Gateway to the
          <br />
          Multi-chain Liquidity
        </TextMain>
        <ButtonWrapper>
          {isSMD ? (
            <ButtonPrimaryLarge
              text={t('Get started')}
              buttonType="outlined"
              onClick={() => setDropdownOpen(true)}
            />
          ) : (
            <ButtonPrimaryMedium
              text={t('Get started')}
              buttonType="outlined"
              onClick={() => setDropdownOpen(true)}
            />
          )}

          {dropdownOpen && (
            <DropdownWrapper ref={dropdownRef}>
              <Dropdown onClick={handleDevnetClick}>
                Devnet
                <IconLink
                  width={isSMD ? 20 : 16}
                  height={isSMD ? 20 : 16}
                  color={COLOR.NEUTRAL[100]}
                />
              </Dropdown>
              <Dropdown onClick={handleMainnetClick}>
                Mainnet
                <IconLink
                  width={isSMD ? 20 : 16}
                  height={isSMD ? 20 : 16}
                  color={COLOR.NEUTRAL[100]}
                />
              </Dropdown>
            </DropdownWrapper>
          )}
        </ButtonWrapper>
        {footerShowing && (
          <FooterWrapper>
            <Footer />
          </FooterWrapper>
        )}
      </BottomWrapper>
    </Wrapper>
  );
};
const Wrapper = styled(motion.div)(() => [
  tw`
    absolute w-full flex flex-col justify-center items-center z-0
    top-240 gap-24
    smd:(top-320)
    mlg:(gap-40)
  `,
]);
const LogoWrapper = styled(motion.div)(() => [
  tw`
    w-276 h-24 flex-center
    smd:(w-461 h-40)
    mlg:(w-691 h-60)
  `,
]);
const BottomWrapper = styled(motion.div)(() => [
  tw`
    w-full flex flex-col justify-center items-center
    top-240 gap-24
    smd:(top-320)
    mlg:(gap-40)
  `,
]);

const ButtonWrapper = tw.div`
  relative
  w-110
  smd:(w-140)
`;

const DropdownWrapper = styled.div(() => [
  tw`
    flex-center flex-col p-8 rounded-8 gap-2 bg-neutral-15 absolute left-0
    top-48 w-110
    smd:(top-56 w-140)
  `,
  css`
    box-shadow: 0px 4px 24px 0px rgba(25, 27, 40, 0.6);
  `,
]);

const Dropdown = tw.div`
  w-full flex items-center justify-between flex-1 text-neutral-100 rounded-8 clickable py-8
  hover:(bg-neutral-20)

  pl-8 pr-4 gap-2 font-r-14
  smd:(pl-12 pr-8 gap-8 font-r-16)
`;

const TextMain = tw.div`
  text-center text-neutral-100 
  w-full font-eb-32
  smd:(font-eb-60 leading-64)
  mlg:(w-800 font-eb-80)
`;

const FooterWrapper = styled(motion.div)(() => [tw`absolute w-full -bottom-490`]);
