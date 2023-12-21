import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useParams } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import { Popup } from '~/components/popup';

import { usePopup } from '~/hooks/components/use-popup';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectors } from '~/hooks/wallets/use-connectors';
import { getNetworkFull } from '~/utils';
import { useWalletConnectorTypeStore } from '~/states/contexts/wallets/connector-type';
import { POPUP_ID } from '~/types/components';

export const ConnectWallet = () => {
  const { close } = usePopup(POPUP_ID.CONNECT_WALLET);

  const { connectors } = useConnectors();
  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const { network: targetNetwork } = useWalletConnectorTypeStore();

  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { t } = useTranslation();

  const currentConnectors = connectors.filter(c =>
    c.network.includes(targetNetwork || currentNetwork)
  );

  return (
    <Popup id={POPUP_ID.CONNECT_WALLET} title={t('Connect wallet')}>
      <Wrapper>
        {currentConnectors.map(w => (
          <Wallet
            key={w.name}
            onClick={() => {
              if (!w.isInstalled) return;

              w.connect();
              close();
            }}
            disabled={!w.isInstalled}
          >
            <WalletImage src={w.image} alt={w.name} />
            <NameWrapper>
              <Name>{w.name}</Name>
            </NameWrapper>
          </Wallet>
        ))}
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-12 px-24 py-0
`;

interface WalletProps {
  disabled?: boolean;
}
const Wallet = styled.div<WalletProps>(({ disabled }) => [
  tw`
    flex gap-12 px-16 py-15 rounded-8 bg-neutral-15 hover:bg-neutral-20 clickable
  `,
  disabled &&
    tw`
      non-clickable opacity-40
      hover:(bg-neutral-15)
    `,
]);

const WalletImage = tw(LazyLoadImage)`
  w-36 h-36 rounded-8 flex-center object-cover overflow-hidden
`;
const NameWrapper = tw.div`
  flex-center flex-col
`;
const Name = tw.div`
  font-m-16 text-neutral-100
`;
