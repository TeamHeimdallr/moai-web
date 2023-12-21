import { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import tw, { styled } from 'twin.macro';

import { Popup } from '~/components/popup';

import { usePopup } from '~/hooks/components/use-popup';
import { useConnectors } from '~/hooks/wallets/use-connectors';
import { useWalletConnectorTypeStore } from '~/states/contexts/wallets/connector-type';
import { NETWORK } from '~/types';
import { POPUP_ID } from '~/types/components';

export const CampaignConnectWalletPopup = () => {
  const { close } = usePopup(POPUP_ID.CAMPAIGN_CONNECT_WALLET);
  const { network } = useWalletConnectorTypeStore();
  const { connectors } = useConnectors();

  const [selectedTab, selectTab] = useState<NETWORK>(network || NETWORK.XRPL);
  const targetConnectors = connectors.filter(w => w.network.includes(selectedTab));

  return (
    <Popup id={POPUP_ID.CAMPAIGN_CONNECT_WALLET} title="Connect wallet">
      <Wrapper>
        {
          <TabWrapper>
            <Tab selected={selectedTab === NETWORK.XRPL} onClick={() => selectTab(NETWORK.XRPL)}>
              XRPL
            </Tab>
            <Tab
              selected={selectedTab === NETWORK.THE_ROOT_NETWORK}
              onClick={() => selectTab(NETWORK.THE_ROOT_NETWORK)}
            >
              The Root Network
            </Tab>
          </TabWrapper>
        }
        {targetConnectors.map(w => (
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
  flex flex-col gap-8 px-24 py-0
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

const TabWrapper = tw.div`flex gap-24 pb-8`;

interface Props {
  selected?: boolean;
}
const Tab = styled.div<Props>(({ selected }) => [
  tw`font-b-16 clickable`,
  selected ? tw`text-primary-60` : tw`text-neutral-60`,
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
