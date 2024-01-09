import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';

import { COLOR } from '~/assets/colors';
import { IconLink } from '~/assets/icons';
import LogoText from '~/assets/logos/logo-text.svg?react';

import { ButtonPrimaryLarge, ButtonPrimaryMedium } from '~/components/buttons';
import { LanguageChange } from '~/components/language-change';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useMediaQuery } from '~/hooks/utils';

export const Gnb = () => {
  const { gaAction } = useGAAction();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isSMD } = useMediaQuery();
  const { t } = useTranslation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  useOnClickOutside(dropdownRef, () => setDropdownOpen(false));

  const openDropdown = () => {
    setDropdownOpen(true);

    gaAction({
      action: 'get-started',
      text: 'Get started',
      type: 'dropdown',
      buttonType: 'primary-large',
      data: {
        page: 'landing',
        component: 'gnb',
      },
    });
  };

  const handleMainnetClick = () => {
    window.open('https://app.moai-finance.xyz/');
    setDropdownOpen(false);

    gaAction({
      action: 'get-started--mainnet',
      text: 'mainnet',
      buttonType: 'custom-dropdown',
      data: { page: 'landing', lintTo: 'https://app.moai-finance.xyz/' },
    });
  };

  const handleDevnetClick = () => {
    window.open('https://app-devnet.moai-finance.xyz/');
    setDropdownOpen(false);

    gaAction({
      action: 'get-started--devnet',
      text: 'devnet',
      buttonType: 'custom-dropdown',
      data: { page: 'landing', lintTo: 'https://app-devnet.moai-finance.xyz/' },
    });
  };

  return (
    <Wrapper>
      <LogoWrapper>
        <LogoText width={88} height={20} />
      </LogoWrapper>
      <ButtonOuterWrapper>
        <ButtonWrapper>
          {isSMD ? (
            <ButtonPrimaryLarge
              text={t('Get started')}
              buttonType="filled"
              onClick={openDropdown}
            />
          ) : (
            <ButtonPrimaryMedium
              text={t('Get started')}
              buttonType="filled"
              onClick={openDropdown}
            />
          )}
        </ButtonWrapper>
        <LanguageChange />
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
      </ButtonOuterWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full h-80 flex justify-between items-center bg-transparent px-24 py-20 z-0
  smd:(py-16)
`;
const ButtonOuterWrapper = tw.div`
  flex-center gap-8 relative
`;

const ButtonWrapper = tw.div`
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

const LogoWrapper = tw.div``;
