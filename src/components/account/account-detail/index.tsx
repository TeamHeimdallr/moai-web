import { Fragment } from 'react';
import copy from 'copy-to-clipboard';
import tw, { styled } from 'twin.macro';
import { zeroAddress } from 'viem';

import { COLOR } from '~/assets/colors';
import { IconCopy, IconDepth, IconLink, IconLogout, IconNext } from '~/assets/icons';
import {
  imageNetworkEvm,
  imageNetworkXRPL,
  imageWalletCrossmark,
  imageWalletFuturepass,
  imageWalletGem,
  imageWalletMetamask,
} from '~/assets/images';

import { ButtonIconSmall } from '~/components/buttons/icon';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { POPUP_ID } from '~/types';

import { FuturepassCreatePopup } from '../futurepass-create-popup';
import { Slippage } from '../slippage';

export const AccountDetail = () => {
  const { evm, xrp, fpass } = useConnectedWallet();
  const { name, isEvm, isFpass, isXrp } = useNetwork();
  const { setWalletType } = useWalletTypeStore();

  const { open: openConnectWallet } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { open: openFuturepassCreate, opened: futurepassCreateOpened } = usePopup(
    POPUP_ID.FUTUREPASS_CREATE
  );

  const xrpComponent = (
    <AccountWrapper key="xrp" isConnected={isXrp}>
      {xrp.address ? (
        <Account key="xrpl">
          <Logo>
            <InnerLogo
              src={xrp.connectedConnector === 'crossmark' ? imageWalletCrossmark : imageWalletGem}
              alt="xrpl"
            />
          </Logo>
          <AddressWrapper>
            <AddressTextWrapper>
              <MediumText>{xrp.truncatedAddress}</MediumText>
              <InnerWrapper>
                {/* TODO: Copied! 문구 2초 노출 */}
                <ButtonIconSmall icon={<IconCopy />} onClick={() => copy(xrp.address ?? '')} />
                <ButtonIconSmall icon={<IconLogout />} onClick={xrp.disconnect} />
              </InnerWrapper>
            </AddressTextWrapper>

            <SmallText>XRPL Network</SmallText>
          </AddressWrapper>
        </Account>
      ) : (
        <AccountNotConnected
          onClick={() => {
            setWalletType({ xrpl: true, evm: false });
            openConnectWallet();
          }}
          key="xrpl-not-connected"
        >
          <Logo>
            <InnerLogo src={imageNetworkXRPL} alt="xrpl" />
          </Logo>
          <ConnectText>Connect wallet</ConnectText>
          <ButtonIconSmall icon={<IconNext width={16} height={16} color={COLOR.NEUTRAL[60]} />} />
        </AccountNotConnected>
      )}
    </AccountWrapper>
  );

  const fpassComponent = (
    <AccountWrapper key="fpass" isConnected={isFpass}>
      {fpass.address && fpass.address !== zeroAddress ? (
        <Account key="fpass">
          <Logo>
            <InnerLogo src={imageWalletFuturepass} alt="futurepass" />
          </Logo>
          <AddressWrapper>
            <AddressTextWrapper>
              <MediumText>{fpass.truncatedAddress}</MediumText>
              <InnerWrapper>
                {/* TODO: Copied! 문구 2초 노출 */}
                <ButtonIconSmall icon={<IconCopy />} onClick={() => copy(fpass.address)} />
                <ButtonIconSmall
                  icon={<IconLink />}
                  onClick={() => window.open('https://futurepass.futureverse.app/account/')}
                />
                <ButtonIconSmall icon={<IconLogout />} onClick={fpass.disconnect} />
              </InnerWrapper>
            </AddressTextWrapper>

            <SmallText>The Root Network</SmallText>

            <MetamaskWallet>
              <IconWrapper>
                <IconDepth />
              </IconWrapper>
              <IconWrapper>
                <InnerLogoSmall src={imageWalletMetamask} alt="metamask" />
              </IconWrapper>
              <SmallTextWhite>{evm.truncatedAddress}</SmallTextWhite>
              <ButtonIconSmall icon={<IconCopy />} onClick={() => copy(evm.address ?? '')} />
            </MetamaskWallet>
          </AddressWrapper>
        </Account>
      ) : (
        <AccountNotConnected
          onClick={() => {
            if (evm.address) {
              openFuturepassCreate();
            } else {
              setWalletType({ xrpl: false, evm: true });
              openConnectWallet();
            }
          }}
          key="fpass-not-connected"
        >
          <Logo>
            <InnerLogo src={imageWalletFuturepass} alt="futurepass" />
          </Logo>
          {evm.address ? (
            <ConnectText>Create Futurepass</ConnectText>
          ) : (
            <ConnectText>Connect wallet</ConnectText>
          )}
          <ButtonIconSmall icon={<IconNext width={16} height={16} color={COLOR.NEUTRAL[60]} />} />
        </AccountNotConnected>
      )}
    </AccountWrapper>
  );

  const evmComponent = (
    <AccountWrapper key="evm" isConnected={isEvm && !isFpass}>
      {evm.address ? (
        <Account key="evm">
          <Logo>
            <InnerLogo src={imageWalletMetamask} alt="metamask" />
          </Logo>
          <AddressWrapper>
            <AddressTextWrapper>
              <MediumText>{evm.truncatedAddress}</MediumText>
              <InnerWrapper>
                {/* TODO: Copied! 문구 2초 노출 */}
                <ButtonIconSmall icon={<IconCopy />} onClick={() => copy(evm.address)} />
                <ButtonIconSmall icon={<IconLogout />} onClick={evm.disconnect} />
              </InnerWrapper>
            </AddressTextWrapper>

            <SmallText>EVM Sidechain</SmallText>
          </AddressWrapper>
        </Account>
      ) : (
        <AccountNotConnected
          onClick={() => {
            setWalletType({ xrpl: false, evm: true });
            openConnectWallet();
          }}
          key="evm-not-connected"
        >
          <Logo>
            <InnerLogo src={imageNetworkEvm} alt="evm" />
          </Logo>
          <ConnectText>Connect wallet</ConnectText>
          <ButtonIconSmall icon={<IconNext width={16} height={16} color={COLOR.NEUTRAL[60]} />} />
        </AccountNotConnected>
      )}
    </AccountWrapper>
  );

  const components = () => {
    return [
      { component: xrpComponent, priority: isXrp ? 13 : 3 },
      {
        component: fpassComponent,
        priority: isFpass ? 12 : 2,
      },
      { component: evmComponent, priority: isEvm && !isFpass ? 11 : 1 },
    ]
      .sort((a, b) => b.priority - a.priority)
      .map(c => c.component);
  };

  return (
    <Wrapper>
      <Panel>
        <Title>
          <TitleText>Account</TitleText>
        </Title>
        <WalletsWrapper>
          {components().map((c, i) => (
            <Fragment key={i}>{c}</Fragment>
          ))}
        </WalletsWrapper>

        <Slippage />
        <Divider />
        <NetworkWrapper>
          <Text>{'Network'}</Text>
          <CurrentNetwork>
            <NetworkStatus />
            <NetworkText>{name}</NetworkText>
          </CurrentNetwork>
        </NetworkWrapper>
      </Panel>
      {futurepassCreateOpened && <FuturepassCreatePopup />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  min-w-290 bg-neutral-15 rounded-8 absolute right-0 box-shadow-default
  sm:top-48 
  md:top-60
`;
const InnerWrapper = tw.div`
  flex-center
`;
const WalletsWrapper = tw.div`flex flex-col gap-8 px-12 pb-12`;

interface AccountProps {
  isConnected?: boolean;
}

const AccountWrapper = styled.div<AccountProps>(({ isConnected }) => [
  tw`w-266 rounded-8 border-1 border-solid`,
  isConnected
    ? tw`border-primary-50 text-primary-50`
    : tw`border-neutral-20 hover:border-neutral-80 text-neutral-100`,
]);

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
  flex gap-12 px-10 py-12 w-full items-center
`;
const AccountNotConnected = tw.div`
  flex gap-12 px-16 py-12 w-full items-center clickable
`;

const AddressWrapper = tw.div`
  flex flex-col w-full
`;

const MediumText = tw.div`
  font-m-14 address
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
  bg-green-50 rounded-100 w-8 h-8
`;

const NetworkText = tw.div`
  text-neutral-80 font-r-12
`;
const SmallText = tw.div`font-r-12 text-neutral-60`;
const SmallTextWhite = tw.div`font-r-12 text-neutral-100 flex-1`;
const AddressTextWrapper = tw.div`flex justify-between`;

const Logo = tw.div`
  rounded-full bg-neutral-0 w-40 h-40 flex-center flex-shrink-0
`;
const InnerLogo = tw.img`
  rounded-full bg-neutral-0 w-24 h-24 flex-center flex-shrink-0
`;
const InnerLogoSmall = tw.img`
  rounded-full w-20 h-20 flex-center flex-shrink-0
`;
const ConnectText = tw.div`
  font-m-14 flex-1
`;

const MetamaskWallet = tw.div`mt-4 py-3 px-6 flex-center gap-4 bg-neutral-10 rounded-4`;
const IconWrapper = tw.div`flex-center`;
