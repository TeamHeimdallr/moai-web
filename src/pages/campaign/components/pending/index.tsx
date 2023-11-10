import { useState } from 'react';
import { useParams } from 'react-router-dom';
import tw, { css, styled } from 'twin.macro';

import { IconDown } from '~/assets/icons';

import { ButtonIconLarge } from '~/components/buttons';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';

import { BridgeHistory } from './bridge-history';

export const Pending = () => {
  const { selectedNetwork } = useNetwork();
  const { network } = useParams();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { currentAddress } = useConnectedWallet(currentNetwork);

  const [opened, open] = useState(false);

  return (
    <Wrapper opened={opened}>
      <TitleWrapper>
        <Title>Pending</Title>
        <Icon opened={opened} onClick={() => open(prev => !prev)}>
          <ButtonIconLarge icon={<IconDown />} />
        </Icon>
      </TitleWrapper>
      {opened && <BridgeHistory />}
    </Wrapper>
  );
};

interface DivProps {
  opened?: boolean;
}
const Wrapper = styled.div<DivProps>(({ opened }) => [
  opened ? tw`pb-24` : tw`pb-20`,
  tw`flex flex-col gap-24 bg-neutral-10 rounded-12 px-24`,
]);
const TitleWrapper = tw.div`flex justify-between pt-20 items-center`;
const Title = tw.div`
  font-b-20 text-neutral-100
`;

const Icon = styled.div<DivProps>(({ opened }) => [
  tw`p-2 transition-transform flex-center clickable`,
  css`
    transform: rotate(${opened ? '-180deg' : '0deg'});
  `,
]);
