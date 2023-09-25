import { useState } from 'react';
import { BaseResponse, dropsToXrp } from 'xrpl';

import { useXrplStore } from '~/moai-xrp-ledger/states/data/xrpl';

interface GetAmmInfoProp {
  asset1: {
    currency: string;
    issuer?: string;
  };
  asset2: {
    currency: string;
    issuer?: string;
  };
}
export const useGetAmmInfo = ({ asset1, asset2 }: GetAmmInfoProp) => {
  const { client } = useXrplStore();
  const [ammInfo, setAmmInfo] = useState<BaseResponse>();
  const [fee, setFee] = useState<string>('0');

  const request = {
    command: 'amm_info',
    asset: asset1,
    asset2: asset2,
    ledger_index: 'validated',
  };

  const checkAmmExist = async () => {
    await client.connect();

    try {
      const info = await client.request(request);
      setAmmInfo(info);
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.data.error === 'actNotFound') {
        console.log(`No AMM exists yet for the pair`);
        return false;
      } else {
        throw err;
      }
    }
  };

  const getFee = async () => {
    const ss = await client.request({ command: 'server_state' });
    const amm_fee_drops = ss.result.state.validated_ledger?.reserve_inc.toString();
    const fee = dropsToXrp(Number(amm_fee_drops ?? '0') * 1e6);
    setFee(fee);
    return fee;
  };

  return {
    checkAmmExist,
    ammInfo,
    getFee,
    fee,
  };
};
