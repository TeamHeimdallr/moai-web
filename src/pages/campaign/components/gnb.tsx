import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import LogoText from '~/assets/logos/logo-text.svg?react';

import { Account } from '~/components/account';
import { AlertBanner } from '~/components/alerts/banner';
import { ButtonPrimaryMedium, ButtonPrimarySmallBlack } from '~/components/buttons/primary';
import { LanguageChange } from '~/components/language-change';

import { useBanner } from '~/hooks/components/use-banner';
import { usePopup } from '~/hooks/components/use-popup';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { POPUP_ID } from '~/types';

export const Gnb = () => {
  const { open, opened } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);
  const { opened: openedLackOfRootBanner } = usePopup(POPUP_ID.LACK_OF_ROOT);
  const { opened: openedSwitchNetworkBanner } = usePopup(POPUP_ID.WALLET_ALERT);

  const { text, type: bannerType, connectWallet, switchNetwork } = useBanner();

  const navigate = useNavigate();
  const { evm, xrp } = useConnectedWallet();

  const { isLG } = useMediaQuery();
  const { t } = useTranslation();

  return (
    <Wrapper>
      {/* SWITCH NETWORK BANNER */}
      {openedSwitchNetworkBanner && (
        <BannerWrapper>
          <AlertBanner
            text={text}
            button={
              <ButtonPrimarySmallBlack
                text={bannerType === 'select' ? t('Connect wallet') : t('Switch network')}
                onClick={bannerType === 'select' ? connectWallet : switchNetwork}
              />
            }
          />
        </BannerWrapper>
      )}

      {/* CAMPAIGN ROOT BANNER */}
      {!openedSwitchNetworkBanner && openedLackOfRootBanner && (
        <BannerWrapper>
          <AlertBanner text={t('lack-of-reserve-description')} />
        </BannerWrapper>
      )}

      <InnerWrapper>
        <LogoWrapper>
          <LogoText width={isLG ? 88 : 70} height={isLG ? 20 : 16} onClick={() => navigate('/')} />
        </LogoWrapper>
        <ButtonWrapper>
          {evm.address || xrp.address ? (
            <ConnectedButton>
              {/* <Notification /> */}
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
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col
`;
const InnerWrapper = tw.div`
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
const BannerWrapper = tw.div`
  w-full
`;
