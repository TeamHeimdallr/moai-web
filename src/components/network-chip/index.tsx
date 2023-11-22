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
      icon: <IconNetworkXrpl width={20} height={20} />,
      color: COLOR.CHAIN.XRPL,
    },
    [NETWORK.THE_ROOT_NETWORK]: {
      name: 'The Root Network',
      icon: <IconNetworkRoot width={20} height={20} />,
      color: COLOR.CHAIN.ROOT,
    },
    [NETWORK.EVM_SIDECHAIN]: {
      name: 'Evm Sidechain',
      icon: <IconNetworkEvm width={20} height={20} />,
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
  tw`
    flex inline-flex items-center justify-center max-w-full
    gap-8 font-m-14 pl-10 pr-14 py-5 rounded-8
    md:(py-9 rounded-10)
  `,
  css`
    color: ${color};
    background-color: ${color + '33'};
  `,
]);
const IconWrapper = tw.div`
  flex-center
`;
const Network = tw.div`
  truncate
`;
