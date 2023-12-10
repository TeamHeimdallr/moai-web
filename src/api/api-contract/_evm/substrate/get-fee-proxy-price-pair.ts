import { BigNumber, providers } from 'ethers';
import assert from 'node:assert';

import { ROOT_ASSET_ID } from '~/constants';

interface AmountsIn {
  Ok: [number, number];
}

export type EthersProvider = providers.JsonRpcProvider;
export async function getFeeProxyPricePair(
  provider: EthersProvider,
  gasEstimate: BigNumber,
  feeAssetId: number,
  slippage = 0
): Promise<{ maxPayment: BigNumber; maxFeePerGas: BigNumber; estimateGasCost: BigNumber }> {
  const { lastBaseFeePerGas: maxFeePerGas } = await provider.getFeeData();

  assert(maxFeePerGas);

  // convert gasPrice in ETH to gasPrice in XRP, which has different decimals, one is 18 & one is 6
  const gasCostInEth = gasEstimate.mul((maxFeePerGas.toNumber() * (1 + slippage)).toFixed());
  const remainder = gasCostInEth.mod(10 ** 12);
  const gasCostInXRP = gasCostInEth.div(10 ** 12).add(remainder.gt(0) ? 1 : 0);

  // query the the `dex` to determine the `maxPayment`
  const {
    Ok: [maxPayment],
  } = (await provider.send('dex_getAmountsIn', [
    gasCostInXRP.toNumber(),
    [feeAssetId, ROOT_ASSET_ID.XRP],
  ])) as unknown as AmountsIn;

  return {
    estimateGasCost: gasCostInXRP,
    maxPayment: BigNumber.from(maxPayment.toString()),
    maxFeePerGas,
  };
}
