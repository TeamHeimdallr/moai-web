import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { TokenList } from '~/components/token-list';

import { formatNumber } from '~/utils/number';

import { TOKEN_IMAGE_MAPPER } from '~/moai-evm/constants';

import { PoolInfo, TokenInfo } from '~/moai-evm/types/components';
interface Props {
  pool: PoolInfo;
  userPoolBalances: TokenInfo[];
}

export const UserPoolBalance = ({ userPoolBalances, pool }: Props) => {
  const { id: poolId } = useParams();
  const navigate = useNavigate();

  const totalBalance = userPoolBalances.reduce((acc, cur) => acc + cur.value, 0) ?? 0;

  const formattedTokenInfos = userPoolBalances.map(token => {
    const weight = pool?.compositions?.find(pool => pool.name === token.name)?.weight ?? 0;

    return {
      title: weight + '% ' + token.name,
      balance: formatNumber(token.balance, 2),
      value: '$' + formatNumber(token.value, 2),
      image: TOKEN_IMAGE_MAPPER[token.name],
    };
  });

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
          <ButtonPrimaryLarge
            text="Add liquidity"
            onClick={() => navigate(`/pools/${poolId}/liquidity`)}
          />
          {totalBalance > 0 && (
            <ButtonPrimaryLarge
              buttonType="outlined"
              text="Withdraw"
              onClick={() => navigate(`/pools/${poolId}/withdraw`)}
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
