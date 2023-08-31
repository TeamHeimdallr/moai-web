import tw from 'twin.macro';

import { formatNumber } from '~/utils/number';

import { TokenList } from '../token-list';

interface Props {
  tokens: { title: string; balance: number; price: number; image: string }[];
}

export const MyBalanceInfo = ({ tokens }: Props) => {
  const tokenInfos = tokens.map(token => {
    return {
      ...token,
      balance: formatNumber(token.balance, 2),
      price: '$' + formatNumber(token.price, 2),
    };
  });
  const totalBalance = tokens.reduce((acc, cur) => acc + cur.price, 0);
  return (
    <Wrapper>
      <Banner>
        My Wallet <Balance>${formatNumber(totalBalance, 2)}</Balance>
      </Banner>
      <TokenLists>
        {tokenInfos.map(token => (
          <TokenList key={token.title} {...token} />
        ))}
      </TokenLists>
    </Wrapper>
  );
};
const Wrapper = tw.div`w-294 bg-neutral-10 rounded-t-12`;
const Banner = tw.div`py-20 px-24 flex items-center justify-between font-m-16 text-neutral-100`;
const Balance = tw.div`font-r-16`;
const TokenLists = tw.div``;
