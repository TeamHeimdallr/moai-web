import { Route, Routes } from 'react-router-dom';

import LandingPage from './landing';

const Campaign = () => {
  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
    </Routes>
  );
};

export default Campaign;
