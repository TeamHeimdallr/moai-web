import { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import tw from 'twin.macro';

import ReactQueryProvider from './hocs/hoc-react-query-provider';
import Web3Provider from './hocs/hoc-web3-provider';
import i18n from './locales/i18n';
import Pages from './pages';

const RouteWrapper = tw.main`relative w-full h-full min-w-1440`;
const App = () => {
  return (
    <Suspense>
      <Web3Provider>
        <ReactQueryProvider>
          <BrowserRouter>
            <RouteWrapper>
              <I18nextProvider i18n={i18n}>
                <Pages />
              </I18nextProvider>
            </RouteWrapper>
          </BrowserRouter>
        </ReactQueryProvider>
      </Web3Provider>
    </Suspense>
  );
};

export default App;
