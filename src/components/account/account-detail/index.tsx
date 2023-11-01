import { Fragment } from 'react';
import copy from 'copy-to-clipboard';
import tw from 'twin.macro';
import { zeroAddress } from 'viem';

import { useCreateFuturepass } from '~/api/api-contract/_evm/substrate/create-futurepass';

import { COLOR } from '~/assets/colors';
import { IconCopy, IconLogout, IconNext } from '~/assets/icons';
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

import { Slippage } from '../slippage';

export const AccountDetail = () => {
  const { evm, xrp, fpass } = useConnectedWallet();
  const { name } = useNetwork();
  const { setWalletType } = useWalletTypeStore();

  const { open: openConnectWallet } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { createFuturepass } = useCreateFuturepass();

  const xrpComponent = (
    <AccountWrapper key="xrp">
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
          <ConnectText>Connect with XRP Wallet</ConnectText>
          <IconButton>
            <IconNext width={16} height={16} color={COLOR.NEUTRAL[60]} />
          </IconButton>
        </AccountNotConnected>
      )}
    </AccountWrapper>
  );

  const fpassComponent = (
    <AccountWrapper key="fpass">
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
                <ButtonIconSmall icon={<IconLogout />} onClick={fpass.disconnect} />
              </InnerWrapper>
            </AddressTextWrapper>

            <SmallText>The Root Network</SmallText>
          </AddressWrapper>
        </Account>
      ) : (
        <AccountNotConnected
          onClick={async () => {
            if (evm.address) {
              await createFuturepass();
              fpass.refetch();
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
            <ConnectText>Connect with Futurepass</ConnectText>
          )}
          <IconButton>
            <IconNext width={16} height={16} color={COLOR.NEUTRAL[60]} />
          </IconButton>
        </AccountNotConnected>
      )}
    </AccountWrapper>
  );

  const evmComponent = (
    <AccountWrapper key="evm">
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
          <ConnectText>Connect with Metamask</ConnectText>
          <IconButton>
            <IconNext width={16} height={16} color={COLOR.NEUTRAL[60]} />
          </IconButton>
        </AccountNotConnected>
      )}
    </AccountWrapper>
  );

  const components = () => {
    return [
      { component: xrpComponent, priority: xrp.isConnected ? 13 : 3 },
      {
        component: fpassComponent,
        priority: fpass.address && fpass.address !== zeroAddress ? 12 : 2,
      },
      { component: evmComponent, priority: evm.isConnected ? 11 : 1 },
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
        <Divider />
        {components().map((c, i) => (
          <Fragment key={i}>{c}</Fragment>
        ))}
        <Divider />
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
    </Wrapper>
  );
};

const Wrapper = tw.div`
  min-w-290 bg-neutral-15 rounded-8 absolute top-60 right-0 box-shadow-default
`;
const InnerWrapper = tw.div`
  flex-center
`;
const AccountWrapper = tw.div`w-full`;
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
  flex gap-12 px-16 py-12 w-full items-center
`;
const AccountNotConnected = tw.div`
  flex gap-12 px-16 py-12 w-full items-center clickable
`;

const AddressWrapper = tw.div`
  flex flex-col w-full
`;

const MediumText = tw.div`
  text-neutral-100 font-m-14 address
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
const SmallText = tw.div`font-r-12 text-neutral-60`;
const AddressTextWrapper = tw.div`flex justify-between`;

const Logo = tw.div`
  rounded-full bg-neutral-0 w-40 h-40 flex-center flex-shrink-0
`;
const InnerLogo = tw.img`
  rounded-full bg-neutral-0 w-24 h-24 flex-center flex-shrink-0
`;
const ConnectText = tw.div`
  font-m-12 text-primary-60 flex-1
`;

const IconButton = tw.div`
  p-4 clickable flex-center
`;
