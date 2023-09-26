import tw from 'twin.macro';

import { IconLink } from '~/assets/icons';

import { ButtonIconMedium } from '~/components/buttons/icon';
import { Token } from '~/components/token';

import { SCANNER_URL } from '~/moai-xrp-ledger/constants';

import { PoolInfo } from '~/moai-xrp-ledger/types/components';

import { TOKEN } from '~/moai-xrp-ledger/types/contracts';

interface Props {
  pool: PoolInfo;
}
export const MainHeader = ({ pool }: Props) => {
  const { compositions, account, fees } = pool;

  return (
    <HeaderWrapper>
      <Title>XRP-MOAI Pool</Title>
      <TokenWrapper>
        {compositions?.map((composition, i) => (
          <Token
            key={`${composition.weight}-${composition.name}-${i}`}
            token={composition.name as TOKEN}
            percentage={composition.weight}
            type="small"
          />
        ))}
        <ButtonIconMedium
          icon={<IconLink />}
          onClick={() => window.open(`${SCANNER_URL}/accounts/${account}`)}
        />
      </TokenWrapper>
      <Text>
        Dynamic swap fees : Currently <Fee>{fees}</Fee>%
      </Text>
    </HeaderWrapper>
  );
};

const HeaderWrapper = tw.div`
  flex flex-col gap-12 gap-12
`;
const Title = tw.div`
  font-b-28 text-neutral-100
`;
const TokenWrapper = tw.div`
  flex gap-8 items-center
`;
const Fee = tw.div`
  font-m-14
`;
const Text = tw.div`
  font-r-14 text-neutral-60 inline-flex whitespace-pre
`;
