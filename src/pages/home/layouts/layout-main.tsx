import { useTranslation } from 'react-i18next';
import tw, { styled } from 'twin.macro';

import { useGetMyPoolsQuery } from '~/api/api-server/pools/get-my-pools';

import { ASSET_URL } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';

import { usePopup } from '~/hooks/components/use-popup';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber } from '~/utils';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { POPUP_ID } from '~/types';

export const MainLayout = () => {
  const { open, opened } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { opened: openedBanner } = usePopup(POPUP_ID.WALLET_ALERT);

  const { selectedNetwork, isEvm, isXrp } = useNetwork();
  const { evm, xrp } = useConnectedWallet();
  const { setWalletType } = useWalletTypeStore();

  const { currentAddress } = useConnectedWallet(selectedNetwork);
  const isConnected = !!evm.address || !!xrp.address;

  const { data } = useGetMyPoolsQuery({
    queries: {
      take: 10000,
      sort: 'value:desc',
      walletAddress: currentAddress || '',
    },
  });
  const total = data?.pools?.reduce((acc, cur) => (acc += Number(cur.value)), 0);

  const { t } = useTranslation();

  return (
    <MainWrapper
      banner={!!openedBanner}
      style={{ backgroundImage: `url(${ASSET_URL}/images/bg-main.png)` }}
    >
      {isConnected ? (
        <SubTitleWrapper>
          <Label>{t('My Moai balance')}</Label>
          <SubTitle>{`$${formatNumber(total)}`}</SubTitle>
        </SubTitleWrapper>
      ) : (
        <>
          <Title>{'Your Universal Gateway to the\nMulti-chain Liquidity'}</Title>
          <ButtonWrapper>
            <ButtonPrimaryLarge
              text={t('Connect wallet')}
              buttonType="outlined"
              isLoading={!!opened}
              onClick={() => {
                setWalletType({ xrpl: isXrp, evm: isEvm });
                open();
              }}
            />
          </ButtonWrapper>
        </>
      )}
    </MainWrapper>
  );
};

interface MainWrapperProps {
  banner?: boolean;
}
const MainWrapper = styled.div<MainWrapperProps>(({ banner }) => [
  tw`
    flex-col w-full bg-center bg-no-repeat bg-cover flex-center

    pt-120 pb-80 gap-24
    md:(pt-200 pb-140)
  `,
  banner &&
    tw`
      gap-12
      pt-172 pb-80
      md:(pt-260 pb-140 gap-24)
    `,
]);

const Title = tw.div`
  text-neutral-100 text-center

  font-b-28 px-20
  md:(font-b-48 whitespace-pre-wrap)
`;

const SubTitleWrapper = tw.div`
  flex-center flex-col 
  gap-8
  md:(gap-12)
`;
const SubTitle = tw.div`
  text-neutral-100
  font-b-28
  md:(font-b-36)
`;
const Label = tw.div`
  text-neutral-100
  font-b-20
  md:(font-b-24)
`;

const ButtonWrapper = tw.div`
  inline-flex-center
`;
