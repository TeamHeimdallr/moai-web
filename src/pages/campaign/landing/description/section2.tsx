import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { styled } from 'twin.macro';

import { imageCampaignLighthouse, imageCampaignReward, imageCampaignToken } from '~/assets/images';

export const Section2 = () => {
  return (
    <Wrapper>
      <Container textOnLeft>
        <ImageWrapper>
          <Image src={imageCampaignReward} />
        </ImageWrapper>
        <TextWrapper>
          <Title>Amplified Rewards Await You</Title>
          <Text>Enjoy extra 10% boosted APR over the standard LP rewards.</Text>
        </TextWrapper>
      </Container>
      <Container>
        <ImageWrapper>
          <Image src={imageCampaignToken} />
        </ImageWrapper>
        <TextWrapper>
          <Title>All you need is $XRP!</Title>
          <Text>Experience the convenience of single-token deposits.</Text>
        </TextWrapper>
      </Container>
      <Container textOnLeft>
        <ImageWrapper>
          <Image src={imageCampaignLighthouse} />
        </ImageWrapper>
        <TextWrapper>
          <Title>Exclusive Opportunity for Early Engagement</Title>
          <Text>Be among the first to benefit from our initial liquidity pools.</Text>
        </TextWrapper>
      </Container>
    </Wrapper>
  );
};

const Wrapper = tw.div`flex flex-col w-full gap-80 pb-80
  md:gap-120
`;
interface Props {
  textOnLeft?: boolean;
}
const Container = styled.div<Props>(({ textOnLeft }) => [
  tw`flex flex-col w-full items-center gap-40
  md:(flex-row justify-between)
  `,
  textOnLeft && tw`md:(flex-row-reverse)`,
]);
const TextWrapper = tw.div`w-full flex flex-col gap-12 text-center
  md:(gap-24 text-left w-1/3) 
  xl:w-400
`;
const Title = tw.div`w-full font-b-24 text-neutral-100
  md:font-b-36
`;
const Text = tw.div`w-full font-m-18 text-neutral-100
  md:font-m-20
`;
const ImageWrapper = tw.div`
  xs:w-360
  md:w-2/3
  xl:w-auto
  `;
const Image = tw.img`
  w-full
  xl:w-auto
`;
