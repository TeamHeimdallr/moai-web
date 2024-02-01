import { useEffect } from 'react';

import { useXrplStore } from '~/states/contexts';

export const useXrpl = () => {
  const { client, isConnected, setConnection } = useXrplStore();

  return {
    client,
    isConnected,
    setConnection,
  };
};

export const useConnectXrpl = () => {
  const { client, setConnection } = useXrplStore();

  const connect = async () => {
    if (!client) return;
    if (client.isConnected()) return;

    await client.connect();

    setConnection(true);
  };

  const disconnect = async () => {
    if (!client) return;
    await client.disconnect();
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
