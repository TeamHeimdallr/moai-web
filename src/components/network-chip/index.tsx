import { ReactNode } from 'react';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconNetworkEvm, IconNetworkRoot, IconNetworkXrpl } from '~/assets/icons';

import { NETWORK } from '~/types';

interface Props {
  network: NETWORK;
}
interface NetworkMapData {
  name: string;
  color: string;
  icon: ReactNode;
}

export const NetworkChip = ({ network }: Props) => {
  const networkMap: Record<NETWORK, NetworkMapData> = {
    [NETWORK.XRPL]: {
      name: 'XRPL',
      icon: IconNetworkXrpl,
      color: COLOR.CHAIN.XRPL,
    },
    [NETWORK.THE_ROOT_NETWORK]: {
      name: 'Root Network',
      icon: IconNetworkRoot,
      color: COLOR.CHAIN.ROOT,
    },
    [NETWORK.EVM_SIDECHAIN]: {
      name: 'Evm Sidechain',
      icon: IconNetworkEvm,
      color: COLOR.CHAIN.EVM,
    },
  };

  if (!networkMap[network]) return <></>;
  return (
    <Wrapper color={networkMap[network]?.color}>
      <IconWrapper>{networkMap[network]?.icon}</IconWrapper>
      <Network>{networkMap[network]?.name}</Network>
    </Wrapper>
  );
};

interface WrapperProps {
  color?: string;
}

const Wrapper = styled.div<WrapperProps>(({ color }) => [
  tw`px-12 py-5 flex inline-flex items-center justify-center gap-6 font-m-14 rounded-20`,
  css`
    color: ${color};
    background-color: ${color + '33'};
  `,
]);
const IconWrapper = tw.div`flex-center`;
const Network = tw.div``;
