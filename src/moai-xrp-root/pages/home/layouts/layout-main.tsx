import tw, { styled } from 'twin.macro';

import bgMain from '~/assets/images/bg-main.png';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';

import { useConnectEvmWallet } from '~/hooks/wallets/use-connect-evm-wallet';
import { useConnectXrplWallet } from '~/hooks/wallets/use-connect-xrp-wallet';
import { usePopup } from '~/hooks/components/use-popup';
import { formatNumber } from '~/utils/util-number';
import { POPUP_ID } from '~/types';

import { useBalancesAll } from '~/moai-xrp-root/hooks/data/use-balance-all';
import { TOKEN } from '~/moai-xrp-root/types/contracts';

export const MainLayout = () => {
  const { open, opened } = usePopup(POPUP_ID.WALLET);

  const { isConnected: isEvmConnected } = useConnectEvmWallet();
  const { isConnected: isXrplConnected } = useConnectXrplWallet();
  const isConnected = isEvmConnected || isXrplConnected;

  const { balancesMap } = useBalancesAll();
  const moaiBalance = balancesMap?.[TOKEN.MOAI];

  return (
    <MainWrapper isConnected={isConnected} style={{ backgroundImage: `url(${bgMain})` }}>
      {isConnected ? (
        <>
          <Label>My Moai balance</Label>
          <SubTitle>{`$${formatNumber(moaiBalance?.value ?? 0, 4)}`}</SubTitle>
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
