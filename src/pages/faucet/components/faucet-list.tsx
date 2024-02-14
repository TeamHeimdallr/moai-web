import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';
import { useGetTokensQuery } from '~/api/api-server/token/get-tokens';

import { SkeletonBase } from '~/components/skeleton/skeleton-base';
import { Tooltip } from '~/components/tooltips/base';

import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkAbbr } from '~/utils';
import { NETWORK, TOOLTIP_ID } from '~/types';

import { FaucetTokenCard as FaucetTokenCardEvmSidechain } from './faucet-token-card-evm-sidechain';
import { FaucetTokenCard as FaucetTokenCardXrpl } from './faucet-token-card-xrpl';

export const FaucetList = () => {
  return (
    <Suspense fallback={<_FaucetListSkeleton />}>
      <_FaucetList />
    </Suspense>
  );
};
const _FaucetList = () => {
  const ableNetworks = [NETWORK.XRPL, NETWORK.EVM_SIDECHAIN];

  const { selectedNetwork } = useNetwork();
  const networkAbbr = getNetworkAbbr(selectedNetwork);

  const { userAllTokenBalances, refetch: refetchBalance } = useUserAllTokenBalances();

  const { t } = useTranslation();

  const { data: tokensRawData } = useGetTokensQuery(
    { queries: { filter: `network:in:${networkAbbr}` } },
    { staleTime: 60 * 1000 }
  );
  const { tokens: tokensAll } = tokensRawData || {};

  const getTokens = () => {
    if (!tokensAll) return [];

    return tokensAll
      .filter(token => !token.isLpToken && token.currency !== 'XRP')
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
      .map(token => {
        const balance = userAllTokenBalances?.find(b => b.address === token.address)?.balance ?? 0;
        return { ...token, balance };
      });
  };

  if (!ableNetworks.includes(selectedNetwork)) return;
  return (
    <Wrapper>
      {getTokens().map(token => {
        return (
          <TokenCard key={token.id}>
            {selectedNetwork === NETWORK.XRPL ? (
              <FaucetTokenCardXrpl token={token} refetchBalance={refetchBalance} />
            ) : (
              <FaucetTokenCardEvmSidechain token={token} refetchBalance={refetchBalance} />
            )}
          </TokenCard>
        );
      })}
      <Tooltip id={TOOLTIP_ID.EVM_SIDECHAIN_FAUCET_ADD_TOKEN} place="bottom">
        <TooltipContent>{t('Add token to wallet')}</TooltipContent>
      </Tooltip>
    </Wrapper>
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

const TooltipContent = tw.div``;
