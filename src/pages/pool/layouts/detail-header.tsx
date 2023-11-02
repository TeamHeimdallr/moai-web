import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { useLiquidityPoolBalance } from '~/api/api-contract/pool/get-liquidity-pool-balance';

import { IconLink } from '~/assets/icons';

import { SCANNER_URL, TOKEN_IMAGE_MAPPER } from '~/constants';

import { ButtonIconMedium } from '~/components/buttons/icon';
import { Token } from '~/components/token';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useRequirePrarams } from '~/hooks/utils';
import { getNetworkFull } from '~/utils';

export const DetailHeader = () => {
  const navigate = useNavigate();
  const { network, id } = useParams();

  useRequirePrarams([!!id, !!network], () => navigate(-1));

  const { pool } = useLiquidityPoolBalance(id ?? '');
  const { compositions, lpTokenAddress } = pool;
  const tokens = compositions?.map(composition => composition.symbol);

  const { selectedNetwork, isFpass } = useNetwork();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const handleLink = () => {
    const url =
      `${SCANNER_URL[currentNetwork]}/address/${lpTokenAddress}` +
      (isFpass ? 'tab=erc20_transfers' : '');

    window.open(url);
  };

  return (
    <HeaderWrapper>
      <TitleWrapper>
        <BadgeWrapper style={{ width: tokens.length * 28 + 12 }}>
          {tokens.map((token, idx) => {
            return (
              <Badge key={token + idx} style={{ left: idx * 28 }}>
                <Image src={TOKEN_IMAGE_MAPPER[token]} />
              </Badge>
            );
          })}
        </BadgeWrapper>
        <Title>{`${tokens?.[0]}/${tokens?.[1]}`}</Title>
      </TitleWrapper>

      <TokenWrapper>
        {compositions?.map((composition, i) => (
          <Token
            key={`${composition.weight}-${composition.symbol}-${i}`}
            token={composition.symbol}
            percentage={composition.weight}
            type="small"
          />
        ))}
        <ButtonIconMedium icon={<IconLink />} onClick={handleLink} />
      </TokenWrapper>
    </HeaderWrapper>
  );
};

const HeaderWrapper = tw.div`
  flex flex-col gap-12 gap-12
`;
const TitleWrapper = tw.div`flex inline-flex gap-16`;
const BadgeWrapper = tw.div`
  flex inline-flex items-center relative h-40
`;
const Badge = tw.div`
  w-40 h-40 absolute flex-center
`;
const Image = tw.img`
  w-40 h-40 object-cover flex-center
`;

const Title = tw.div`
  right-0 font-b-28 text-neutral-100
`;
const TokenWrapper = tw.div`
  flex gap-8 items-center
`;
