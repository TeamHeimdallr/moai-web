import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import tw from 'twin.macro';

import { IconLink } from '~/assets/icons';
import LogoLanding from '~/assets/logos/logo-landing.svg?react';

import { ButtonPrimaryLargeIconTrailing } from '~/components/buttons/primary/large-icon-trailing';

export const Contents = () => {
  return (
    <Wrapper
      initial={{ top: '320px' }}
      animate={{ top: '160px' }}
      transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.6, delay: 0.4 }}
    >
      <LogoWrapper
        initial={{ scale: 1 }}
        animate={{ scale: 0.33 }}
        transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.6, delay: 0.4 }}
      >
        <LogoLanding />
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
          <ButtonPrimaryLargeIconTrailing
            text="Get started"
            buttonType={'outlined'}
            icon={<IconLink />}
            onClick={() => window.open('https://moai-finance.xyz/')}
          />
        </ButtonWrapper>
      </BottomWrapper>
    </Wrapper>
  );
};

const Wrapper = styled(motion.div)(() => [
  tw`absolute w-full top-320 flex flex-col justify-center items-center gap-40`,
]);
const LogoWrapper = styled(motion.div)(() => [tw`w-691 h-60`]);
const BottomWrapper = styled(motion.div)(() => [
  tw`w-full flex flex-col justify-center items-center gap-40`,
]);
const ButtonWrapper = tw.div`w-157`;
const TextMain = tw.div`w-800 text-center text-neutral-100 font-eb-80`;
