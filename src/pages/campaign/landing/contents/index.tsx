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
          <Logo1 className="svg-shadow" width={isMD ? 249 : 149} height={isMD ? 70 : 24} />
          <Logo2 className="svg-shadow" width={isMD ? 489 : 293} height={isMD ? 70 : 24} />
        </LogoWrapper>
        <TextMain>
          {
            "Before the official launch of Mainnet DEX on The Root Network, we invite $XRP holders\nwithin XRPL to embark on our 'Voyage to the Future.' By joining this journey, you will \nhave the unique opportunity to provide early liquidity to The Root Network. In return,\n you will gain exclusive access to $MOAI pre-mining and special $ROOT rewards."
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

const Wrapper = tw.div`
  w-full px-20 pt-112 pb-40 flex flex-col gap-40 text-neutral-100 bg-no-repeat bg-campaign bg-cover bg-center
  sm:pt-96 md:(gap-40 pt-292 bg-left bg-top) lg:(min-h-screen) xxl:px-80
`;

const ContentWrapper = tw.div`flex flex-col gap-24 w-320 md:w-full lg:w-840`;
const Title = tw.div`font-b-20`;
const LogoWrapper = tw.div`flex gap-12 flex-col md:(flex-row gap-18)`;
const ButtonWrapper = tw.div`w-157`;
const TextMain = tw.div`w-full font-r-14 md:(font-r-16 whitespace-pre-line)`;
const InfoWrapper = tw.div`flex gap-20 flex-col md:(flex-row) xl:(gap-40)`;
const Info = tw.div`
  w-full px-24 py-20 flex flex-col gap-12 rounded-12 bg-neutral-100 bg-opacity-10 backdrop-blur-sm
  md:gap-16
`;
const Label = tw.div`font-m-14 text-neutral-80 md:font-m-16`;
const Text = tw.div`font-m-20 md:font-m-24`;
