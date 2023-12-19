import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import LogoText from '~/assets/logos/logo-text.svg?react';

import { Account } from '~/components/account';
import { ButtonPrimaryMedium } from '~/components/buttons/primary';
import { LanguageChange } from '~/components/language-change';
import { Notification } from '~/components/notification';

import { usePopup } from '~/hooks/components/use-popup';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { POPUP_ID } from '~/types';

export const Gnb = () => {
  const { open, opened } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);

  const navigate = useNavigate();
  const { evm, xrp } = useConnectedWallet();

  const { isLG } = useMediaQuery();
  const { t } = useTranslation();

  return (
    <Wrapper>
      <LogoWrapper>
        <LogoText width={isLG ? 88 : 70} height={isLG ? 20 : 16} onClick={() => navigate('/')} />
      </LogoWrapper>
      <ButtonWrapper>
        {evm.address || xrp.address ? (
          <ConnectedButton>
            <Notification />
            <Account />
          </ConnectedButton>
        ) : (
          <ButtonPrimaryMedium
            style={{ padding: '9px 24px' }}
            text={t('Connect wallet')}
            isLoading={!!opened}
            onClick={() => open()}
          />
        )}
        <LanguageChange />
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex items-end justify-between items-center w-full px-24 py-20 z-20 bg-transparent
`;
const LogoWrapper = tw.div`
  clickable h-20
`;

const ConnectedButton = tw.div`
  flex gap-4
  lg:(gap-8)
`;
const ButtonWrapper = tw.div`
  flex gap-4
  lg:(gap-8)
`;
