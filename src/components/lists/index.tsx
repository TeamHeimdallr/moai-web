import { HTMLAttributes, ReactNode } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';

import { NETWORK_IMAGE_MAPPER } from '~/constants';

import { NETWORK } from '~/types';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: string;
  network?: string;
  networkSelectIcon?: ReactNode;

  focus?: boolean;
  focused?: boolean;
  error?: boolean;

  children?: ReactNode;
}

export const List = ({
  title,
  network,
  networkSelectIcon,
  focus,
  focused,
  error,
  children,
}: Props) => {
  const networkName =
    network === NETWORK.THE_ROOT_NETWORK
      ? 'The Root Network'
      : network === NETWORK.EVM_SIDECHAIN
      ? 'XRPL EVM Sidechain'
      : network === 'ETHEREUM'
      ? 'Ethereum'
      : 'XRPL';

  return (
    <Wrapper focus={focus} focused={focused} error={error}>
      <TitleWrapper>
        {title && <Header>{title}</Header>}
        {network && (
          <NetworkWrapper>
            <NetworkIcon src={NETWORK_IMAGE_MAPPER[network]} />
            <NetworkInnerWrapper>
              {networkName}
              {networkSelectIcon && networkSelectIcon}
            </NetworkInnerWrapper>
          </NetworkWrapper>
        )}
      </TitleWrapper>
      <Body>{children}</Body>
    </Wrapper>
  );
};

interface WrapperProps {
  focus?: boolean;
  focused?: boolean;
  error?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ focused, focus, error }) => [
  tw`
    w-full rounded-8 flex flex-col bg-neutral-15 overflow-hidden outline outline-1 outline-transparent
  `,
  focus && tw`hover:(outline-neutral-80)`,
  focused && tw`outline-primary-50 hover:(outline-primary-50)`,
  error && focus && tw`outline-red-50 hover:(outline-red-50)`,
  error &&
    css`
      & input {
        color: ${COLOR.RED[50]};
      }
    `,
]);
const TitleWrapper = tw.div`
  w-full flex justify-between bg-neutral-20 px-16 py-12 
`;
const NetworkWrapper = tw.div`
  flex items-center gap-8 font-m-14 text-neutral-100
`;
const NetworkInnerWrapper = tw.div`
  flex items-center gap-2
`;
const NetworkIcon = tw.img`
  w-24 h-24
`;
const Header = tw.div`
  font-m-14 text-neutral-80
`;
const Body = tw.div``;
