import Skeleton from 'react-loading-skeleton';
import tw, { css, styled } from 'twin.macro';

import { NETWORK_IMAGE_MAPPER } from '~/constants/constant-network';

import { NETWORK } from '~/types';

interface ListSkeletonProps {
  title?: string;
  network?: string;
  height: number;
}

export const ListSkeleton = ({ title, network, height }: ListSkeletonProps) => {
  const networkName = network === NETWORK.THE_ROOT_NETWORK ? 'The Root Network' : 'XRPL';
  return (
    <Wrapper height={height}>
      {title && (
        <TitleWrapper>
          <Header>{title}</Header>
          {network && (
            <NetworkWrapper>
              <NetworkIcon src={NETWORK_IMAGE_MAPPER[network]} />
              {networkName}
            </NetworkWrapper>
          )}
        </TitleWrapper>
      )}
      <Skeleton
        height={height}
        highlightColor="#3F4359"
        baseColor="#2B2E44"
        duration={0.9}
        style={{ borderRadius: 0, top: -1 }}
      />
    </Wrapper>
  );
};

interface WrapperProps {
  height?: number;
}

const Wrapper = styled.div<WrapperProps>(({ height }) => [
  tw`w-full rounded-8 flex flex-col bg-neutral-15 overflow-hidden`,
  height &&
    css`
      height: ${height}px;
    `,
]);
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
  font-m-14 text-neutral-80
`;
