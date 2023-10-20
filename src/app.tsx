import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import tw from 'twin.macro';

import ReactQueryProvider from './hocs/hoc-react-query-provider';
import Web3Provider from './hocs/hoc-web3-provider';
import Pages from './pages';

const RouteWrapper = tw.main`relative w-full h-full min-w-1440`;
const App = () => {
  return (
    <Suspense>
      <Web3Provider>
        <ReactQueryProvider>
          <BrowserRouter>
            <RouteWrapper>
              <Pages />
            </RouteWrapper>
          </BrowserRouter>
        </ReactQueryProvider>
      </Web3Provider>
    </Suspense>
  );
};

export default App;
