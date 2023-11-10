import { useNavigate } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import LogoText from '~/assets/logos/logo-text.svg?react';

import { Account } from '~/components/account';
import { ButtonPrimaryMedium } from '~/components/buttons/primary';
import { LanguageChange } from '~/components/language-change';
import { Notification } from '~/components/notification';

import { usePopup } from '~/hooks/components/use-popup';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { POPUP_ID } from '~/types';

export const Gnb = () => {
  const { open, opened } = usePopup(POPUP_ID.CONNECT_WALLET);

  const navigate = useNavigate();
  const { evm, xrp } = useConnectedWallet();
  const { setWalletType } = useWalletTypeStore();

  const { isMD } = useMediaQuery();

  return (
    <Wrapper>
      <LogoWrapper>
        <LogoText width={isMD ? 88 : 70} height={isMD ? 20 : 16} onClick={() => navigate('/')} />
      </LogoWrapper>
      <ButtonWrapper isMD={isMD}>
        {evm.address || xrp.address ? (
          <ConnectedButton isMD={isMD}>
            <Notification />
            <Account />
          </ConnectedButton>
        ) : (
          <ButtonPrimaryMedium
            style={{ padding: '9px 24px' }}
            text="Connect wallet"
            isLoading={!!opened}
            onClick={() => {
              setWalletType({ xrpl: true, evm: true });
              open();
            }}
          />
        )}
        <LanguageChange />
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div(() => [
  tw`flex items-end justify-between items-center w-full px-24 py-20 z-20 bg-transparent`,
]);

const LogoWrapper = tw.div`clickable h-20`;
interface Props {
  isMD: boolean;
}

const ConnectedButton = styled.div<Props>(({ isMD }) => [tw`flex`, isMD ? tw`gap-8` : tw`gap-4`]);

const ButtonWrapper = styled.div<Props>(({ isMD }) => [tw`flex`, isMD ? tw`gap-8` : tw`gap-4`]);
