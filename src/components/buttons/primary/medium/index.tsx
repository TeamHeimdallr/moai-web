import lottie from 'lottie-web/build/player/lottie_light';
import { ButtonHTMLAttributes, useEffect, useRef } from 'react';
import tw, { styled } from 'twin.macro';

import LoadingLottie from '~/assets/lottie/loading-dark.json';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;

  isLoading?: boolean;
}

export const ButtonPrimaryMedium = ({ text, isLoading, disabled, ...rest }: Props) => {
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
    <Wrapper disabled={disabled || isLoading} isLoading={isLoading} {...rest}>
      {text}
      {isLoading && <LottieWrapper ref={warpperRef} />}
    </Wrapper>
  );
};

interface WrapperProps {
  isLoading?: boolean;
}
const Wrapper = styled.button<WrapperProps>(({ isLoading }) => [
  tw`
    gap-6 px-16 py-9 inline-flex-center rounded-10 clickable font-m-14 bg-primary-60 relative text-neutral-0

    hover:(bg-primary-50 text-neutral-0)

    disabled:(bg-neutral-5 text-neutral-40 non-clickable)
    disabled:hover:(bg-neutral-5 text-neutral-40)
  `,
  isLoading &&
    tw`
      text-transparent bg-primary-60 non-clickable
      hover:(bg-primary-60 text-transparent)

      disabled:(text-transparent bg-primary-60 non-clickable)
      disabled:hover:(bg-primary-60 text-transparent)
    `,
]);

const LottieWrapper = tw.div`
  w-full h-full flex-center absolute absolute-center
`;
