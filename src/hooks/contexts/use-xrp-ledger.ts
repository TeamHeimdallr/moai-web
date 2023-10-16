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
    await client.connect();

    setConnection(true);
    console.log('[xrpl] wss client connected');
  };

  const disconnect = async () => {
    await client.disconnect();

    console.log('[xrpl] wss client disconnected');
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
