import tw from 'twin.macro';

import { IconLink } from '~/assets/icons';

import { ButtonIconMedium } from '~/components/buttons/icon';
import { Token } from '~/components/token';

import { SCANNER_URL } from '~/moai-xrp-root/constants';

import { PoolInfo } from '~/moai-xrp-root/types/components';

import { TOKEN } from '~/moai-xrp-root/types/contracts';

interface Props {
  pool: PoolInfo;
}
export const MainHeader = ({ pool }: Props) => {
  const { compositions, tokenAddress } = pool;

  return (
    <HeaderWrapper>
      <Title>ROOT-XRP Pool</Title>
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
          onClick={() => window.open(`${SCANNER_URL}/address/${tokenAddress}?tab=erc20_transfers`)}
        />
      </TokenWrapper>
      <Text>
        Dynamic swap fees : Currently <Fee>{`0.3`}</Fee>%
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
