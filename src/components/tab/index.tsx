import { useEffect, useRef, useState } from 'react';
import tw, { css, styled } from 'twin.macro';

const shadowLeft = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="24"
      y="24"
      width="24"
      height="24"
      transform="rotate(-180 24 24)"
      fill="url(#paint0_linear_1423_55352)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_1423_55352"
        x1="48"
        y1="36"
        x2="24"
        y2="36"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#23263A" />
        <stop offset="1" stopColor="#23263A" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

const shadowRight = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" fill="url(#paint0_linear_1423_55139)" />
    <defs>
      <linearGradient
        id="paint0_linear_1423_55139"
        x1="24"
        y1="12"
        x2="0"
        y2="12"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#23263A" />
        <stop offset="1" stopColor="#23263A" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

interface Props {
  tabs: {
    key: string;
    name: string;
    disabled?: boolean;
  }[];
  gap?: number;
  type?: 'large' | 'medium';
  onClick?: (name: string) => void;
  selectedTab?: string;
}

export const Tab = ({ tabs, gap = 24, type = 'medium', onClick, selectedTab }: Props) => {
  const [shadowOnLeft, setShadowOnLeft] = useState(false);
  const [shadowOnRight, setShadowOnRight] = useState(false);
  const [bothShowing, setBothShowing] = useState(false);

  const tab0Ref = useRef(null);
  const tab1Ref = useRef(null);

  useEffect(() => {
    const options = {
      root: document.querySelector('#scrollArea'),
      rootMargin: '0px',
      threshold: 1.0,
    };

    const callback = entries => {
      const tab0Entry = entries.find(entry => entry.target.id === 'tab-0');
      const tab1Entry = entries.find(entry => entry.target.id === 'tab-1');

      if (tab0Entry && tab1Entry) {
        setBothShowing(tab0Entry.isIntersecting && tab1Entry.isIntersecting);
      }

      if (tab0Entry) {
        setShadowOnLeft(!tab0Entry.isIntersecting);
      }

      if (tab1Entry) {
        setShadowOnRight(!tab1Entry.isIntersecting);
      }
    };

    const observer = new IntersectionObserver(callback, options);

    if (tab0Ref.current) {
      observer.observe(tab0Ref.current);
    }

    if (tab1Ref.current) {
      observer.observe(tab1Ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <Wrapper>
      <InnerWrapper gap={gap}>
        {!bothShowing && shadowOnLeft && <ShadowLeft>{shadowLeft}</ShadowLeft>}
        {tabs.map((tab, index) => {
          const handleClick = () => {
            if (tab.disabled) return;
            onClick?.(tab.key);
          };

          return (
            <Text
              ref={index === 0 ? tab0Ref : tab1Ref}
              id={`tab-${index}`}
              key={tab.key}
              selected={tab.key === selectedTab}
              disabled={tab.disabled}
              onClick={handleClick}
              type={type}
            >
              {tab.name}
            </Text>
          );
        })}
        {!bothShowing && shadowOnRight && <ShadowRight>{shadowRight}</ShadowRight>}
      </InnerWrapper>
    </Wrapper>
  );
};

interface DivProps {
  gap: number;
}
const Wrapper = tw.div`relative`;
const InnerWrapper = styled.div<DivProps>(({ gap }) => [
  tw`
    flex overflow-auto
  `,
  css`
    gap: ${gap}px;
    ::-webkit-scrollbar {
      display: none;
    }
  `,
]);

interface TextProps {
  selected?: boolean;
  type: string;
  disabled?: boolean;
}

const Text = styled.div<TextProps>(({ selected, type, disabled }) => [
  tw`clickable flex-shrink-0
  `,
  selected ? tw`text-primary-60` : tw`text-neutral-60 hover:text-primary-80`,
  type === 'large' ? tw`font-b-18` : tw`font-b-16`,
  disabled && tw`text-neutral-60 non-clickable hover:text-neutral-60`,
]);

const ShadowLeft = tw.div`absolute left-0`;
const ShadowRight = tw.div`absolute -right-1`;
