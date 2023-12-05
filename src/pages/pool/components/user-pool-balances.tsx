import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { toHex } from 'viem';

import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';

import { IS_MAINNET } from '~/constants';

import { FuturepassCreatePopup } from '~/components/account/futurepass-create-popup';
import { ButtonPrimaryLarge, ButtonPrimaryMedium } from '~/components/buttons/primary';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber } from '~/utils/util-number';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { POPUP_ID } from '~/types';

export const UserPoolBalances = () => {
  const navigate = useNavigate();

  const { isMD } = useMediaQuery();
  const { network, id } = useParams();
  const { t } = useTranslation();

  const { isFpass, isEvm, isXrp } = useNetwork();
  const { open, opened } = usePopup(POPUP_ID.CONNECT_WALLET);

  const { evm, xrp, fpass } = useConnectedWallet();
  const { setWalletType } = useWalletTypeStore();

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
    navigate(`/pools/${network}/${id}/deposit`);
  };

  const handleWithdrawLiquidity = () => {
    if (!address) return;
    navigate(`/pools/${network}/${id}/withdraw`);
  };

  const ButtonPrimary = isMD ? ButtonPrimaryLarge : ButtonPrimaryMedium;
  return (
    <Wrapper>
      <Header>
        {t('My liquidity')}
        <Balance>${formatNumber(userLpTokenValue || 0, 4)}</Balance>
      </Header>
      <Divider />
      <TokenLists>
        <TokenList
          image={
            <Jazzicon
              diameter={36}
              seed={jsNumberForAddress(
                isXrp ? toHex(lpToken?.address || '', { size: 42 }) : lpToken?.address || ''
              )}
            />
          }
          title={lpToken?.symbol || lpTokenSymbol}
          balance={formatNumber(userLpTokenBalance || 0, 4)}
          type={isMD ? 'large' : 'medium'}
        />
      </TokenLists>
      <Footer>
        <FooterBalanceWrapper>
          {t('Wallet balance')}
          <FooterBalance>{`$${formatNumber(userPoolTokenTotalValue || 0, 4)}`}</FooterBalance>
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
                setWalletType({ xrpl: !isEvm, evm: isEvm });
                open();
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
