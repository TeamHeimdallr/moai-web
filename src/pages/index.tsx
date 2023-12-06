import { Navigate, Route, Routes as ReactRoutes, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { IS_LANDING } from '~/constants';

import { ConnectWallet } from '~/components/connect-wallet';

import { usePopup } from '~/hooks/components/use-popup';
import { useConnectXrpl } from '~/hooks/contexts';
import { useGARouteChangeTracker } from '~/hooks/contexts/use-google-analystics';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { getNetworkFull } from '~/utils';
import { useWalletTypeStore } from '~/states/contexts/wallets/wallet-type';
import { NETWORK, POPUP_ID } from '~/types';

import Campaign from './campaign';
import Home from './home';
import Landing from './landing';
import Pool from './pool';
import Rewards from './rewards';
import Swap from './swap';

const Page = () => {
  useConnectXrpl();
  useGARouteChangeTracker();

  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

  const { evm, xrpl } = useWalletTypeStore();
  const { xrp: xrpWallet, evm: evmWallet } = useConnectedWallet();

  const { opened: connectWalletOpened } = usePopup(POPUP_ID.CONNECT_WALLET);

  const bothDisconnected = !xrpWallet?.isConnected && !evmWallet?.isConnected;

  return (
    <>
      <ReactRoutes>
        {IS_LANDING && (
          <>
            <Route path="/" element={<Landing />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {!IS_LANDING && (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/pools/*" element={<Pool />} />
            <Route path="/rewards/*" element={<Rewards />} />
            <Route path="/campaign/*" element={<Campaign />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </ReactRoutes>

      <ToastContainer />
      {connectWalletOpened && (
        <ConnectWallet
          evm={(bothDisconnected && currentNetwork !== NETWORK.XRPL) || evm}
          xrpl={(bothDisconnected && currentNetwork === NETWORK.XRPL) || xrpl}
        />
      )}
    </>
  );
};

export default Page;
