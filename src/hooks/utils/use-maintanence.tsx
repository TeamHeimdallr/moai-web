import { useGetMaintanenceQuery } from '~/api/api-server/maintanence/get-maintanence';

import MaintenancePage from '~/pages/maintenance';

export const useMaintanence = () => {
  const { data } = useGetMaintanenceQuery({ staleTime: 1000 });
  const { data: maintanenceData } = data || {};
  const urls = maintanenceData?.map(m => m.url) || [];

  const getMaintanence = (path: string, page: JSX.Element) => {
    if (!maintanenceData) return;

    if (urls.includes(path)) return <MaintenancePage />;
    return page;
  };

  return { urls, getMaintanence };
};