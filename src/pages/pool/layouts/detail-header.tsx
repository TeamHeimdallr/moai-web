import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { useLiquidityPoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';

import { IconLink } from '~/assets/icons';

import { SCANNER_URL } from '~/constants';

import { ButtonIconMedium } from '~/components/buttons/icon';
import { Token } from '~/components/token';

import { useRequirePrarams } from '~/hooks/utils';

export const DetailHeader = () => {
  const navigate = useNavigate();
  const { network, id } = useParams();

  useRequirePrarams([!!id, !!network], () => navigate(-1));

  const { pool } = useLiquidityPoolBalance(id ?? '');
  const { compositions, lpTokenAddress } = pool;
  const tokens = compositions?.map(composition => composition.symbol);

  return (
    <HeaderWrapper>
      {/* TODO: change title */}
      <Title>{`${tokens?.[0]}-${tokens?.[1]} Pool`}</Title>
      <TokenWrapper>
        {compositions?.map((composition, i) => (
          <Token
            key={`${composition.weight}-${composition.symbol}-${i}`}
            token={composition.symbol}
            percentage={composition.weight}
            type="small"
          />
        ))}
        <ButtonIconMedium
          icon={<IconLink />}
          onClick={() =>
            window.open(`${SCANNER_URL}/address/${lpTokenAddress}?tab=erc20_transfers`)
          }
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
