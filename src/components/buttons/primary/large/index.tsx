import lottie from 'lottie-web/build/player/lottie_light';
import { ButtonHTMLAttributes, useEffect, useRef } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import LoadingLottie from '~/assets/lottie/loading-dark.json';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;

  buttonType?: 'filled' | 'outlined';
  isLoading?: boolean;
}

export const ButtonPrimaryLarge = ({
  text,
  isLoading,
  disabled,
  buttonType = 'filled',
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
      buttonType={buttonType}
      {...rest}
    >
      {isLoading && <LottieWrapper ref={warpperRef} />}
      {text}
    </Wrapper>
  );
};

interface WrapperProps {
  isLoading?: boolean;
  buttonType?: 'filled' | 'outlined';
}
const Wrapper = styled.button<WrapperProps>(({ isLoading, buttonType }) => [
  tw`
    px-26 py-4 min-h-48 inline-flex-center rounded-12 clickable font-m-16 bg-primary-60 text-neutral-0

    hover:(bg-primary-50 text-neutral-0)

    disabled:(bg-neutral-5 text-neutral-40)
    disabled:hover:(bg-neutral-5 text-neutral-40)
  `,
  isLoading &&
    tw`

      bg-primary-60 text-neutral-0 non-clickable
      hover:(bg-primary-60 text-neutral-0)

      disabled:(bg-primary-60 text-neutral-0 non-clickable)
      disabled:hover:(bg-primary-60 text-neutral-0)
    `,
  buttonType === 'outlined' &&
    tw`
      py-3 bg-transparent border-solid px-25 border-1 border-primary-60 text-primary-60

      disabled:(border-none px-26 py-4)
    `,
  buttonType === 'outlined' &&
    isLoading &&
    css`
      & svg {
        fill: ${COLOR.PRIMARY[60]};
      }
    `,
]);

const LottieWrapper = tw.div`
  w-40 h-40 flex-center
`;
