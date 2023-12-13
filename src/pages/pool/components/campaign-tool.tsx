import { css } from '@emotion/react';
import tw, { styled } from 'twin.macro';

import { IconNext, IconTokenMoai, IconTokenRoot, IconTokenXrp } from '~/assets/icons';

import {
  ButtonPrimaryLarge,
  ButtonPrimaryMedium,
  ButtonPrimaryMediumIconTrailing,
} from '~/components/buttons';
import { ButtonPrimaryLargeIconTrailing } from '~/components/buttons/primary/large-icon-trailing';
import { TokenInfo } from '~/components/token-info-transparent';

import { useMediaQuery } from '~/hooks/utils';

export const CampaignTool = () => {
  const { isMD } = useMediaQuery();
  return (
    <Wrapper>
      <TitleWrapper>
        <Title>My voyage</Title>
        <ButtonWrapper>
          {isMD ? (
            <ButtonPrimaryLargeIconTrailing text="Add liquidity" icon={<IconNext />} />
          ) : (
            <ButtonPrimaryMediumIconTrailing text="Add liquidity" icon={<IconNext />} />
          )}
        </ButtonWrapper>
      </TitleWrapper>
      <Divider></Divider>
      <ContentWrapper>
        <ContentInnerWrapper>
          <TitleSmall>My liquidity</TitleSmall>
          <TokenInfo
            token="XRP"
            icon={<IconTokenXrp width={36} height={36} />}
            balance="0.000000"
            value="$0.00"
            button={
              isMD ? (
                <ButtonPrimaryLarge buttonType="outlined" text="Withdraw" />
              ) : (
                <ButtonPrimaryMedium buttonType="outlined" text="Withdraw" />
              )
            }
          />
        </ContentInnerWrapper>
        <ContentInnerWrapper>
          <TitleSmall>Rewards</TitleSmall>
          <TokenInfoWrapper>
            <TokenInfo
              token="veMOI"
              icon={<IconTokenMoai width={36} height={36} />}
              balance="0.000000"
              value="$0.00"
            />
            <TokenInfo
              token="XRP"
              icon={<IconTokenRoot width={36} height={36} />}
              balance="0.000000"
              value="$0.00"
              button={
                isMD ? (
                  <ButtonPrimaryLarge buttonType="outlined" text="Claim" />
                ) : (
                  <ButtonPrimaryMedium buttonType="outlined" text="Claim" />
                )
              }
            />
          </TokenInfoWrapper>
        </ContentInnerWrapper>
      </ContentWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div(() => [
  tw`relative w-full flex flex-col rounded-12 bg-transparent bg-campaign bg-no-repeat bg-cover `,
  css`
    background-position: 58% 42%;
  `,
  css`
    &::before {
      position: absolute;
      content: '';
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
      border-radius: 12px;
    }
  `,
]);
const TitleWrapper = tw.div`flex justify-between items-center py-16 px-20 z-1
  md:(pt-20 p-24)
`;
const Title = tw.div`font-b-18 text-neutral-100
  md:font-b-20
`;
const ButtonWrapper = tw.div`z-1`;
const Divider = tw.div`w-full h-1 bg-neutral-100/10 z-1`;
const ContentWrapper = tw.div`flex flex-col pt-16 p-20 gap-16 z-1
  md:(pt-20 p-24 gap-20)
`;
const ContentInnerWrapper = tw.div`flex flex-col gap-12`;
const TokenInfoWrapper = tw.div`flex flex-col gap-16 `;
const TitleSmall = tw.div`font-b-14 text-neutral-100
  md:font-b-16
`;
