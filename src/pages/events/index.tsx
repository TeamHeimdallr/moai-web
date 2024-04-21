import { Navigate, Route, Routes } from 'react-router-dom';

import { useMaintanence } from '~/hooks/utils/use-maintanence';

import { XepePage } from './pages/xepe';

const EventPage = () => {
  const { getMaintanence } = useMaintanence();

  return (
    <Routes>
      <Route path="/xepe" element={getMaintanence('/xepe', <XepePage />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default EventPage;
