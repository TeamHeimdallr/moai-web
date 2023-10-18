import tw from 'twin.macro';

import { TOKEN_IMAGE_MAPPER } from '~/constants';

import { TokenList } from '~/components/token-list';

import { formatNumber } from '~/utils/util-number';
import { IToken } from '~/types';

interface Props {
  tokens: IToken[];
}
export const AddLiquidityBalances = ({ tokens }: Props) => {
  const tokenInfos = tokens?.map(token => {
    return {
      symbol: token.symbol,
      balance: formatNumber(token.balance, 2),
      value: '$' + formatNumber(token.value, 2),
      image: TOKEN_IMAGE_MAPPER[token.symbol],
    };
  });
  const totalBalance = tokens?.reduce((acc, cur) => acc + (cur?.value ?? 0), 0) ?? 0;

  return (
    <Wrapper>
      <Banner>
        <Text>My Wallet</Text>
        <Balance>${formatNumber(totalBalance, 2)}</Balance>
      </Banner>
      <Divider />
      <TokenLists>
        {tokenInfos?.map((token, i) => (
          <TokenList key={token.symbol + i} title={token.symbol} {...token} />
        ))}
      </TokenLists>
    </Wrapper>
  );
};
const Wrapper = tw.div`
  w-294 bg-neutral-10 rounded-t-12
`;
const Banner = tw.div`
  py-20 px-24 flex items-center justify-between font-m-16 text-neutral-100 gap-16
`;
const Text = tw.div`
  flex-shrink-0
`;
const Balance = tw.div`
  font-r-16 truncate
`;
const TokenLists = tw.div``;
const Divider = tw.div`
  flex h-1 bg-neutral-15
`;
