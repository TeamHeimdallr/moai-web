import { lazy } from 'react';
import { Route, Routes as ReactRoutes } from 'react-router-dom';

const TestPage = lazy(() => import('./pages/xrpl-test'));

const MoaiEVM = () => {
  return (
    <ReactRoutes>
      <Route path="/" element={<TestPage />} />
    </ReactRoutes>
  );
};

export default MoaiEVM;
