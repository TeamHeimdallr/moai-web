import { useTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import tw from 'twin.macro';

import { IconLink } from '~/assets/icons';
import LogoLanding from '~/assets/logos/logo-landing.svg?react';

import { ButtonPrimaryMediumIconTrailing } from '~/components/buttons';
import { ButtonPrimaryLargeIconTrailing } from '~/components/buttons/primary/large-icon-trailing';

import { useMediaQuery } from '~/hooks/utils';

export const Contents = () => {
  const { t } = useTranslation();
  const { isSMD, isMLG } = useMediaQuery();

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
          Your Universal <br />
          Gateway to <br />
          Multi-chain Liquidity
        </TextMain>
        <ButtonWrapper>
          {isSMD ? (
            <ButtonPrimaryLargeIconTrailing
              text={t('Get started')}
              buttonType={'outlined'}
              icon={<IconLink />}
              onClick={() => window.open('https://app.moai-finance.xyz/')}
            />
          ) : (
            <ButtonPrimaryMediumIconTrailing
              text={t('Get started')}
              buttonType={'outlined'}
              icon={<IconLink />}
              onClick={() => window.open('https://app.moai-finance.xyz/')}
            />
          )}
        </ButtonWrapper>
      </BottomWrapper>
    </Wrapper>
  );
};

const Wrapper = styled(motion.div)(() => [
  tw`
    absolute w-full flex flex-col justify-center items-center
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
  w-125
  smd:(w-157)
`;
const TextMain = tw.div`
  text-center text-neutral-100 
  w-full font-eb-32
  smd:(font-eb-60 leading-64)
  mlg:(w-800 font-eb-80)
`;
