import copy from 'copy-to-clipboard';
import { useRef, useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import tw, { styled } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';
import { useNetwork } from 'wagmi';

import { IconCopy, IconLink } from '~/assets/icons';
import { ButtonIconSmall } from '~/components/buttons/icon';
import { useConnectWallet } from '~/hooks/data/use-connect-wallet';
import { truncateAddress } from '~/utils/string';

import { Slippage } from '../slippage';

export const AccountProfile = () => {
  const ref = useRef<HTMLDivElement>(null);

  const { address, disconnect } = useConnectWallet();
  const { chain } = useNetwork();

  const [opened, open] = useState(false);
  const toggle = () => open(!opened);

  useOnClickOutside(ref, () => open(false));

  const handleLink = () => {
    window.open(`https://explorer.mantle.xyz/address/${address}`);
  };

  const network =
    chain &&
    (chain.id === 5000
      ? 'Mantle'
      : chain.id === 5001
      ? 'Mantle Testnet'
      : chain.id === 59144
      ? 'Linea'
      : chain.id === 59140
      ? 'Linea Testnet'
      : chain.name);

  return (
    <Wrapper ref={ref} opened={opened}>
      <InnerWrapper>
        <Jazzicon diameter={24} seed={jsNumberForAddress(address ?? '0x')} />
      </InnerWrapper>
      <ContentWrapper onClick={toggle} opened={opened}>
        {truncateAddress(address ?? '0x', 3)}
      </ContentWrapper>
      {opened && (
        <DropdownWrapper>
          <Panel>
            <Title>
              <TitleText>{'Account'}</TitleText>
              <Disconnect onClick={() => disconnect()}>{'Disconnect'}</Disconnect>
            </Title>
            <AccountWrapper>
              <InnerWrapper>
                <Jazzicon diameter={40} seed={jsNumberForAddress(address ?? '0x')} />
              </InnerWrapper>
              <AddressWrapper>
                <MediumText>{truncateAddress(address ?? '0x')}</MediumText>
                {/* TODO: Copied! 문구 2초 노출 */}
                <ButtonIconSmall icon={<IconCopy />} onClick={() => copy(address ?? '')} />
                <ButtonIconSmall icon={<IconLink />} onClick={handleLink} />
              </AddressWrapper>
            </AccountWrapper>
            <Divider />
            <Slippage />
            <Divider />
            <NetworkWrapper>
              <Text>{'Network'}</Text>
              <CurrentNetwork>
                <NetworkStatus />
                {network && <NetworkText>{network}</NetworkText>}
              </CurrentNetwork>
            </NetworkWrapper>
          </Panel>
        </DropdownWrapper>
      )}
    </Wrapper>
  );
};

const InnerWrapper = tw.div`
  flex-center
`;

interface WrapperProps {
  opened?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ opened }) => [
  tw`relative flex h-40 gap-6 pl-8 pr-16 select-none bg-neutral-10 rounded-10 py-9 w-145`,
  opened ? tw`text-neutral-0` : tw`hover:text-primary-80`,
  opened ? tw`bg-primary-50` : tw`hover:bg-neutral-20`,
]);

const ContentWrapper = styled.div<WrapperProps>(({ opened }) => [
  tw`w-full h-full text-center truncate clickable text-neutral-100 font-m-14 address`,
  opened ? tw`text-neutral-0` : tw`hover:text-primary-80`,
]);

const DropdownWrapper = tw.div`
  min-w-294 h-324 bg-neutral-15 rounded-8 absolute top-60 right-0 box-shadow-default
`;

const Panel = tw.div`
  flex flex-col items-start bg-neutral-15 rounded-8
`;

const Title = tw.div`
  flex justify-between px-16 py-20 gap-8 w-full
`;

const TitleText = tw.span`
  text-white font-b-18
`;

const Disconnect = tw.div`
  bg-neutral-10 font-m-12 text-primary-60 gap-6 px-12 py-4 rounded-8 clickable
`;

const Divider = tw.div`
  w-full h-1 flex-shrink-0 bg-neutral-20
`;

const AccountWrapper = tw.div`
  flex justify-between gap-16 px-16 py-12 w-full
`;

const AddressWrapper = tw.div`
  gap-4 flex items-center
`;

const MediumText = tw.div`
  text-neutral-100 font-m-16 address w-158
`;

const NetworkWrapper = tw.div`
  flex justify-between px-16 pb-16 pt-12 w-full
`;

const Text = tw.span`
  text-neutral-100 font-r-14
`;

const CurrentNetwork = tw.div`
  gap-6 flex items-center
`;

const NetworkStatus = tw.div`
  bg-primary-50 rounded-100 w-8 h-8
`;

const NetworkText = tw.div`
  text-neutral-80 font-r-12
`;
