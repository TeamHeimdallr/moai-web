import { lazy } from 'react';
import { Navigate, Route, Routes as ReactRoutes } from 'react-router-dom';

const Home = lazy(() => import('./home'));
const Pool = lazy(() => import('./pool'));
const Swap = lazy(() => import('./swap'));

const Page = () => {
  return (
    <ReactRoutes>
      <Route path="/" element={<Home />} />
      <Route path="/swap" element={<Swap />} />
      <Route path="/pools/*" element={<Pool />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </ReactRoutes>
  );
};

export default Page;
