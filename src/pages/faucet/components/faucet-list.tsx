import { Suspense } from 'react';
import tw from 'twin.macro';

import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

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
  const tokens = tokensAll?.filter(
    token => !token.isLpToken && token.network === NETWORK.XRPL && token.currency !== 'XRP'
  );

  return (
    <>
      <Wrapper>
        {tokens?.map(token => {
          return (
            <TokenCard key={token.id}>
              <FaucetTokenCard token={token} />
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
        <SkeletonBase height={72} />
        <SkeletonBase height={72} />
        <SkeletonBase height={72} />
        <SkeletonBase height={72} />
      </InputInnerWrapper>
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
