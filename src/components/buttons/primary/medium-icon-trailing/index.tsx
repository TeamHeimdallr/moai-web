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

export const ButtonPrimaryMediumIconTrailing = ({
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
      buttonType={buttonType}
      isLoading={isLoading}
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
    gap-6 pl-16 pr-10 py-9 min-h-40 inline-flex-center rounded-10 clickable font-m-14 bg-primary-60 text-neutral-0 transition-colors w-full

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
    
    bg-primary-60 non-clickable
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
      py-8 bg-transparent border-solid pl-15 pr-9 border-1 border-primary-60 text-primary-60

      disabled:(border-none pl-16 py-9 pr-10 non-clickable)
    `,
  isLoading &&
    css`
      color: transparent !important;

      & .icon svg {
        fill: ${COLOR.PRIMARY[60]};
      }
      & .icon svg {
        width: 20px;
        height: 20px;
      }
    `,
]);

const IconWrapper = tw.div`
  w-20 h-20 flex-center
`;

const LottieWrapper = tw.div`
  w-40 h-40 flex-center absolute absolute-center
`;
