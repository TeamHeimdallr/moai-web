import { useParams } from 'react-router-dom';
import { Abi, Address, formatEther } from 'viem';
import { useContractRead } from 'wagmi';

import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { useNetwork, useNetworkId } from '~/hooks/contexts/use-network';
import { calcBptOutAmountAndPriceImpact, getNetworkFull } from '~/utils';

import { BALANCER_LP_ABI } from '~/abi';

interface Props {
  amountsIn: number[];
  txHash?: string;
}

export const useCalculateAddLiquidity = ({ amountsIn }: Props) => {
  const { network, id } = useParams();
  const { selectedNetwork, isEvm } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const chainId = useNetworkId(currentNetwork);

  const queryEnabled = !!network && !!id;
  const { data: poolData } = useGetPoolQuery(
    {
      params: {
        networkAbbr: network as string,
        poolId: id as string,
      },
    },
    {
      enabled: queryEnabled,
      staleTime: 1000,
    }
  );
  const { pool } = poolData ?? {};
  const { address: poolAddress, compositions, tradingFee } = pool || {};

  const { data: lpTokenTotalSupplyData } = useContractRead({
    address: poolAddress as Address,
    abi: BALANCER_LP_ABI as Abi,
    functionName: 'totalSupply',
    chainId,

    staleTime: 1000,
    enabled: !!poolAddress && !!chainId && isEvm,
  });
  const lpTokenTotalSupply = Number(formatEther((lpTokenTotalSupplyData as bigint) || 0n));

  if (!isEvm)
    return {
      bptOut: 0,
      priceImpact: 0,
    };

  const { bptOut, priceImpact } = calcBptOutAmountAndPriceImpact({
    balances: compositions?.map(c => c.balance || 0) || [],
    normalizedWeights: compositions?.map(c => c.currentWeight || 0) || [],
    amountsIn,
    bptTotalSupply: lpTokenTotalSupply,
    swapFeePercentage: tradingFee || 0,
  });

  return {
    bptOut,
    priceImpact,
  };
};
