import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { ButtonPrimaryLarge } from '~/components/buttons/primary';
import { TokenList } from '~/components/token-list';
import { TOKEN_IMAGE_MAPPER } from '~/constants';
import { Composition, PoolInfo } from '~/types/components';
import { formatNumber } from '~/utils/number';
interface Props {
  pool: PoolInfo;
  compositions: Composition[];
}

export const PoolBalance = ({ compositions, pool }: Props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const totalPoolBalance =
    compositions?.reduce((acc, cur) => acc + cur.balance * cur.price, 0) ?? 0;

  const tokenInfos = compositions?.map(token => {
    const weight = pool?.compositions?.find(pool => pool.name === token.name)?.weight;
    const value = token.balance * token.price;
    return {
      title: weight + '% ' + token.name,
      balance: formatNumber(token.balance, 2),
      value: '$' + formatNumber(value, 2),
      image: TOKEN_IMAGE_MAPPER[token.name],
    };
  });

  return (
    <Wrapper>
      <Header>
        My pool balance <Balance>${formatNumber(totalPoolBalance, 2)}</Balance>
      </Header>
      <Divider />
      <TokenLists>
        {tokenInfos?.map((token, i) => <TokenList key={token.title + i} {...token} />)}
      </TokenLists>
      <Footer>
        <ButtonWrapper>
          <ButtonPrimaryLarge
            text="Add liquidity"
            onClick={() => navigate(`/pools/${id}/liquidity`)}
          />
          {totalPoolBalance > 0 && (
            <ButtonPrimaryLarge
              buttonType="outlined"
              text="Withdraw"
              onClick={() => navigate(`/pools/${id}/withdraw`)}
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
