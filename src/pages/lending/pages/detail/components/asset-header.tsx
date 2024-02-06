import { useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { useWalletClient } from 'wagmi';

import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { IconAddToken, IconLink } from '~/assets/icons';

import { ASSET_URL, IS_MAINNET, SCANNER_URL } from '~/constants';

import { ButtonIconMedium } from '~/components/buttons/icon';

import { titleMap } from '~/pages/lending/data';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkAbbr } from '~/utils';
import { NETWORK } from '~/types';

export const AssetHeader = () => {
  const { ref } = useGAInView({ name: 'lending-detail-header' });
  const { gaAction } = useGAAction();

  const { data: walletClient } = useWalletClient();

  const { symbol } = useParams();
  const { selectedNetwork } = useNetwork();

  const networkAbbr = getNetworkAbbr(selectedNetwork);
  const isRoot = selectedNetwork === NETWORK.THE_ROOT_NETWORK;
  const logoUrl = `${ASSET_URL}/images/network-${networkAbbr}.png`;

  const { data: tokenData } = useGetTokenQuery(
    {
      queries: {
        networkAbbr,
        symbol: symbol as string,
      },
    },
    { enabled: !!symbol && !!networkAbbr }
  );
  const { token } = tokenData || {};
  const { address, image, decimal } = token || {};

  const handleLink = () => {
    const url = `${SCANNER_URL[selectedNetwork]}/${isRoot ? 'addresses' : 'token'}/${address}`;

    gaAction({
      action: 'go-to-token',
      data: { component: 'lending-detail-header', address, link: url },
    });

    window.open(url);
  };

  const handleAddToken = async () => {
    if (!address || !symbol || !decimal) return;

    const parseSymbol = () => {
      if (IS_MAINNET) return symbol;

      if (symbol === 'USDC') return 'SepoliaUSDC';
      return symbol;
    };

    await walletClient?.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: address,
          symbol: parseSymbol(),
          decimals: decimal,
        },
      },
    });
  };

  if (!token) return <></>;
  return (
    <HeaderWrapper ref={ref}>
      <SubtitleWrapper>
        <LogoWrapper style={{ backgroundImage: `url(${logoUrl})` }} />
        {`${titleMap[selectedNetwork]} Market`}
      </SubtitleWrapper>
      <TitleWrapper>
        <TokenImageWrapper style={{ backgroundImage: `url(${image})` }} />
        <TitleIconWrapper>
          {symbol}
          <IconWrapper>
            <ButtonIconMedium icon={<IconLink />} onClick={handleLink} />
            <ButtonIconMedium icon={<IconAddToken />} onClick={handleAddToken} />
          </IconWrapper>
        </TitleIconWrapper>
      </TitleWrapper>
    </HeaderWrapper>
  );
};

const HeaderWrapper = tw.div`
  flex flex-col gap-12 px-20
  md:(px-0)
`;

const TitleWrapper = tw.div`
  flex gap-16 items-center
`;

const TokenImageWrapper = tw.div`
  w-40 h-40 rounded-full bg-center bg-no-repeat bg-cover
`;

const TitleIconWrapper = tw.div`
  flex gap-8 items-center font-b-20 text-neutral-100
  md:(font-b-28)
`;

const IconWrapper = tw.div`
  flex-center gap-2
`;

const SubtitleWrapper = tw.div`
  flex gap-8 items-center font-m-14 text-neutral-100
  md:(font-m-16)
`;

const LogoWrapper = tw.div`
  w-24 h-24 bg-center bg-no-repeat bg-cover
`;
