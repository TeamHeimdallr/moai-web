import { Suspense } from 'react';
import tw from 'twin.macro';

import { useUserAllTokenBalances } from '~/api/api-contract/_xrpl/balance/user-all-token-balances';
import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

import { COLOR } from '~/assets/colors';
import { IconArrowDown } from '~/assets/icons';

import { SkeletonBase } from '~/components/skeleton/skeleton-base';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useConnectedWallet } from '~/hooks/wallets';
import { NETWORK } from '~/types';

import { FaucetTokenCard } from './faucet-token-card';

export const FaucetList = () => {
  return (
    <Suspense fallback={<_FaucetListSkeleton />}>
      <_FaucetList />
    </Suspense>
  );
};
const _FaucetList = () => {
  const { gaAction: _gaAction } = useGAAction(); // TODO

  const { xrp: _xrp } = useConnectedWallet(); // TODO
  const xrplNetwork = 'xrpl';

  const { data: tokensRawData } = useGetTokensQuery(
    {
      queries: {
        filter: `network:in:${xrplNetwork}`,
      },
    },
    { staleTime: 60 * 1000 }
  );
  const { tokens: tokensAll } = tokensRawData || {};
  const tokensData = tokensAll?.filter(
    token => !token.isLpToken && token.network === NETWORK.XRPL && token.currency !== 'XRP'
  );

  const { userAllTokenBalances, refetch: refetchBalance } = useUserAllTokenBalances();
  const tokens = tokensData?.map(token => {
    const balance = userAllTokenBalances?.find(b => b.currency === token.currency);
    return {
      ...token,
      balance: balance?.balance,
    };
  });

  return (
    <>
      <Wrapper>
        {tokens?.map(token => {
          return (
            <TokenCard key={token.id}>
              <FaucetTokenCard
                token={token}
                balance={token.balance ?? 0}
                refetchBalance={refetchBalance}
              />
            </TokenCard>
          );
        })}
      </Wrapper>
    </>
  );
};

const _FaucetListSkeleton = () => {
  return (
    <Wrapper>
      <InputInnerWrapper>
        <SkeletonBase height={108} />
        <IconWrapper>
          <ArrowDownWrapper>
            <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
          </ArrowDownWrapper>
        </IconWrapper>
        <SkeletonBase height={108} />
      </InputInnerWrapper>
      <SkeletonBase height={40} borderRadius={12} style={{ marginTop: 36 }} />
    </Wrapper>
  );
};

const Wrapper = tw.div`
   w-full flex flex-col flex-shrink-0 rounded-12 bg-neutral-10 gap-15 p-20 pt-16
   md:(w-455 p-24 gap-16)
`;

const TokenCard = tw.div`
  flex flex-col gap-16
`;

const InputInnerWrapper = tw.div`
  flex flex-col gap-16 relative
`;

const IconWrapper = tw.div`
  absolute absolute-center-x bottom-100 z-2 clickable select-none
`;

const ArrowDownWrapper = tw.div`
  p-6 flex-center rounded-full bg-neutral-20
`;
