import { useXrplStore } from '~/states/contexts';

export const useXrpl = () => {
  const { client, isConnected, setConnection } = useXrplStore();

  return {
    client,
    isConnected,
    setConnection,
  };
};
