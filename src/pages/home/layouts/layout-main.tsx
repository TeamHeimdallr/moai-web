import tw, { styled } from 'twin.macro';

import { ASSET_URL } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';

import { usePopup } from '~/hooks/components/use-popup';
import { useConnectedWallet } from '~/hooks/wallets';
import { POPUP_ID } from '~/types';

export const MainLayout = () => {
  const { open, opened } = usePopup(POPUP_ID.CONNECT_WALLET);

  const { evm, xrp } = useConnectedWallet();
  const isConnected = !!evm.address || !!xrp.address;

  return (
    <MainWrapper
      isConnected={isConnected}
      style={{ backgroundImage: `url(${ASSET_URL}/images/bg-main.png)` }}
    >
      {isConnected ? (
        <>
          <Label>My Moai balance</Label>
          {/* TODO: moai balance */}
          <SubTitle>{`$0`}</SubTitle>
        </>
      ) : (
        <>
          <Title>Your Universal Gateway to Multi-chain Liquidity</Title>
          <ButtonWrapper>
            <ButtonPrimaryLarge
              text="Connect wallet"
              buttonType="outlined"
              isLoading={!!opened}
              onClick={open}
            />
          </ButtonWrapper>
        </>
      )}
    </MainWrapper>
  );
};

interface MainWrapperProps {
  isConnected?: boolean;
}
const MainWrapper = styled.div<MainWrapperProps>(({ isConnected }) => [
  tw`flex-col w-full gap-24 bg-center bg-no-repeat bg-cover pt-240 pb-160 flex-center`,
  isConnected && tw`gap-12 pt-160 pb-120`,
]);

const Title = tw.div`font-b-48 text-neutral-100`;
const SubTitle = tw.div`font-b-36 text-neutral-100`;
const Label = tw.div`font-b-24 text-neutral-100`;

const ButtonWrapper = tw.div`
  inline-flex-center
`;
