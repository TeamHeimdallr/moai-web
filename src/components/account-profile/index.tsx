import copy from 'copy-to-clipboard';
import { useRef, useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import tw, { styled } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';
import { useNetwork } from 'wagmi';

import { useConnectWallet } from '~/hooks/data/use-connect-wallet';
import { truncateAddress } from '~/utils/string';

import { IconCopy, IconLink } from '../icons';

export const AccountProfile = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [slippage, setSlippage] = useState(1);

  const { address, disconnect } = useConnectWallet();
  const { chain } = useNetwork();

  const [opened, open] = useState(false);
  const toggle = () => open(!opened);

  useOnClickOutside(ref, () => open(false));

  const handleLink = () => {
    window.open(`https://explorer.mantle.xyz/address/${address}`);
  };

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
                <Copy onClick={() => copy(address ?? '')}>
                  <IconCopy />
                </Copy>
                <Link onClick={() => handleLink()}>
                  <IconLink />
                </Link>
              </AddressWrapper>
            </AccountWrapper>
            <Divider />
            <SlippageWrapper>
              <SlippageInnerWarpper>
                <SlippageText>Slippage tolerance</SlippageText>
                <SlippageOptions>
                  <SlippageOption selected={slippage === 0} onClick={() => setSlippage(0)}>
                    {'0.5%'}
                  </SlippageOption>
                  <SlippageOption selected={slippage === 1} onClick={() => setSlippage(1)}>
                    {'1.0%'}
                  </SlippageOption>
                  <SlippageOption selected={slippage === 2} onClick={() => setSlippage(2)}>
                    {'2.0%'}
                  </SlippageOption>
                  <SlippageOption selected={slippage === 3} disabled={true}>
                    {'or enter manually'}
                  </SlippageOption>
                </SlippageOptions>
              </SlippageInnerWarpper>
            </SlippageWrapper>
            <Divider />
            <NetworkWrapper>
              <Text>{'Network'}</Text>
              <CurrentNetwork>
                <NetworkStatus />
                {chain && (
                  <NetworkText>
                    {chain.id === 5000
                      ? 'Mantle'
                      : chain.id === 5001
                      ? 'Mantle Testnet'
                      : chain.id === 59144
                      ? 'Linea'
                      : chain.id === 59140
                      ? 'Linea Testnet'
                      : chain.name}
                  </NetworkText>
                )}
              </CurrentNetwork>
            </NetworkWrapper>
          </Panel>
        </DropdownWrapper>
      )}
    </Wrapper>
  );
};

const InnerWrapper = tw.div`
  inline-block
`;

interface WrapperProps {
  opened?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ opened }) => [
  tw`relative flex select-none bg-neutral-10 rounded-10 gap-6 pr-16 pl-8 py-9 w-145 h-40`,
  opened ? tw`text-neutral-0` : tw`hover:text-primary-80`,
  opened ? tw`bg-primary-50` : tw`hover:bg-neutral-20`,
]);

const ContentWrapper = styled.div<WrapperProps>(({ opened }) => [
  tw`w-full h-full clickable truncate text-center text-neutral-100 font-m-14 address`,
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

const SlippageWrapper = tw.div`
  gap-20 px-16 py-12 w-full
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

const Copy = tw.div`
  clickable
`;

const Link = tw.div`
  clickable
`;

const SlippageInnerWarpper = tw.div`
  flex flex-col gap-12 max-w-230
`;

const SlippageText = tw.div`
  text-neutral-100 font-m-16
`;

const SlippageOptions = tw.div`
  flex gap-8 w-full flex-wrap
`;

interface SlippageOptionProps {
  selected?: boolean;
  disabled?: boolean;
}
const SlippageOption = styled.div<SlippageOptionProps>(({ selected, disabled }) => [
  tw`
  gap-10 px-16 py-6 rounded-8 bg-transparent text-neutral-60 font-r-16 border-solid border-1 border-neutral-60 clickable
`,
  !disabled && selected
    ? tw`text-primary-50 border-primary-50 gradient-chip`
    : tw`hover:bg-neutral-20 hover:text-neutral-60 border-neutral-80`,
  disabled && tw`non-clickable`,
]);
