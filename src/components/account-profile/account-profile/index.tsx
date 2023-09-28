import { useRef, useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import copy from 'copy-to-clipboard';
import tw, { styled } from 'twin.macro';
import { useOnClickOutside } from 'usehooks-ts';
import { useDisconnect, useNetwork } from 'wagmi';

import { IconCopy, IconLogout } from '~/assets/icons';

import { CHAIN } from '~/constants';

import { BothConnected } from '~/components/account-profile/both-connected';
import { ButtonIconSmall } from '~/components/buttons/icon';

import { useConnectXrplWallet } from '~/hooks/data/use-connect-xrpl-wallet';
import { truncateAddress } from '~/utils/string';

import { Slippage } from '../slippage';

interface Props {
  gemAddress?: string;
  metamaskAddress?: string;
  bothConnected?: boolean;
}

export const AccountProfile = ({ gemAddress, metamaskAddress, bothConnected }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { chain } = useNetwork();

  const [opened, open] = useState(false);
  const toggle = () => open(!opened);

  useOnClickOutside(ref, () => open(false));

  const getNetworkName = () => {
    if (!CHAIN) return '';

    if (CHAIN === 'root') {
      if (chain?.id === 7668) return 'The Root Network - Mainnet';
      if (chain?.id === 7672) return 'The Root Network - Porcini Testnet';
    }

    if (CHAIN === 'xrpl') return 'The XRP Ledger';
    if (CHAIN === 'xrp-evm') return 'Xrp Evm Sidechain';
  };

  const { disconnect: disconnectMetamask } = useDisconnect();
  const { disconnect: disconnectGemWallet } = useConnectXrplWallet();

  return (
    <Wrapper>
      <Banner ref={ref} opened={opened} onClick={toggle}>
        {bothConnected ? (
          <BothConnected />
        ) : (
          <AccountWrapper>
            <InnerWrapper>
              <Jazzicon
                diameter={24}
                seed={jsNumberForAddress((metamaskAddress || gemAddress) ?? '0x0')}
              />
            </InnerWrapper>
            <ContentWrapper opened={opened}>
              {truncateAddress((metamaskAddress || gemAddress) ?? '0x0', 4)}
            </ContentWrapper>
          </AccountWrapper>
        )}
      </Banner>
      {opened && (
        <DropdownWrapper>
          <Panel>
            <Title>
              <TitleText>{'Account'}</TitleText>
            </Title>
            {metamaskAddress && (
              <Account>
                <InnerWrapper>
                  <Jazzicon diameter={40} seed={jsNumberForAddress(metamaskAddress ?? '0x0')} />
                </InnerWrapper>
                <AddressWrapper>
                  <AddressTextWrapper>
                    <MediumText>{truncateAddress(metamaskAddress ?? '0x0')}</MediumText>
                    <InnerWrapper>
                      {/* TODO: Copied! 문구 2초 노출 */}
                      <ButtonIconSmall
                        icon={<IconCopy />}
                        onClick={() => copy(metamaskAddress ?? '')}
                      />
                      <ButtonIconSmall icon={<IconLogout />} onClick={() => disconnectMetamask()} />
                    </InnerWrapper>
                  </AddressTextWrapper>

                  <SmallText>Connected with Metamask</SmallText>
                </AddressWrapper>
              </Account>
            )}
            {gemAddress && (
              <Account>
                <InnerWrapper>
                  <Jazzicon diameter={40} seed={jsNumberForAddress(gemAddress ?? '0x0')} />
                </InnerWrapper>
                <AddressWrapper>
                  <AddressTextWrapper>
                    <MediumText>{truncateAddress(gemAddress ?? '0x0')}</MediumText>
                    <InnerWrapper>
                      {/* TODO: Copied! 문구 2초 노출 */}
                      <ButtonIconSmall icon={<IconCopy />} onClick={() => copy(gemAddress ?? '')} />
                      <ButtonIconSmall
                        icon={<IconLogout />}
                        onClick={() => disconnectGemWallet()}
                      />
                    </InnerWrapper>
                  </AddressTextWrapper>

                  <SmallText>Connected with Gem Wallet</SmallText>
                </AddressWrapper>
              </Account>
            )}
            <Divider />
            <Slippage />
            <Divider />
            <NetworkWrapper>
              <Text>{'Network'}</Text>
              <CurrentNetwork>
                <NetworkStatus />
                {getNetworkName() && <NetworkText>{getNetworkName()}</NetworkText>}
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
const Wrapper = tw.div`relative`;
interface WrapperProps {
  opened?: boolean;
}
const Banner = styled.div<WrapperProps>(({ opened }) => [
  tw`relative flex h-40 gap-6 select-none bg-neutral-10 rounded-10 clickable`,
  opened ? tw`text-neutral-0` : tw`hover:text-primary-80`,
  opened && tw`bg-neutral-20 hover:bg-neutral-20`,
]);
const AccountWrapper = tw.div`flex-center w-136 gap-6 px-8 py-9`;
const ContentWrapper = styled.div<WrapperProps>(({ opened }) => [
  tw`w-full h-full text-center truncate clickable text-neutral-100 font-m-14 address`,
  opened ? tw`text-primary-60` : tw`hover:text-primary-80 `,
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

const Divider = tw.div`
  w-full h-1 flex-shrink-0 bg-neutral-20
`;

const Account = tw.div`
  flex justify-between gap-16 px-16 py-12 w-full
`;

const AddressWrapper = tw.div`
  gap-1 flex flex-col justify-center
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
const SmallText = tw.div`font-r-11 text-neutral-60`;
const AddressTextWrapper = tw.div`flex justify-between`;
