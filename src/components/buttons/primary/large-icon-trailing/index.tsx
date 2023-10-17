import { ButtonHTMLAttributes, ReactNode, useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import LoadingLottie from '~/assets/lottie/loading-dark.json';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  icon: ReactNode;

  buttonType?: 'filled' | 'outlined';
  isLoading?: boolean;
}

export const ButtonPrimaryLargeIconTrailing = ({
  text,
  icon,
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
      <IconWrapper className="icon">{icon}</IconWrapper>
    </Wrapper>
  );
};

interface WrapperProps {
  isLoading?: boolean;
  buttonType?: 'filled' | 'outlined';
}
const Wrapper = styled.button<WrapperProps>(({ isLoading, buttonType }) => [
  tw`
    gap-8 pl-26 pr-20 py-12 min-h-48 inline-flex-center rounded-12 clickable font-m-16 bg-primary-60 text-neutral-0 transition-colors w-full

    hover:(bg-primary-50 text-neutral-0)

    disabled:(bg-neutral-5 text-neutral-40 non-clickable)
    disabled:hover:(bg-neutral-5 text-neutral-40)
  `,
  css`
    & .icon svg {
      width: 20px;
      height: 20px;
      fill: ${COLOR.NEUTRAL[0]};
    }
  `,
  isLoading &&
    tw`
    
    bg-primary-60 text-neutral-0 non-clickable
    hover:(bg-primary-60 text-neutral-0)
    
    disabled:(bg-primary-60 text-neutral-0 non-clickable)
    disabled:hover:(bg-primary-60 text-neutral-0)
    `,
  buttonType === 'outlined' &&
    css`
      & .icon svg {
        fill: ${COLOR.PRIMARY[60]};
        transition-property: background-color, border-color, color, fill, stroke;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
      }
      &:hover .icon svg {
        fill: ${COLOR.NEUTRAL[0]};
      }
    `,
  buttonType === 'outlined' &&
    tw`
      py-11 bg-transparent border-solid pl-25 pr-19 border-1 border-primary-60 text-primary-60

      disabled:(border-none px-26 py-4 non-clickable)
    `,
  buttonType === 'outlined' &&
    isLoading &&
    css`
      & svg {
        fill: ${COLOR.PRIMARY[60]};
      }
      & .icon svg {
        width: 20px;
        height: 20px;
      }
    `,
]);

const LottieWrapper = tw.div`
  w-40 h-40 flex-center
`;
const IconWrapper = tw.div`
  w-20 h-20 flex-center
`;
