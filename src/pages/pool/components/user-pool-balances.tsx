import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { toHex } from 'viem';

import { useUserPoolTokenBalances } from '~/api/api-contract/balance/user-pool-token-balances';

import { FuturepassCreatePopup } from '~/components/account/futurepass-create-popup';
import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber } from '~/utils/util-number';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { POPUP_ID } from '~/types';

export const UserPoolBalances = () => {
  const navigate = useNavigate();

  const { network, id } = useParams();

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

  return (
    <Wrapper>
      <Header>
        My liquidity <Balance>${formatNumber(userLpTokenValue || 0, 4)}</Balance>
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
        />
      </TokenLists>
      <Footer>
        <FooterBalanceWrapper>
          My pool balance
          <FooterBalance>{`$${formatNumber(userPoolTokenTotalValue || 0, 4)}`}</FooterBalance>
        </FooterBalanceWrapper>
        <ButtonWrapper>
          {address ? (
            <ButtonPrimaryLarge
              text="Add liquidity"
              onClick={handleAddLiquidity}
              disabled={!address}
            />
          ) : isFpass && !fpass.address && evm.address ? (
            <ButtonPrimaryLarge
              style={{ padding: '9px 24px' }}
              text="Create Futurepass"
              isLoading={!!opened}
              onClick={() => {
                openFuturepassCreate();
              }}
            />
          ) : (
            <ButtonPrimaryLarge
              style={{ padding: '9px 24px' }}
              text="Connect wallet"
              isLoading={!!opened}
              onClick={() => {
                setWalletType({ xrpl: !isEvm, evm: isEvm });
                open();
              }}
            />
          )}
          {userLpTokenBalance > 0 && (
            <ButtonPrimaryLarge
              buttonType="outlined"
              text="Withdraw"
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
  w-400 bg-neutral-10 rounded-12
`;
const Header = tw.div`
  py-20 px-24 flex items-center justify-between font-m-20 text-neutral-100
`;
const Balance = tw.div`
  font-b-24
`;
const TokenLists = tw.div`
  py-7
`;

const Footer = tw.div`
  flex flex-col gap-24 bg-neutral-15 rounded-b-12 pt-20 px-24 pb-24
`;
const FooterBalanceWrapper = tw.div`
  flex w-full justify-between items-center font-m-16 text-neutral-100
`;
const FooterBalance = tw.div`
  font-m-20
`;

const ButtonWrapper = tw.div`
  flex gap-8
`;
const Divider = tw.div`
  flex h-1 bg-neutral-15
`;
