import { ButtonHTMLAttributes, useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import tw, { styled } from 'twin.macro';

import LoadingLottie from '~/assets/lottie/loading-dark.json';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;

  isLoading?: boolean;
  isGrayScale?: boolean;
  isBlack?: boolean;
}

export const ButtonPrimarySmall = ({
  text,
  isLoading,
  disabled,
  isGrayScale,
  isBlack,
  ...rest
}: Props) => {
  const warpperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!warpperRef.current || !isLoading || disabled) return;
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
  }, [warpperRef, isLoading, disabled]);

  return (
    <Wrapper
      disabled={disabled || isLoading}
      isLoading={isLoading}
      isGrayScale={isGrayScale}
      isBlack={isBlack}
      {...rest}
    >
      {text}
      {isLoading && <LottieWrapper ref={warpperRef} />}
    </Wrapper>
  );
};

interface WrapperProps {
  isLoading?: boolean;
  isGrayScale?: boolean;
  isBlack?: boolean;
}
const Wrapper = styled.button<WrapperProps>(({ isLoading, isGrayScale, isBlack }) => [
  tw`
    gap-6 px-12 py-4 inline-flex-center rounded-8 clickable font-m-12 relative transition-colors w-full

    bg-primary-60 text-neutral-0 hover:(bg-primary-50 text-neutral-0)

    disabled:(bg-neutral-5 text-neutral-40 non-clickable)
    disabled:hover:(bg-neutral-5 text-neutral-40)
  `,
  isBlack && tw`bg-neutral-10 text-primary-60`,
  isGrayScale && tw`bg-neutral-10 text-neutral-100 hover:(bg-neutral-100 text-neutral-0)`,

  isLoading &&
    tw`
      text-transparent bg-primary-60 non-clickable
      hover:(bg-primary-60 text-transparent)

      disabled:(text-transparent bg-primary-60  non-clickable)
      disabled:hover:(bg-primary-60 text-transparent)
    `,
]);

const LottieWrapper = tw.div`
  w-full h-full flex-center absolute absolute-center
`;
