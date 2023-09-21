import { useXrplStore } from '~/states/data/xrpl';

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
      console.log(info);
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

  return {
    checkAmmExist,
  };
};
