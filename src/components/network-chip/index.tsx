import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconNetworkEvm, IconNetworkRoot, IconNetworkXrpl } from '~/assets/icons';

interface Props {
  network: string;
}

export const NetworkChip = ({ network }: Props) => {
  const networkMap = {
    XRPL: {
      name: 'XRPL',
      icon: IconNetworkXrpl,
      color: COLOR.CHAIN.XRPL,
    },
    ROOT: {
      name: 'Root Network',
      icon: IconNetworkRoot,
      color: COLOR.CHAIN.ROOT,
    },
    EVM: {
      name: 'Evm Sidechain',
      icon: IconNetworkEvm,
      color: COLOR.CHAIN.EVM,
    },
  };
  return (
    <Wrapper color={networkMap[network].color}>
      <IconWrapper>{networkMap[network].icon()} </IconWrapper>
      <Network>{networkMap[network].name}</Network>
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
