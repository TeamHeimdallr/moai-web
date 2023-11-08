import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconAlert } from '~/assets/icons';

import { useNetwork } from '~/hooks/contexts/use-network';

import { ButtonPrimarySmall } from '../buttons';

export const WalletAlert = () => {
  const { name } = useNetwork();
  const { t } = useTranslation();
  return (
    <Wrapper>
      <TextWrapper>
        <IconAlert width={20} height={20} color={COLOR.NEUTRAL[100]} />
        {t('wallet-alert-message', { network: name })}
      </TextWrapper>
      <ButtonWrapper>
        <ButtonPrimarySmall text={t('Connect wallet')} isGrayScale={true} />
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full h-60 flex-center bg-red-50 gap-16
`;

const ButtonWrapper = tw.div``;

const TextWrapper = tw.div`
  flex-center gap-4 font-m-14 text-neutral-100
`;
