import { LazyLoadImage } from 'react-lazy-load-image-component';
import { keyframes } from '@emotion/react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCheck } from '~/assets/icons';
import { imageStepLoading } from '~/assets/images';

interface Props {
  totalSteps: number;
  step: number;
  isLoading: boolean;
  isDone?: boolean;
}
enum Progress {
  CURRENT = 0,
  DONE = 1,
  TODO = 2,
}
export const LoadingStep = ({ totalSteps, step, isLoading, isDone = false }: Props) => {
  return (
    <Wrapper>
      {Array.from(Array(totalSteps)).map((_, i) => {
        const progress = isDone
          ? Progress.DONE
          : i + 1 === step
          ? Progress.CURRENT
          : i + 1 < step
          ? Progress.DONE
          : Progress.TODO;
        return (
          <Wrapper key={i}>
            <Step progress={progress} isLoading={isLoading} key={i}>
              {progress === Progress.DONE ? (
                <IconWrapper>
                  <IconCheck width={24} height={24} fill={COLOR.GREEN[50]} />
                </IconWrapper>
              ) : (
                <>
                  {progress === Progress.CURRENT && isLoading ? (
                    <IconAndText>
                      <LoadingIcon src={imageStepLoading} width={32} height={32} />
                      {(i + 1).toString()}
                    </IconAndText>
                  ) : (
                    <>{(i + 1).toString()}</>
                  )}
                </>
              )}
            </Step>
            {i !== totalSteps - 1 && <Divider key={`divider-${i}`} />}
          </Wrapper>
        );
      })}
    </Wrapper>
  );
};

const LoadingIcon = styled(LazyLoadImage)(() => [tw`absolute animate-spin`]);

const Wrapper = tw.div`
  flex items-center flex-center
`;

interface StepProps {
  progress: number;
  isLoading: boolean;
}
const Step = styled.div<StepProps>(({ progress, isLoading }) => [
  tw`
    flex rounded-16 w-32 h-32 border-1 border-solid p-10 gap-10 border-primary-20 items-center justify-center font-m-16 text-neutral-80
  `,
  progress === Progress.CURRENT && tw`border-primary-50 text-primary-50`,
  progress === Progress.CURRENT && isLoading && tw`border-none`,
  progress === Progress.DONE && tw`border-green-50`,
  progress === Progress.TODO && tw`border-primary-20 text-neutral-80`,
]);

const Divider = tw.div`
  w-48 h-1 flex-shrink-0 bg-neutral-20
`;

const IconWrapper = tw.div`
  w-24 h-24 flex-center flex-shrink-0
`;

const IconAndText = tw.div`
  flex items-center justify-center relative
`;
