import tw from 'twin.macro';

import { Pending } from '../components/pending';
import { TokenCard } from '../components/token-card';
import { TokenList } from '../components/token-list';

export const LiquidityPoolLayout = () => {
  // TODO : connect API
  const myDepositBalance = 123123;
  const myDepositValue = myDepositBalance;
  const myMoaiRewardBalance = 123123;
  const myMoaiRewardValue = myMoaiRewardBalance;
  const myRootRewardBalance = 123123;
  const myRootRewardValue = myRootRewardBalance;

  return (
    <Wrapper>
      <MyInfoWrapper>
        <Title>My Voyage</Title>
        <CardWrapper>
          <TokenCard
            title="Balance"
            token={
              <TokenList
                type="medium"
                token="XRP"
                balance={myDepositBalance}
                value={myDepositValue}
              />
            }
          />
          <TokenCard
            title="Rewards"
            token={
              <TokenWrapper>
                <TokenList token="MOAI" balance={myMoaiRewardBalance} value={myMoaiRewardValue} />
                <TokenList token="ROOT" balance={myRootRewardBalance} value={myRootRewardValue} />
              </TokenWrapper>
            }
          />
        </CardWrapper>
      </MyInfoWrapper>
      <Pending />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col pt-60 gap-24 text-neutral-100
`;

const MyInfoWrapper = tw.div`
  flex flex-col gap-24 justify-center w-full
`;
const CardWrapper = tw.div`flex gap-40 w-full`;

const TokenWrapper = tw.div`flex gap-16`;

const Title = tw.div`
  font-b-24 text-neutral-100
`;
