import lottie from 'lottie-web/build/player/lottie_light';
import { ButtonHTMLAttributes, useEffect, useRef } from 'react';
import tw, { styled } from 'twin.macro';

import loading from '~/assets/lottie/loading-dot.json';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  isLoading?: boolean;
}
export const ButtonSmall = ({ text, isLoading, ...rest }: Props) => {
  const warpperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!warpperRef.current || !isLoading) return;
    lottie.loadAnimation({
      container: warpperRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: loading,
    });

    return () => {
      lottie.destroy();
    };
  }, [warpperRef, isLoading]);

  return (
    <Wrapper isLoading={isLoading} {...rest}>
      <TextWrapper isLoading={isLoading}>{text}</TextWrapper>
      <LottieWrapper ref={warpperRef} />
    </Wrapper>
  );
};

interface LoadingProps {
  isLoading?: boolean;
}
const Wrapper = styled.button<LoadingProps>(({ isLoading }) => [
  tw`
    h-32 px-16 py-6 flex-center relative
    rounded-8 bg-gray4 clickable
    hover:(bg-gray3)
    disabled:(bg-gray2 non-clickable hover:(bg-gray2))
  `,
  isLoading && tw`text-transparent non-clickable`,
]);

const TextWrapper = styled.div<LoadingProps>(({ isLoading }) => [
  tw`
    font-sb-12 text-white
    disabled:(text-gray5)
  `,
  isLoading && tw`opacity-0`,
]);
const LottieWrapper = tw.div`
  w-full h-full flex-center absolute absolute-center
`;
