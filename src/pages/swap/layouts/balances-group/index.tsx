import tw from 'twin.macro';

import { TokenList } from '~/components/token-list';
import { TOKEN_IMAGE_MAPPER } from '~/constants';
import { useBalancesAll } from '~/hooks/data/use-balance-all';
import { formatNumber } from '~/utils/number';

export const Balances = () => {
  const { balancesArray } = useBalancesAll();

  const filteredTokenBalances = balancesArray?.filter(({ value }) => value > 0);
  const isEmpty = !filteredTokenBalances || filteredTokenBalances.length === 0;
  const total =
    filteredTokenBalances?.reduce((acc, { valueUSD }) => {
      acc += valueUSD;
      return acc;
    }, 0) ?? 0;

  return (
    <Wrapper>
      {isEmpty ? (
        <EmptyWrapper>
          <EmptyHeaderWrapper>
            <HeaderLabel>My wallet</HeaderLabel>
            <EmptyBalance>$0</EmptyBalance>
          </EmptyHeaderWrapper>
          <EmptyMessage>{"You don't have tokens in your wallet."}</EmptyMessage>
        </EmptyWrapper>
      ) : (
        <>
          <Header>
            <HeaderLabel>My wallet</HeaderLabel>
            <HeaderText>${formatNumber(total)}</HeaderText>
          </Header>
          <Divider />
          <Body>
            {filteredTokenBalances.map(({ symbol, value, valueUSD }) => (
              <TokenList
                key={symbol}
                image={TOKEN_IMAGE_MAPPER[symbol]}
                title={symbol}
                type="medium"
                balance={formatNumber(value, 4)}
                value={`$${formatNumber(valueUSD, 4)}`}
              />
            ))}
          </Body>
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col rounded-12 bg-neutral-15 w-294
`;

const Header = tw.div`
  py-20 px-24 flex gap-16 w-full
`;

const HeaderLabel = tw.div`
  flex font-m-16 text-neutral-100 flex-shrink-0
`;
const HeaderText = tw.div`
  flex font-r-16 text-neutral-100 flex-1 text-end truncate
`;

const Divider = tw.div`
  w-full h-1 bg-neutral-15
`;
const Body = tw.div`
  flex flex-col
`;

const EmptyWrapper = tw.div`
  py-20 px-24 flex flex-col gap-8
`;

const EmptyHeaderWrapper = tw.div`
  flex gap-16
`;
const EmptyBalance = tw.div`
  flex font-r-16 text-red-50 flex-1 justify-end
`;

const EmptyMessage = tw.div`
  flex font-r-12 text-red-50 flex-1 justify-end
`;
