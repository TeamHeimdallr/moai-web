import { useNavigate, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';

import { COLOR } from '~/assets/colors';
import { IconBack } from '~/assets/icons';
import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { MyBalanceInfo } from '~/components/my-balance-info';
import { TOKEN_USD_MAPPER } from '~/constants';
import { pools } from '~/data';
import { useGetBalancesAll } from '~/hooks/data/use-balance';
import { useRequirePrarams } from '~/hooks/pages/use-require-params';
import { TokenInfo } from '~/types/components/contracts';

const LiquidityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { address } = useAccount();
  useRequirePrarams([id], () => navigate(-1));

  const { compositions } = pools[Number(id) - 1];
  const { balancesMap } = useGetBalancesAll(address);

  const tokens: TokenInfo[] = compositions.map(compositon => {
    const { name } = compositon;
    const balance = balancesMap?.[name]?.rawValue ?? BigInt(0);

    return {
      name,
      balance: Number(formatEther(balance)),
      value: Number(formatEther(balance)) * TOKEN_USD_MAPPER[name],
    };
  });

  return (
    <Wrapper>
      <GnbWrapper>
        <Gnb />
      </GnbWrapper>
      <InnerWrapper>
        <Header>
          <IconWrapper onClick={() => navigate(-1)}>
            <IconBack fill={COLOR.NEUTRAL[60]} />
          </IconWrapper>
          Add liquidity
        </Header>
        <MyBalanceInfo tokens={tokens} />
      </InnerWrapper>
      <Footer />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative flex flex-col justify-between w-full h-full
`;

const GnbWrapper = tw.div`
  w-full h-80 absolute top-0 left-0 flex-center
`;

const InnerWrapper = tw.div`
  flex flex-col pb-120 pt-80 px-327
`;
const Header = tw.div`flex items-center gap-12 py-40 font-b-24 text-neutral-100`;
const IconWrapper = tw.div`flex-center clickable`;

export default LiquidityPage;
