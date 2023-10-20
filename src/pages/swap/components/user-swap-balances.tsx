import tw from 'twin.macro';

import { useTokenBalanceInPool } from '~/api/api-contract/balance/get-token-balance-in-pool';

import { TOKEN_IMAGE_MAPPER } from '~/constants';

import { TokenList } from '~/components/token-list';

import { formatNumber } from '~/utils';

export const UserSwapBalances = () => {
  const { balancesArray } = useTokenBalanceInPool();

  const filteredTokenBalances = balancesArray?.filter(({ value }) => (value ?? 0) > 0);
  const isEmpty = !filteredTokenBalances || filteredTokenBalances.length === 0;
  const total =
    filteredTokenBalances?.reduce((acc, { value }) => {
      acc += value ?? 0;
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
            {filteredTokenBalances.map(({ symbol, balance, value }, i) => (
              <TokenList
                key={symbol + i}
                image={TOKEN_IMAGE_MAPPER[symbol]}
                title={symbol}
                type="medium"
                balance={formatNumber(balance, 4)}
                value={`$${formatNumber(value, 4)}`}
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
