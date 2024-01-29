import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useParams } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import tw, { styled } from 'twin.macro';
import { zeroAddress } from 'viem';

import { COLOR } from '~/assets/colors';
import { IconChange, IconCopy, IconDepth, IconLink, IconLogout, IconNext } from '~/assets/icons';
import {
  imageNetworkEvmSidechain,
  imageNetworkXRPL,
  imageWalletCrossmark,
  imageWalletDcent,
  imageWalletFuturepass,
  imageWalletGem,
  imageWalletMetamask,
  imageWalletXumm,
} from '~/assets/images';

import { IS_MAINNET } from '~/constants';

import { ButtonIconSmall } from '~/components/buttons/icon';
import { ButtonPrimarySmallIconLeading } from '~/components/buttons/primary/small-icon-leading';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull, truncateAddress } from '~/utils';
import { useWalletConnectorTypeStore } from '~/states/contexts/wallets/connector-type';
import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';
import { NETWORK, POPUP_ID } from '~/types';

import { FuturepassCreatePopup } from '../futurepass-create-popup';
import { Slippage } from '../slippage';

export const AccountDetail = () => {
  const { gaAction } = useGAAction();

  const { network } = useParams();

  const { evm, xrp, fpass } = useConnectedWallet();
  const { selectedNetwork, name, isEvm, isFpass, isXrp } = useNetwork();
  const { setWalletConnectorType } = useWalletConnectorTypeStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;
  const isRoot = currentNetwork === NETWORK.THE_ROOT_NETWORK;

  const { open: openConnectWallet } = usePopup(POPUP_ID.CONNECT_WALLET);
  const { open: openFuturepassCreate, opened: futurepassCreateOpened } = usePopup(
    POPUP_ID.FUTUREPASS_CREATE
  );
  const { toggleWallet: toggleWalletTRN, selectedWallet: selectedWalletTRN } =
    useTheRootNetworkSwitchWalletStore();

  const [xrpAddress, setXrpAddress] = useState(xrp.truncatedAddress || '');
  const [fpassAddress, setFpassAddress] = useState(fpass.truncatedAddress || '');
  const [fpassEvmAddress, setFpassEvmAddress] = useState(evm.truncatedAddress || '');
  const [evmAddress, setEvmAddress] = useState(evm.truncatedAddress || '');

  const { t } = useTranslation();

  const handleCopy = (address: string, callback: (truncatedAddress: string) => void) => {
    gaAction({
      action: 'copy-address',
      buttonType: 'icon-small',
      data: { component: 'gnb', address },
    });

    copy(address);

    callback(t('Copied!'));
    setTimeout(() => callback(truncateAddress(address)), 2000);
  };

  const handleGoToFpass = () => {
    gaAction({
      action: 'goto-fpass',
      buttonType: 'icon-small',
      data: { component: 'gnb' },
    });
    window.open('https://futurepass.futureverse.app/account');
  };

  const handleToggleWalletTrn = () => {
    gaAction({
      action: 'toggle-fpass-evm-wallet',
      buttonType: 'primary-small-icon-leading',
      data: {
        component: 'gnb',
        from: selectedWalletTRN,
        to: selectedWalletTRN === 'fpass' ? 'evm' : 'fpass',
      },
    });

    toggleWalletTRN();
  };

  const fpassComponent = (
    <AccountWrapper key="fpass" isConnected={isRoot}>
      {fpass.address && fpass.address !== zeroAddress ? (
        <TRNAccountWrapper>
          <Account key="fpass">
            <Logo>
              <InnerLogo
                src={selectedWalletTRN === 'fpass' ? imageWalletFuturepass : imageWalletMetamask}
                alt="futurepass"
              />
            </Logo>
            <AddressWrapper>
              <AddressTextWrapper>
                <MediumText>
                  {selectedWalletTRN === 'fpass' ? fpassAddress : fpassEvmAddress}
                </MediumText>
                <InnerWrapper>
                  <ButtonIconSmall
                    icon={<IconCopy />}
                    onClick={() => {
                      if (selectedWalletTRN === 'fpass')
                        return handleCopy(fpass.address, setFpassAddress);
                      return handleCopy(evm.address, setFpassEvmAddress);
                    }}
                  />
                  {selectedWalletTRN === 'fpass' && (
                    <ButtonIconSmall icon={<IconLink />} onClick={handleGoToFpass} />
                  )}
                  <ButtonIconSmall
                    icon={<IconLogout />}
                    onClick={() => {
                      gaAction({
                        action: 'disconnect-fpass-evm',
                        buttonType: 'icon-small',
                        data: { component: 'gnb' },
                      });

                      if (selectedWalletTRN === 'fpass') return fpass.disconnect();
                      return evm.disconnect();
                    }}
                  />
                </InnerWrapper>
              </AddressTextWrapper>

              <SmallText>The Root Network</SmallText>

              <MetamaskWallet>
                <IconWrapper>
                  <IconDepth />
                </IconWrapper>
                <IconWrapper>
                  <InnerLogoSmall
                    src={
                      selectedWalletTRN === 'fpass' ? imageWalletMetamask : imageWalletFuturepass
                    }
                    alt="metamask"
                  />
                </IconWrapper>
                <SmallTextWhite>
                  {selectedWalletTRN === 'fpass' ? fpassEvmAddress : fpassAddress}
                </SmallTextWhite>
                <ButtonIconSmall
                  icon={<IconCopy />}
                  onClick={() => {
                    if (selectedWalletTRN === 'fpass')
                      return handleCopy(evm.address, setFpassEvmAddress);
                    return handleCopy(fpass.address, setFpassAddress);
                  }}
                />
              </MetamaskWallet>
            </AddressWrapper>
          </Account>
          <TRNAccountSwitchButtonWrapper>
            <ButtonPrimarySmallIconLeading
              style={{ width: '100%' }}
              text={t(
                selectedWalletTRN === 'fpass' ? 'Switch to MetaMask' : 'Switch to FuturePass'
              )}
              icon={<IconChange width={20} height={20} fill={COLOR.PRIMARY[60]} />}
              onClick={handleToggleWalletTrn}
            />
          </TRNAccountSwitchButtonWrapper>
        </TRNAccountWrapper>
      ) : (
        <AccountNotConnected
          onClick={() => {
            if (evm.address) {
              gaAction({ action: 'create-futurepass', data: { component: 'gnb' } });

              // in mainnet, open futurepass create page
              if (IS_MAINNET) window.open('https://futurepass.futureverse.app/stuff/');
              else openFuturepassCreate();
            } else {
              gaAction({ action: 'connect-fpass-evm', data: { component: 'gnb' } });

              setWalletConnectorType({ network: NETWORK.THE_ROOT_NETWORK });
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
            <ConnectText>{t('Connect wallet')}</ConnectText>
          )}
          <ButtonIconSmall icon={<IconNext width={16} height={16} color={COLOR.NEUTRAL[60]} />} />
        </AccountNotConnected>
      )}
    </AccountWrapper>
  );

  const evmComponent = (
    <AccountWrapper key="evm" isConnected={!isRoot && isEvm}>
      {evm.address ? (
        <Account key="evm">
          <Logo>
            <InnerLogo src={imageWalletMetamask} alt="metamask" />
          </Logo>
          <AddressWrapper>
            <AddressTextWrapper>
              <MediumText>{evmAddress}</MediumText>
              <InnerWrapper>
                <ButtonIconSmall
                  icon={<IconCopy />}
                  onClick={() => handleCopy(evm.address, setEvmAddress)}
                />
                <ButtonIconSmall
                  icon={<IconLogout />}
                  onClick={() => {
                    gaAction({
                      action: 'disconnect-evm',
                      buttonType: 'icon-small',
                      data: { component: 'gnb' },
                    });
                    evm.disconnect();
                  }}
                />
              </InnerWrapper>
            </AddressTextWrapper>

            <SmallText>EVM Sidechain</SmallText>
          </AddressWrapper>
        </Account>
      ) : (
        <AccountNotConnected
          onClick={() => {
            gaAction({ action: 'connect-evm', data: { component: 'gnb' } });

            setWalletConnectorType({ network: NETWORK.EVM_SIDECHAIN });
            openConnectWallet();
          }}
          key="evm-not-connected"
        >
          <Logo>
            <InnerLogo src={imageNetworkEvmSidechain} alt="evm" />
          </Logo>
          <ConnectText>{t('Connect wallet')}</ConnectText>
          <ButtonIconSmall icon={<IconNext width={16} height={16} color={COLOR.NEUTRAL[60]} />} />
        </AccountNotConnected>
      )}
    </AccountWrapper>
  );

  const xrpWalletImage =
    xrp.connectedConnector === 'crossmark'
      ? imageWalletCrossmark
      : xrp.connectedConnector === 'xumm'
      ? imageWalletXumm
      : xrp.connectedConnector === 'dcent'
      ? imageWalletDcent
      : xrp.connectedConnector === 'gem'
      ? imageWalletGem
      : '';
  const xrpComponent = (
    <AccountWrapper key="xrp" isConnected={isXrp}>
      {xrp.address ? (
        <Account key="xrpl">
          <Logo>
            <InnerLogo src={xrpWalletImage} alt="xrpl" />
          </Logo>
          <AddressWrapper>
            <AddressTextWrapper>
              <MediumText>{xrpAddress}</MediumText>
              <InnerWrapper>
                <ButtonIconSmall
                  icon={<IconCopy />}
                  onClick={() => handleCopy(xrp.address, setXrpAddress)}
                />
                <ButtonIconSmall icon={<IconLogout />} onClick={xrp.disconnect} />
              </InnerWrapper>
            </AddressTextWrapper>

            <SmallText>XRPL Network</SmallText>
          </AddressWrapper>
        </Account>
      ) : (
        <AccountNotConnected
          onClick={() => {
            gaAction({ action: 'connect-xrpl', data: { component: 'gnb' } });

            setWalletConnectorType({ network: NETWORK.XRPL });
            openConnectWallet();
          }}
          key="xrpl-not-connected"
        >
          <Logo>
            <InnerLogo src={imageNetworkXRPL} alt="xrpl" />
          </Logo>
          <ConnectText>{t('Connect wallet')}</ConnectText>
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
        priority: isRoot ? 12 : 2,
      },
      { component: evmComponent, priority: isEvm || isFpass ? 11 : 1 },
    ]
      .sort((a, b) => b.priority - a.priority)
      .map(c => c.component);
  };

  return (
    <Wrapper>
      <Panel>
        <Title>
          <TitleText>{t('Account')}</TitleText>
        </Title>
        <WalletsWrapper>
          {components().map((c, i) => (
            <Fragment key={i}>{c}</Fragment>
          ))}
        </WalletsWrapper>

        <Slippage />
        <Divider />
        <NetworkWrapper>
          <Text>{t('Network')}</Text>
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
  min-w-290 bg-neutral-15 rounded-8 absolute right-0 box-shadow-default top-48
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
  flex gap-12 px-10 py-12 w-full items-start
`;

const TRNAccountWrapper = tw.div``;

const TRNAccountSwitchButtonWrapper = tw.div`
  px-10 pb-10 w-full flex
`;

const AccountNotConnected = tw.div`
  flex gap-12 px-10 py-12 w-full items-center clickable
`;

const AddressWrapper = tw.div`
  flex flex-col w-full
`;

const MediumText = tw.div`
  font-m-14 address
`;

const NetworkWrapper = tw.div`
  flex justify-between px-16 py-16 w-full
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
const SmallTextWhite = tw.div`font-r-12 text-neutral-100 flex-1 address`;
const AddressTextWrapper = tw.div`flex justify-between`;

const Logo = tw.div`
  rounded-full bg-neutral-0 w-40 h-40 flex-center flex-shrink-0
`;
const InnerLogo = tw(LazyLoadImage)`
  rounded-full bg-neutral-0 w-24 h-24 flex-center flex-shrink-0
`;
const InnerLogoSmall = tw(LazyLoadImage)`
  rounded-full w-20 h-20 flex-center flex-shrink-0
`;
const ConnectText = tw.div`
  font-m-12 text-neutral-100 flex-1
`;

const MetamaskWallet = tw.div`mt-4 py-3 px-6 flex-center gap-4 bg-neutral-10 rounded-4`;
const IconWrapper = tw.div`flex-center`;
