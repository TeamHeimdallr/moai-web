import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useWeb3Modal } from '@web3modal/react';
import tw, { styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconBack, IconInfo, IconNext } from '~/assets/icons';
import { imageNetworkROOT, imageStepLoading } from '~/assets/images';

import { ButtonIconLarge, ButtonIconSmall, ButtonPrimaryLarge } from '~/components/buttons';

import { TooltipFuturepass } from '~/pages/campaign/components/tooltip-fpass';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { useConnectedWallet } from '~/hooks/wallets';
import { useConnectors } from '~/hooks/wallets/use-connectors';
import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';
import { NETWORK, TOOLTIP_ID } from '~/types';

import { useStep } from '../hooks/use-step';

export const LayoutStep2WalletconnectEvm = () => {
  const { ref } = useGAInView({ name: 'campaign-step-2' });
  const { ref: step2SelectRef } = useGAInView({ name: 'campaign-step-2-select' });

  const { gaAction } = useGAAction();

  const { isOpen, close } = useWeb3Modal();

  const { fpass } = useConnectedWallet();

  const {
    stepStatus2,
    evmWallet,
    evmConnectorIdx,
    setEvmWallet,
    setEvmConnectorIdx,
    setStepStatus,
  } = useStep();
  const [showFpassSelect, setShowFpassSelect] = useState(false);

  const { evm } = useConnectedWallet();
  const { connectors } = useConnectors();
  const { selectWallet } = useTheRootNetworkSwitchWalletStore();

  const { t } = useTranslation();

  const evmConnectors = connectors.filter(c => c.network.includes(NETWORK.THE_ROOT_NETWORK));

  const handleConnect = (connectorIndex: number) => {
    setEvmConnectorIdx(connectorIndex);

    evmConnectors?.[connectorIndex]?.connect();
  };

  useEffect(() => {
    if (evm.isConnecting || isOpen) {
      setStepStatus({ id: 2, status: 'loading' }, 1);
    } else {
      if (evm.address && evmWallet) setStepStatus({ id: 2, status: 'done' }, 1);
      else setStepStatus({ id: 2, status: 'idle' }, 1);

      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evm.isConnecting, evm.address, fpass.address, isOpen]);

  useEffect(() => {
    if (evm.isConnected) {
      if (evmWallet) setShowFpassSelect(false);
      else setShowFpassSelect(true);
    }
  }, [evm.isConnected, evmWallet]);

  useEffect(() => {
    if (evmWallet === 'fpass') {
      selectWallet('fpass');
    }
    if (evmWallet === 'evm') {
      selectWallet('evm');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evmWallet]);

  useEffect(() => {
    if (!evm.isConnected) {
      setShowFpassSelect(false);
      setEvmWallet(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evm.isConnected]);

  return (
    <>
      <Wrapper ref={ref}>
        {showFpassSelect && (
          <FpassWrapper ref={step2SelectRef}>
            <FpassContentWrapper>
              <FpassTitleWrapper>
                <ButtonIconLarge
                  icon={<IconBack width={24} height={24} fill={COLOR.NEUTRAL[60]} />}
                  onClick={() => setShowFpassSelect(false)}
                />
                <FpassTitle>
                  {t('Continue with FuturePass')}
                  <ButtonIconSmall
                    data-tooltip-id={TOOLTIP_ID.CAMPAIGN_FUTUREPASS}
                    icon={<IconInfo width={16} height={16} fill={COLOR.PRIMARY[50]} />}
                  />
                </FpassTitle>
              </FpassTitleWrapper>
              <FpassDescription>{t('continue-fpass-description')}</FpassDescription>
            </FpassContentWrapper>
            <FpassButtonWrapper>
              <ButtonPrimaryLarge
                text={t('Skip')}
                buttonType="outlined"
                onClick={() => {
                  gaAction({
                    action: 'campaign-participate-step-2-select',
                    data: {
                      component: 'campaign-participate',
                      selected: 'skip',
                      evmWallet: 'evm',
                    },
                  });
                  setEvmWallet('evm');
                }}
              />
              <ButtonPrimaryLarge
                text={t('continue-campaign')}
                onClick={() => {
                  gaAction({
                    action: 'campaign-participate-step-2-select',
                    data: {
                      component: 'campaign-participate',
                      selected: 'continue',
                      evmWallet: 'fpass',
                    },
                  });
                  setEvmWallet('fpass');
                }}
              />
            </FpassButtonWrapper>
          </FpassWrapper>
        )}
        {!showFpassSelect && (
          <>
            <TitleWrapper>
              <NetworkImage src={imageNetworkROOT} />
              <Title>The Root Network</Title>
              {evm.isConnected && (
                <ButtonIconLarge
                  icon={<IconNext width={24} height={24} fill={COLOR.NEUTRAL[60]} />}
                  onClick={() => setShowFpassSelect(true)}
                />
              )}
            </TitleWrapper>

            <WalletWrapper>
              {evmConnectors?.map((c, i) => {
                const getIsConnected = () => {
                  if (!c.connected) return false;
                  if (c.name === 'Metamask' && c.connectorName.includes(evm.connectedConnector))
                    return true;
                  if (c.name === 'Wallet Connect') return evm.connectedConnector !== 'metaamsk';
                  return false;
                };

                const isConnected = getIsConnected();

                return (
                  <Wallet
                    key={c.name}
                    onClick={() => {
                      gaAction({
                        action: 'campaign-participate-step-2',
                        data: { component: 'campaign-participate', wallet: c.connectorName[0] },
                      });
                      handleConnect(i);
                    }}
                    isLoading={evmConnectorIdx === i && stepStatus2.status === 'loading'}
                  >
                    <WalletInnerWrapper>
                      <WalletImage src={c.image} alt={c.name} />
                      <Name>{c.name}</Name>
                    </WalletInnerWrapper>

                    {stepStatus2.status === 'loading' && evmConnectorIdx === i && (
                      <LoadingIcon src={imageStepLoading} width={24} height={24} />
                    )}

                    {isConnected && (
                      <ConnectedWrapper>
                        <ConnetedDot /> Connected
                      </ConnectedWrapper>
                    )}
                  </Wallet>
                );
              })}
            </WalletWrapper>
          </>
        )}
      </Wrapper>
      <TooltipFuturepass />
    </>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col gap-24 p-24 pt-20 bg-neutral-10 rounded-12
`;

const TitleWrapper = tw.div`
  w-full flex items-center gap-8 font-b-16 text-neutral-100
`;
const Title = tw.div`
  flex-1
`;

interface WalletProps {
  isLoading?: boolean;
  disabled?: boolean;
}
const Wallet = styled.div<WalletProps>(({ isLoading, disabled }) => [
  tw`
    flex items-center gap-12 px-16 py-15 rounded-8 bg-neutral-15 clickable justify-between
    hover:(bg-neutral-20)
  `,
  isLoading && tw`bg-neutral-20`,
  disabled &&
    tw`
      non-clickable opacity-40
      hover:(bg-neutral-15)
    `,
]);
const WalletWrapper = tw.div`
  flex flex-col gap-8
`;

const NetworkImage = tw(LazyLoadImage)`
  w-24 h-24
`;
const WalletImage = tw(LazyLoadImage)`
  w-36 h-36 rounded-8 flex-center object-cover overflow-hidden
`;
const WalletInnerWrapper = tw.div`
  flex gap-12 items-center  
`;
const Name = tw.div`
  font-m-16 text-neutral-100
`;

const LoadingIcon = styled(LazyLoadImage)(() => [tw`animate-spin`]);
const ConnectedWrapper = tw.div`
  flex gap-8 items-center font-r-12 text-neutral-100
`;
const ConnetedDot = tw.div`
  w-8 h-8 rounded-full bg-green-50
`;

const FpassWrapper = tw.div`
  flex flex-col gap-48
`;
const FpassContentWrapper = tw.div`
  flex flex-col gap-24
`;
const FpassTitleWrapper = tw.div`
  flex items-center
`;
const FpassTitle = tw.div`
  flex items-center gap-2 font-b-18 text-neutral-100
`;
const FpassDescription = tw.div`
  font-r-16 text-neutral-80
`;
const FpassButtonWrapper = tw.div`
  w-full flex gap-8
`;
