import { ButtonHTMLAttributes, ReactNode, useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import LoadingLottie from '~/assets/lottie/loading-dark.json';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  icon: ReactNode;

  buttonType?: 'filled' | 'outlined';
  hideLottie?: boolean;
  isLoading?: boolean;
}

export const ButtonPrimaryMediumIconLeading = ({
  text,
  icon,
  isLoading,
  buttonType = 'filled',
  hideLottie,
  disabled,
  ...rest
}: Props) => {
  const warpperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!warpperRef.current || !isLoading || disabled || hideLottie) return;
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
  }, [warpperRef, isLoading, disabled, hideLottie]);

  return (
    <Wrapper
      disabled={disabled || isLoading}
      isLoading={isLoading}
      buttonType={buttonType}
      {...rest}
    >
      <IconWrapper className="icon">{icon}</IconWrapper>
      {text}
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
    gap-6 pr-16 py-8 inline-flex-center rounded-10 clickable font-m-14 text-primary-60 relative bg-neutral-10 transition-colors

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
  css`
    & .icon svg {
      width: 20px;
      height: 20px;

      fill: ${COLOR.PRIMARY[60]};
      transition-property: background-color, border-color, color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    &:hover .icon svg {
      fill: ${COLOR.NEUTRAL[0]};
    }

    &:disabled .icon svg,
    &:disabled:hover .icon svg {
      fill: ${COLOR.NEUTRAL[40]};
    }
  `,
  isLoading &&
    css`
      & .icon svg,
      &:disabled .icon svg,
      &:disabled:hover .icon svg {
        fill: transparent;
      }
    `,
  buttonType === 'outlined' &&
    tw`
      bg-transparent border-solid border-1 border-primary-60 text-primary-60
      disabled:(border-transparent non-clickable bg-neutral-5 text-neutral-40)
    `,
  buttonType === 'outlined' &&
    isLoading &&
    css`
      & svg {
        fill: ${COLOR.PRIMARY[60]};
      }
    `,
]);

const IconWrapper = tw.div`
  w-20 h-20 flex-center
`;

const LottieWrapper = tw.div`
  w-full h-full flex-center absolute absolute-center
`;
