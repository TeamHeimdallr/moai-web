import { ButtonHTMLAttributes, ReactNode, useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import LoadingLottie from '~/assets/lottie/loading-dark.json';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  icon?: ReactNode;

  buttonType?: 'filled' | 'outlined';
  isLoading?: boolean;
}

export const ButtonPrimaryMedium = ({
  text,
  icon,
  isLoading,
  buttonType = 'filled',
  disabled,
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
      {text}
      {!isLoading && icon}
      {isLoading && <LottieWrapper ref={warpperRef} />}
    </Wrapper>
  );
};

interface WrapperProps {
  isLoading?: boolean;
  buttonType?: 'filled' | 'outlined';
}
const Wrapper = styled.button<WrapperProps>(({ isLoading, buttonType }) => [
  tw`
    gap-6 px-16 py-9 inline-flex-center rounded-10 clickable font-m-14 bg-primary-60 relative text-neutral-0 transition-colors w-full gap-6

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
  buttonType === 'outlined' &&
    tw`
      bg-transparent border-solid border-1 border-primary-60 text-primary-60

      disabled:(border-none non-clickable bg-neutral-5 text-neutral-40)
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
  w-full h-full flex-center absolute absolute-center
`;
