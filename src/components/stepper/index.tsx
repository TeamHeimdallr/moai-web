import lottie from 'lottie-web/build/player/lottie_light';
import { useEffect, useRef } from 'react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCheck } from '~/assets/icons';
import LoadingLottie from '~/assets/lottie/loading-circle.json';

interface StepperProps {
  totalSteps: number;
  step: number;
  isLoading: boolean;
}
enum Progress {
  CURRENT = 0,
  DONE = 1,
  TODO = 2,
}
export const Stepper = ({ totalSteps, step, isLoading }: StepperProps) => {
  const warpperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!warpperRef.current || !isLoading) return;
    lottie.loadAnimation({
      container: warpperRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: LoadingLottie,
    });

    return () => {
      lottie.destroy();
    };
  }, [warpperRef, isLoading]);

  return (
    <Wrapper>
      {Array.from(Array(totalSteps)).map((_, i) => {
        const progress =
          i + 1 === step ? Progress.CURRENT : i + 1 < step ? Progress.DONE : Progress.TODO;
        return (
          <>
            <Step progress={progress} isLoading={isLoading} key={i}>
              {progress === Progress.DONE ? (
                <IconWrapper>
                  <IconCheck width={24} height={24} fill={COLOR.GREEN[50]} />
                </IconWrapper>
              ) : (
                <>
                  {progress === Progress.CURRENT && isLoading ? (
                    <LottieWrapper ref={warpperRef} />
                  ) : (
                    <>{(i + 1).toString()}</>
                  )}
                </>
              )}
            </Step>
            {i !== totalSteps - 1 && <Divider key={`divider-${i}`} />}
          </>
        );
      })}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex items-center
`;

interface StepProps {
  progress: number;
}
const Step = styled.div<StepProps>(({ progress }) => [
  tw`
    flex rounded-16 w-32 h-32 border-1 border-solid p-10 gap-10 border-primary-20 items-center justify-center font-m-16 text-neutral-80
  `,
  progress === Progress.CURRENT && tw`border-primary-50 text-primary-50`,
  progress === Progress.DONE && tw`border-green-50`,
  progress === Progress.TODO && tw`border-primary-20 text-neutral-80`,
]);

const Divider = tw.div`
  w-48 h-1 flex-shrink-0 bg-neutral-20
`;

const IconWrapper = tw.div`
  w-24 h-24 flex-center flex-shrink-0
`;

const LottieWrapper = tw.div`
  flex w-full h-full flex-center
`;
