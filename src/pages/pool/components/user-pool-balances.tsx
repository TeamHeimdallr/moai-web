import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { useLiquidityPoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';

import { TOKEN_IMAGE_MAPPER } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useRequirePrarams } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { formatNumber } from '~/utils/util-number';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { IToken, POPUP_ID } from '~/types';

export const UserPoolBalances = () => {
  const navigate = useNavigate();
  const { open, opened } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { setWalletType } = useWalletTypeStore();

  const { network, id } = useParams();
  useRequirePrarams([!!id, !!network], () => navigate(-1));
  const { isFpass, isEvm } = useNetwork();

  const { evm, xrp, fpass } = useConnectedWallet();

  const address = isFpass ? fpass.address : isEvm ? evm.address : xrp.address;

  const { pool, lpTokenBalance } = useLiquidityPoolBalance(id ?? '');
  const { compositions, lpTokenTotalSupply } = pool;

  const userPoolBalances: IToken[] = compositions?.map(composition => {
    const balance = lpTokenTotalSupply
      ? (composition?.balance ?? 0) * (lpTokenBalance / lpTokenTotalSupply)
      : 0;
    const value = balance * (composition?.price ?? 0);
    return {
      symbol: composition.symbol,
      balance,
      price: composition.price,
      value,
    };
  });

  const totalBalance = userPoolBalances.reduce((acc, cur) => acc + (cur?.value ?? 0), 0) ?? 0;
  const formattedTokenInfos = userPoolBalances.map(token => {
    const weight = pool?.compositions?.find(pool => pool.symbol === token.symbol)?.weight ?? 0;

    return {
      title: weight + '% ' + token.symbol,
      balance: formatNumber(token.balance, 2),
      value: '$' + formatNumber(token.value, 2),
      image: TOKEN_IMAGE_MAPPER[token.symbol],
    };
  });

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
        My pool balance <Balance>${formatNumber(totalBalance || 0, 2)}</Balance>
      </Header>
      <Divider />
      <TokenLists>
        {formattedTokenInfos?.map((token, i) => <TokenList key={token.title + i} {...token} />)}
      </TokenLists>
      <Footer>
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
                window.open('https://futurepass.futureverse.app/');
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
          {totalBalance > 0 && (
            <ButtonPrimaryLarge
              buttonType="outlined"
              text="Withdraw"
              disabled={!address}
              onClick={handleWithdrawLiquidity}
            />
          )}
        </ButtonWrapper>
      </Footer>
    </Wrapper>
  );
};
const Wrapper = tw.div`
  w-400 bg-neutral-10 rounded-12
`;
const Header = tw.div`
  py-20 px-24 flex items-center justify-between font-m-16 text-neutral-100
`;
const Balance = tw.div`
  font-m-20
`;
const TokenLists = tw.div``;

const Footer = tw.div`
  flex flex-col gap-12 bg-neutral-15 rounded-b-12
`;
const ButtonWrapper = tw.div`
  px-24 py-20 flex gap-8
`;
const Divider = tw.div`
  flex h-1 bg-neutral-15
`;
