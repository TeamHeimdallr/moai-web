import { Navigate, Route, Routes as ReactRoutes, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { IS_LANDING } from '~/constants';

import { ConnectWallet } from '~/components/connect-wallet';

import { usePopup } from '~/hooks/components/use-popup';
import { useConnectXrpl } from '~/hooks/contexts';
import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkFull } from '~/utils';
import { NETWORK, POPUP_ID } from '~/types';

import Home from './home';
import Landing from './landing';
import Pool from './pool';
import Swap from './swap';

const Page = () => {
  const { opened: connectWalletOpened } = usePopup(POPUP_ID.CONNECT_WALLET);

  useConnectXrpl();
  const { network } = useParams();
  const { selectedNetwork } = useNetwork();
  const currentNetwork = getNetworkFull(network) ?? selectedNetwork;

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

            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </ReactRoutes>

      <ToastContainer />
      {connectWalletOpened && (
        <ConnectWallet
          evm={currentNetwork !== NETWORK.XRPL}
          xrpl={currentNetwork === NETWORK.XRPL}
        />
      )}
    </>
  );
};

export default Page;
