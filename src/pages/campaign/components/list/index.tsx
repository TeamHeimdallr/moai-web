import { HTMLAttributes, ReactNode } from 'react';
import tw from 'twin.macro';

import { NETWORK_IMAGE_MAPPER } from '~/constants';

import { NETWORK } from '~/types';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: string;
  network?: NETWORK;
  children?: ReactNode;
}

export const List = ({ title, network, children }: Props) => {
  const networkName = network === NETWORK.THE_ROOT_NETWORK ? 'The Root Network' : 'XRPL';

  return (
    <Wrapper>
      <TitleWrapper>
        {title && <Header>{title}</Header>}
        {network && (
          <NetworkWrapper>
            <NetworkIcon src={NETWORK_IMAGE_MAPPER[network]} />
            {networkName}
          </NetworkWrapper>
        )}
      </TitleWrapper>
      <Body>{children}</Body>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full rounded-8 flex flex-col bg-neutral-15 overflow-hidden
`;
const TitleWrapper = tw.div`
  w-full flex justify-between bg-neutral-20 px-16 py-12 
`;
const NetworkWrapper = tw.div`
  flex items-center gap-8 font-m-14 text-neutral-100
`;
const NetworkIcon = tw.img`
  w-24 h-24
`;
const Header = tw.div`
  font-m-14 text-neutral-100
`;
const Body = tw.div``;
