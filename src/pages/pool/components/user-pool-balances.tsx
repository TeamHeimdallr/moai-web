import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';

import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';

import { ASSET_URL, IS_MAINNET } from '~/constants';

import { FuturepassCreatePopup } from '~/components/account/futurepass-create-popup';
import { ButtonPrimaryLarge, ButtonPrimaryMedium } from '~/components/buttons/primary';
import { TokenList } from '~/components/token-list';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { formatNumber } from '~/utils/util-number';
import { useWalletConnectorTypeStore } from '~/states/contexts/wallets/connector-type';
import { POPUP_ID } from '~/types';

export const UserPoolBalances = () => {
  const { ref } = useGAInView({ name: 'pool-detail-user-pool-balance' });
  const { gaAction } = useGAAction();

  const navigate = useNavigate();

  const { isMD } = useMediaQuery();
  const { network, id } = useParams();
  const { t } = useTranslation();

  const { selectedNetwork, isFpass, isEvm } = useNetwork();
  const { open, opened } = usePopup(POPUP_ID.CONNECT_WALLET);

  const { evm, xrp, fpass } = useConnectedWallet();
  const { setWalletConnectorType } = useWalletConnectorTypeStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { open: openFuturepassCreate, opened: futurepassCreateOpened } = usePopup(
    POPUP_ID.FUTUREPASS_CREATE
  );

  const address = isFpass ? fpass.address : isEvm ? evm.address : xrp.address;

  const { pool, lpToken, userLpTokenBalance, userLpTokenValue, userPoolTokenTotalValue } =
    useUserPoolTokenBalances();
  const { compositions } = pool || {};
  const lpTokenSymbol =
    compositions?.reduce((acc, cur) => (acc += `${cur.weight}${cur.symbol}`), '') || '';

  const handleAddLiquidity = () => {
    if (!address) return;

    const link = `/pools/${network}/${id}/deposit`;
    gaAction({
      action: 'go-to-add-liquidity',
      data: { page: 'pool-detail', component: 'user-pool-balance', link },
    });
    navigate(link);
  };

  const handleWithdrawLiquidity = () => {
    if (!address) return;

    const link = `/pools/${network}/${id}/withdraw`;
    gaAction({
      action: 'go-to-withdraw-liquidity',
      data: { page: 'pool-detail', component: 'user-pool-balance', link },
    });
    navigate(link);
  };

  const ButtonPrimary = isMD ? ButtonPrimaryLarge : ButtonPrimaryMedium;
  return (
    <Wrapper ref={ref}>
      <Header>
        {t('My liquidity')}
        {!!userLpTokenValue && <Balance>${formatNumber(userLpTokenValue || 0)}</Balance>}
      </Header>
      <Divider />
      <TokenLists>
        <TokenList
          image={
            <LpWrapper images={[compositions?.[0]?.image, compositions?.[1]?.image]}>
              <div />
              <div />
            </LpWrapper>
          }
          title={lpToken?.symbol || lpTokenSymbol}
          balance={formatNumber(userLpTokenBalance || 0, 4, 'floor', 0)}
          type={isMD ? 'large' : 'medium'}
        />
      </TokenLists>
      <Footer>
        <FooterBalanceWrapper>
          {t('Wallet balance')}
          {!!userPoolTokenTotalValue && (
            <FooterBalance>{`$${formatNumber(userPoolTokenTotalValue || 0)}`}</FooterBalance>
          )}
        </FooterBalanceWrapper>
        <ButtonWrapper>
          {address ? (
            <ButtonPrimary
              text={t('Add liquidity')}
              onClick={handleAddLiquidity}
              disabled={!address}
            />
          ) : isFpass && !fpass.address && evm.address ? (
            <ButtonPrimary
              style={{ padding: '9px 24px' }}
              text={t('Create Futurepass')}
              isLoading={!!opened}
              onClick={() => {
                if (IS_MAINNET) window.open('https://futurepass.futureverse.app/stuff/');
                else openFuturepassCreate();
              }}
            />
          ) : (
            <ButtonPrimary
              style={{ padding: '9px 24px' }}
              text={t('Connect wallet')}
              isLoading={!!opened}
              onClick={() => {
                setWalletConnectorType({ network: currentNetwork });
                open();
                gaAction({
                  action: 'connect-wallet',
                  data: { page: 'pool-detail', component: 'user-pool-balance' },
                });
              }}
            />
          )}
          {userLpTokenBalance > 0 && (
            <ButtonPrimary
              buttonType="outlined"
              text={t('Withdraw')}
              disabled={!address}
              onClick={handleWithdrawLiquidity}
            />
          )}
        </ButtonWrapper>
      </Footer>
      {futurepassCreateOpened && <FuturepassCreatePopup />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full bg-neutral-10 rounded-12
`;
const Header = tw.div`
  py-20 px-24 flex items-center justify-between font-b-18 text-neutral-100
  md:(font-b-20)
`;
const Balance = tw.div`
  font-b-20
  md:(font-b-24)
`;
const TokenLists = tw.div`
  py-7
`;

const Footer = tw.div`
  flex flex-col gap-24 bg-neutral-15 rounded-b-12
  pt-16 px-20 pb-20
  md:(pt-20 px-24 pb-24)
`;
const FooterBalanceWrapper = tw.div`
  flex w-full justify-between items-center font-m-14 text-neutral-100
  md:(font-m-16)
`;
const FooterBalance = tw.div`
  font-m-18
  md:(font-m-20)
`;

const ButtonWrapper = tw.div`
  flex gap-8
`;
const Divider = tw.div`
  flex h-1 bg-neutral-15
`;

interface LpWrapperProps {
  images: (string | undefined)[];
}
const LpWrapper = styled.div<LpWrapperProps>(({ images }) => [
  tw`relative w-64 h-36`,
  css`
    & > div {
      width: 36px;
      height: 36px;

      border-radius: 100%;

      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    & > div:first-of-type {
      position: absolute;
      top: 0;
      left: 0;
      background-image: url(${images[0] || `${ASSET_URL}/tokens/token-unknown.png`});
    }
    & > div:last-of-type {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 1;
      background-image: url(${images[1] || `${ASSET_URL}/tokens/token-unknown.png`});
    }
  `,
]);
