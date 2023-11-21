import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { IconLink } from '~/assets/icons';
import LogoText from '~/assets/logos/logo-text.svg?react';

import { ButtonPrimaryMediumIconTrailing } from '~/components/buttons';
import { ButtonPrimaryLargeIconTrailing } from '~/components/buttons/primary/large-icon-trailing';
import { LanguageChange } from '~/components/language-change';

import { useMediaQuery } from '~/hooks/utils';

export const Gnb = () => {
  const { isSMD } = useMediaQuery();
  const { t } = useTranslation();

  return (
    <Wrapper>
      <LogoWrapper>
        <LogoText width={88} height={20} />
      </LogoWrapper>
      <ButtonOuterWrapper>
        <ButtonWrapper>
          {isSMD ? (
            <ButtonPrimaryLargeIconTrailing
              text={t('Get started')}
              buttonType="filled"
              icon={<IconLink />}
              onClick={() => window.open('https://app.moai-finance.xyz/')}
            />
          ) : (
            <ButtonPrimaryMediumIconTrailing
              text={t('Get started')}
              buttonType="filled"
              icon={<IconLink />}
              onClick={() => window.open('https://app.moai-finance.xyz/')}
            />
          )}
        </ButtonWrapper>
        <LanguageChange />
      </ButtonOuterWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full h-80 flex justify-between items-center bg-transparent px-24 py-20
  smd:(py-16)
`;
const ButtonOuterWrapper = tw.div`
  flex-center gap-8
`;
const ButtonWrapper = tw.div`
  w-125
  smd:(w-157)
`;
const LogoWrapper = tw.div``;
