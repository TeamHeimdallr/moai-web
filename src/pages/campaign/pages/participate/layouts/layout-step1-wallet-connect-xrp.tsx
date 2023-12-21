import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { styled } from 'twin.macro';

import { imageNetworkXRPL, imageStepLoading } from '~/assets/images';

import { useConnectedWallet } from '~/hooks/wallets';
import { useConnectors } from '~/hooks/wallets/use-connectors';
import { NETWORK } from '~/types';

import { useStep } from '../hooks/use-step';

export const LayoutStep1WalletconnectXrp = () => {
  const { stepStatus1, xrpConnectorIdx, setStepStatus, setXrpConnectorIdx } = useStep();

  const { xrp } = useConnectedWallet();
  const { connectors } = useConnectors();

  const xrpConnectors = connectors.filter(c => c.network.includes(NETWORK.XRPL));

  const handleConnect = (connectorIndex: number) => {
    if (!xrpConnectors?.[connectorIndex]?.isInstalled) return;

    setStepStatus({ id: 1, status: 'loading' }, 0);
    setXrpConnectorIdx(connectorIndex);

    xrpConnectors?.[connectorIndex]?.connect();
  };

  return (
    <Wrapper>
      <TitleWrapper>
        <NetworkImage src={imageNetworkXRPL} />
        XRPL
      </TitleWrapper>

      <WalletWrapper>
        {xrpConnectors?.map((c, i) => (
          <Wallet
            key={c.name}
            onClick={() => handleConnect(i)}
            isLoading={xrpConnectorIdx === i && stepStatus1.status === 'loading'}
            disabled={!c.isInstalled}
          >
            <WalletInnerWrapper>
              <WalletImage src={c.image} alt={c.name} />
              <Name>{c.name}</Name>
            </WalletInnerWrapper>

            {stepStatus1.status === 'loading' && xrpConnectorIdx === i && (
              <LoadingIcon src={imageStepLoading} width={24} height={24} />
            )}

            {c.connected && c.connectorName.includes(xrp.connectedConnector) && (
              <ConnectedWrapper>
                <ConnetedDot /> Connected
              </ConnectedWrapper>
            )}
          </Wallet>
        ))}
      </WalletWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col gap-24 p-24 pt-20 bg-neutral-10 rounded-12
`;

const TitleWrapper = tw.div`
  w-full flex items-center gap-8 font-b-16 text-neutral-100
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
