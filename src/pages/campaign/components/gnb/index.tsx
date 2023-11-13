import tw, { styled } from 'twin.macro';

import { Account } from '~/components/account';
import { ButtonPrimaryMedium } from '~/components/buttons/primary';
import { Notification } from '~/components/notification';

import { usePopup } from '~/hooks/components/use-popup';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { POPUP_ID } from '~/types';

export const Gnb = () => {
  const { open, opened } = usePopup(POPUP_ID.CONNECT_WALLET);

  const { evm, xrp } = useConnectedWallet();
  const { setWalletType } = useWalletTypeStore();

  return (
    <Wrapper>
      <ButtonWrapper>
        {evm.address || xrp.address ? (
          <ConnectedButton>
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
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div(() => [
  tw`flex items-end justify-end flex-col w-full px-24 py-20 z-20 bg-transparent`,
]);

const ConnectedButton = tw.div`
  flex gap-8
`;

const ButtonWrapper = tw.div`
  flex gap-8
`;
