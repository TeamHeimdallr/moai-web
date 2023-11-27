import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw from 'twin.macro';

import { imageCampaignLighthouse, imageCampaignReward, imageCampaignToken } from '~/assets/images';

export const Section2 = () => {
  return (
    <Wrapper>
      <Container>
        <TextWrapper>
          <Title>Amplified Rewards Await You</Title>
          <Text>Enjoy extra 10% boosted APR over the standard LP rewards.</Text>
        </TextWrapper>
        <ImageWrapper src={imageCampaignReward} />
      </Container>
      <Container>
        <ImageWrapper src={imageCampaignToken} />
        <TextWrapper>
          <Title>All you need is $XRP!</Title>
          <Text>Experience the convenience of single-token deposits.</Text>
        </TextWrapper>
      </Container>
      <Container>
        <TextWrapper>
          <Title>Exclusive Opportunity for Early Engagement</Title>
          <Text>Be among the first to benefit from our initial liquidity pools.</Text>
        </TextWrapper>
        <ImageWrapper src={imageCampaignLighthouse} />
      </Container>
    </Wrapper>
  );
};

const Wrapper = tw.div`flex flex-col w-full gap-120`;
const Container = tw.div`flex w-full items-center gap-24`;
const TextWrapper = tw.div`w-400 flex flex-col gap-24`;
const Title = tw.div`font-b-36 text-neutral-100`;
const Text = tw.div`font-m-20 text-neutral-100`;
const ImageWrapper = tw(LazyLoadImage)``;
