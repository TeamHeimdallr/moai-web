import { useWeb3Modal } from '@web3modal/react';
import tw, { styled } from 'twin.macro';

import bgMain from '~/assets/images/bg-main.png';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';

import { formatNumber } from '~/utils/number';

import { CURRENT_CHAIN } from '~/moai-evm/constants';

import { useBalancesAll } from '~/moai-evm/hooks/data/use-balance-all';
import { useConnectEvmWallet } from '~/moai-evm/hooks/data/use-connect-evm-wallet';
import { TOKEN } from '~/moai-evm/types/contracts';

export const MainLayout = () => {
  const { isOpen, open } = useWeb3Modal();
  const { isConnected } = useConnectEvmWallet();

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
          <Title>{`DeFi Liquidity pools built on ${CURRENT_CHAIN}`}</Title>
          <ButtonWrapper>
            <ButtonPrimaryLarge
              text="Connect wallet"
              buttonType="outlined"
              isLoading={isOpen}
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