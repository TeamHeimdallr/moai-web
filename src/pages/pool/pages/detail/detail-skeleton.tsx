import tw, { styled } from 'twin.macro';

import { Footer } from '~/components/footer';
import { Gnb } from '~/components/gnb';
import { SkeletonBase } from '~/components/skeleton/skeleton-base';

import { useMediaQuery } from '~/hooks/utils';

export const PoolDetailSkeleton = () => {
  const { isSMD } = useMediaQuery();
  return isSMD ? <_PoolDetailSkeleton /> : <_PoolDetailMobileSkeleton />;
};

const _PoolDetailSkeleton = () => {
  return (
    <Wrapper>
      <GnbWrapper>
        <Gnb />
      </GnbWrapper>
      <InnerWrapper>
        <TokenWrapper>
          <TokenTopWrapper>
            <SkeletonBase width={40} height={40} type="light" circle inline />
            <SkeletonBase width={40} height={40} type="light" circle inline style={{ left: -20 }} />
            <SkeletonBase
              width={200}
              height={32}
              type="light"
              style={{ borderRadius: 40, left: -20 }}
            />
          </TokenTopWrapper>
          <TokenBottomWrapper>
            <SkeletonBase width={104} height={32} type="light" style={{ borderRadius: 8 }} />
            <SkeletonBase width={104} height={32} type="light" style={{ borderRadius: 8 }} />
          </TokenBottomWrapper>
        </TokenWrapper>
        <ContentWrapper>
          <LeftWrapper>
            <Section1>
              <SkeletonBase width={198} height={108} type="dark" style={{ borderRadius: 12 }} />
              <SkeletonBase width={198} height={108} type="dark" style={{ borderRadius: 12 }} />
              <SkeletonBase width={198} height={108} type="dark" style={{ borderRadius: 12 }} />
              <SkeletonBase width={198} height={108} type="dark" style={{ borderRadius: 12 }} />
            </Section1>
            <SkeletonBase height={318} type="dark" style={{ borderRadius: 12 }} />
            <SkeletonBase height={428} type="dark" style={{ borderRadius: 12 }} />
            <SkeletonBase height={80} type="dark" style={{ borderRadius: 12 }} />
            <SkeletonBase height={80} type="dark" style={{ borderRadius: 12 }} />
          </LeftWrapper>
          <RightWrapper>
            <SkeletonBase width={400} height={365} type="dark" style={{ borderRadius: 12 }} />
          </RightWrapper>
        </ContentWrapper>
      </InnerWrapper>
      <Footer />
    </Wrapper>
  );
};

const _PoolDetailMobileSkeleton = () => {
  return (
    <Wrapper>
      <GnbWrapper>
        <Gnb />
      </GnbWrapper>
      <InnerWrapper>
        <TokenWrapper>
          <TokenTopWrapper>
            <SkeletonBase width={40} height={40} type="light" circle inline />
            <SkeletonBase width={40} height={40} type="light" circle inline style={{ left: -20 }} />
            <SkeletonBase
              width={120}
              height={22}
              type="light"
              style={{ borderRadius: 40, left: -20 }}
            />
          </TokenTopWrapper>
          <TokenBottomWrapper>
            <SkeletonBase width={104} height={32} type="light" style={{ borderRadius: 8 }} />
            <SkeletonBase width={104} height={32} type="light" style={{ borderRadius: 8 }} />
          </TokenBottomWrapper>
        </TokenWrapper>
        <ContentWrapper>
          <SkeletonBase height={307} type="dark" style={{ borderRadius: 12 }} />
          <Section1>
            <LeftWrapper>
              <SkeletonBase height={92} type="dark" style={{ borderRadius: 12 }} />
              <SkeletonBase height={92} type="dark" style={{ borderRadius: 12 }} />
            </LeftWrapper>
            <RightWrapper>
              <SkeletonBase height={92} type="dark" style={{ borderRadius: 12 }} />
              <SkeletonBase height={92} type="dark" style={{ borderRadius: 12 }} />
            </RightWrapper>
          </Section1>
          <SkeletonBase height={378} type="dark" style={{ borderRadius: 12 }} />
          <SkeletonBase height={452} type="dark" style={{ borderRadius: 12 }} />
          <SkeletonBase height={72} type="dark" style={{ borderRadius: 12 }} />
          <SkeletonBase height={72} type="dark" style={{ borderRadius: 12 }} />
        </ContentWrapper>
      </InnerWrapper>
      <Footer />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  relative flex flex-col justify-between w-full h-full
`;
interface DivProps {
  banner?: boolean;
}
const GnbWrapper = styled.div<DivProps>(({ banner }) => [
  tw`
    w-full absolute top-0 left-0 flex-center flex-col z-10
  `,
  banner ? tw`h-124 mlg:(h-140)` : tw`h-72 mlg:(h-80)`,
]);
const InnerWrapper = styled.div<DivProps>(({ banner }) => [
  tw`  
    flex flex-col pt-120 pb-120 pt-112 gap-40
    smd:(px-20)
    mlg:(pt-120)
    xl:(px-80)
    xxl:items-center
  `,
  banner &&
    tw`
      pt-164
      md:(pt-172)
      mlg:(pt-180)
    `,
]);
const TokenWrapper = tw.div`flex flex-col gap-16 px-20 
  smd:px-0
  xxl:(w-full items-start px-20)
`;
const TokenTopWrapper = tw.div`flex items-center gap-12`;
const TokenBottomWrapper = tw.div`flex items-center gap-8`;
const ContentWrapper = tw.div`
  flex flex-col gap-24
  smd:(flex-row gap-40)   
`;
const LeftWrapper = tw.div`w-full flex flex-col gap-16 
  smd:(gap-24 w-auto)
`;
const RightWrapper = tw.div`w-full flex flex-col gap-16
  smd:w-auto
`;
const Section1 = tw.div`w-full flex gap-16`;
