import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCheck } from '~/assets/icons';
import { imageStepLoading } from '~/assets/images';

import { useStep } from '../hooks/use-step';

export const StepProgress = () => {
  const { step, stepStatus } = useStep();

  return (
    <Wrapper>
      {stepStatus.map(({ status, id }) => {
        return (
          <Wrapper key={id}>
            <Step status={status} current={id === step}>
              {status === 'done' && (
                <IconWrapper>
                  <IconCheck width={24} height={24} fill={COLOR.GREEN[50]} />
                </IconWrapper>
              )}
              {status === 'loading' && (
                <IconAndText>
                  <LoadingIcon src={imageStepLoading} width={32} height={32} />
                  {id.toString()}
                </IconAndText>
              )}
              {status === 'idle' && <>{id}</>}
            </Step>

            {id !== stepStatus.length && <Divider key={`divider-${id}`} />}
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
  current: boolean;
  status: 'idle' | 'loading' | 'done';
}
const Step = styled.div<StepProps>(({ current, status }) => [
  tw`
    flex rounded-16 w-32 h-32 border-1 border-solid p-10 gap-10 border-primary-20
    items-center justify-center font-m-16 text-neutral-80
  `,

  status === 'idle' && tw`border-primary-20 text-neutral-80`,
  status === 'idle' && current && tw`border-primary-50 text-primary-50`,
  status === 'loading' && tw`border-none`,
  status === 'done' && tw`border-green-50`,
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
