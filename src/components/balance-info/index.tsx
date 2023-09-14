import tw from 'twin.macro';

import { TOKEN_IMAGE_MAPPER } from '~/constants';
import { TokenInfo } from '~/types/components';
import { formatNumber } from '~/utils/number';

import { TokenList } from '../token-list';

interface Props {
  tokens: TokenInfo[];
}

export const BalanceInfo = ({ tokens }: Props) => {
  const tokenInfos = tokens?.map(token => {
    return {
      title: token.name,
      balance: formatNumber(token.balance, 2),
      value: '$' + formatNumber(token.value, 2),
      image: TOKEN_IMAGE_MAPPER[token.name],
    };
  });
  const totalBalance = tokens.reduce((acc, cur) => acc + cur.value, 0);
  return (
    <Wrapper>
      <Banner>
        My Wallet <Balance>${formatNumber(totalBalance, 2)}</Balance>
      </Banner>
      <Divider />
      <TokenLists>
        {tokenInfos?.map(token => <TokenList key={token.title} {...token} />)}
      </TokenLists>
    </Wrapper>
  );
};
const Wrapper = tw.div`
  w-294 bg-neutral-10 rounded-t-12
`;
const Banner = tw.div`
  py-20 px-24 flex items-center justify-between font-m-16 text-neutral-100
`;
const Balance = tw.div`
  font-r-16
`;
const TokenLists = tw.div``;
const Divider = tw.div`
  flex h-1 bg-neutral-15
`;
