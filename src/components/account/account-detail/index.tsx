import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import copy from 'copy-to-clipboard';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconCopy, IconLogout, IconNext } from '~/assets/icons';

import { ButtonIconSmall } from '~/components/buttons/icon';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';

import { Slippage } from '../slippage';

export const AccountDetail = () => {
  const { evm, xrp } = useConnectedWallet();
  const networkName = useNetwork();

  return (
    <Wrapper>
      <Panel>
        <Title>
          <TitleText>Account</TitleText>
        </Title>
        {evm.address ? (
          <Account>
            <InnerWrapper>
              {/* TODO: icon */}
              <Jazzicon diameter={40} seed={jsNumberForAddress(evm.address || '')} />
            </InnerWrapper>
            <AddressWrapper>
              <AddressTextWrapper>
                <MediumText>{evm.truncatedAddress}</MediumText>
                <InnerWrapper>
                  {/* TODO: Copied! 문구 2초 노출 */}
                  <ButtonIconSmall icon={<IconCopy />} onClick={() => copy(evm.address)} />
                  <ButtonIconSmall icon={<IconLogout />} onClick={evm.disconnect} />
                </InnerWrapper>
              </AddressTextWrapper>

              <SmallText>{`Connected with ${evm.connectedConnector}`}</SmallText>
            </AddressWrapper>
          </Account>
        ) : (
          <AccountNotConnected onClick={evm.connect}>
            <NotConnectedLogo>
              <IconMetamask width={24} height={24} />
            </NotConnectedLogo>
            <ConnectText>Connect with Metamask</ConnectText>
            <IconButton>
              <IconNext width={16} height={16} color={COLOR.NEUTRAL[60]} />
            </IconButton>
          </AccountNotConnected>
        )}
        {xrp.address ? (
          <Account>
            <InnerWrapper>
              <Jazzicon diameter={40} seed={jsNumberForAddress(xrp.address ?? '')} />
            </InnerWrapper>
            <AddressWrapper>
              <AddressTextWrapper>
                <MediumText>{xrp.truncatedAddress}</MediumText>
                <InnerWrapper>
                  {/* TODO: Copied! 문구 2초 노출 */}
                  <ButtonIconSmall icon={<IconCopy />} onClick={() => copy(xrp.address ?? '')} />
                  <ButtonIconSmall icon={<IconLogout />} onClick={xrp.disconnect} />
                </InnerWrapper>
              </AddressTextWrapper>

              <SmallText>{`Connected with ${xrp.connectedConnector}`}</SmallText>
            </AddressWrapper>
          </Account>
        ) : (
          <AccountNotConnected onClick={xrp.connect}>
            <NotConnectedLogo>
              <IconGem width={24} height={24} />
            </NotConnectedLogo>
            <ConnectText>Connect with XRP Wallet</ConnectText>
            <IconButton>
              <IconNext width={16} height={16} color={COLOR.NEUTRAL[60]} />
            </IconButton>
          </AccountNotConnected>
        )}
        <Divider />
        <Slippage />
        <Divider />
        <NetworkWrapper>
          <Text>{'Network'}</Text>
          <CurrentNetwork>
            <NetworkStatus />
            <NetworkText>{networkName}</NetworkText>
          </CurrentNetwork>
        </NetworkWrapper>
      </Panel>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  min-w-294 bg-neutral-15 rounded-8 absolute top-60 right-0 box-shadow-default
`;
const InnerWrapper = tw.div`
  flex-center
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
  flex justify-between gap-16 px-16 py-12 w-full items-center
`;
const AccountNotConnected = tw.div`
  flex justify-between gap-16 px-16 py-12 w-full items-center clickable
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

const NotConnectedLogo = tw.div`
  rounded-full bg-neutral-20 w-40 h-40 flex-center flex-shrink-0
`;

const ConnectText = tw.div`
  font-m-12 text-primary-60 flex-1
`;

const IconButton = tw.div`
  p-4 clickable flex-center
`;
