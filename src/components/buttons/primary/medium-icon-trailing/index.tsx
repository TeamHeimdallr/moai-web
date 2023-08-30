import lottie from 'lottie-web/build/player/lottie_light';
import { ButtonHTMLAttributes, ReactNode, useEffect, useRef } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import LoadingLottie from '~/assets/lottie/loading-dark.json';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  icon: ReactNode;

  isLoading?: boolean;
}

export const ButtonPrimaryMediumIconTrailing = ({
  text,
  icon,
  isLoading,
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
    <Wrapper disabled={disabled || isLoading} isLoading={isLoading} {...rest}>
      {text}
      <IconWrapper className="icon">{icon}</IconWrapper>
      {isLoading && <LottieWrapper ref={warpperRef} />}
    </Wrapper>
  );
};

interface WrapperProps {
  isLoading?: boolean;
}
const Wrapper = styled.button<WrapperProps>(({ isLoading }) => [
  tw`
    gap-6 pr-8 pl-16 py-9 inline-flex-center rounded-10 clickable font-m-14 text-primary-60 relative bg-neutral-10

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
]);

const IconWrapper = tw.div`
  w-20 h-20 flex-center
`;

const LottieWrapper = tw.div`
  w-full h-full flex-center absolute absolute-center
`;
