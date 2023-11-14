import tw from 'twin.macro';

import Logo1 from '~/assets/logos/logo-campaign-1.svg?react';
import Logo2 from '~/assets/logos/logo-campaign-2.svg?react';

import { ButtonPrimaryLarge } from '~/components/buttons';

import { useMediaQuery } from '~/hooks/utils';
import { formatNumberWithComma, formatPercent } from '~/utils';

export const Contents = () => {
  const value = 125928000;
  const apy = 0.1;
  const { isMD } = useMediaQuery();
  return (
    <Wrapper>
      <ContentWrapper>
        <Title>Activate your $XRP</Title>
        <LogoWrapper>
          <Logo1 width={isMD ? 249 : 149} height={isMD ? 70 : 24} />
          <Logo2 width={isMD ? 489 : 293} height={isMD ? 70 : 24} />
        </LogoWrapper>
        <TextMain>
          {
            "Before the official launch of Mainnet DEX on The Root Network, we invite $XRP holders\nwithin XRPL to embark on our 'Liquidity Voyage.' By joining this journey, participants\nhave the unique opportunity to provide early liquidity to The Root Network. In return,\nthey'll gain exclusive access to $MOAI pre-mining and special $ROOT rewards."
          }
        </TextMain>
        <InfoWrapper>
          <Info>
            <Label>Total value locked</Label>
            <Text>${formatNumberWithComma(value)}</Text>
          </Info>
          <Info>
            <Label>Expected APY</Label>
            <Text>{formatPercent(apy)}</Text>
          </Info>
        </InfoWrapper>
      </ContentWrapper>

      <ButtonWrapper>
        <ButtonPrimaryLarge text="Activate $XRP" />
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`w-320 min-h-screen pt-112 flex flex-col gap-20 text-neutral-100 sm:pt-96 md:(w-780 gap-40 pt-292) xl:(w-760) xxl:(w-840)`;

const ContentWrapper = tw.div`flex flex-col gap-24`;
const Title = tw.div`font-b-20`;
const LogoWrapper = tw.div`flex gap-12 svg-shadow w-754 flex-col md:(flex-row gap-18)`;
const ButtonWrapper = tw.div`w-157`;
const TextMain = tw.div`font-r-16 whitespace-pre-line md:w-full`;
const InfoWrapper = tw.div`flex gap-20 flex-col md:(flex-row) xxl:(gap-40)`;
const Info = tw.div`w-full px-24 py-20 flex flex-col gap-16 rounded-12 bg-neutral-100 bg-opacity-10 backdrop-blur-sm xl:(w-370) xxl:(w-400)`;
const Label = tw.div`font-m-16 text-neutral-80`;
const Text = tw.div`font-m-24`;
