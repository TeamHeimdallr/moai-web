import { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import tw from 'twin.macro';
import { AnalyticsProvider } from 'use-analytics';

import { analytics } from './configs/analystics';
import ReactQueryProvider from './hocs/hoc-react-query-provider';
import Web3Provider from './hocs/hoc-web3-provider';
import i18n from './locales/i18n';
import Pages from './pages';

const RouteWrapper = tw.main`relative w-full h-full`;
const App = () => {
  return (
    // Global Suspense
    <Suspense>
      {/* Web3 context provider */}
      <Web3Provider>
        {/* react query provider */}
        <ReactQueryProvider>
          {/* router provider */}
          <BrowserRouter>
            <RouteWrapper>
              {/* i18n provider */}
              <I18nextProvider i18n={i18n}>
                {/* analystics(google tag manager) provider */}
                <AnalyticsProvider instance={analytics}>
                  <Pages />
                </AnalyticsProvider>
              </I18nextProvider>
            </RouteWrapper>
          </BrowserRouter>
        </ReactQueryProvider>
      </Web3Provider>
    </Suspense>
  );
};

export default App;
