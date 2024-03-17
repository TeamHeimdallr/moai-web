import { useSelecteNetworkStore } from '../states';

export const useSelectNetwork = () => {
  const { from, to, selectFrom, selectTo } = useSelecteNetworkStore();

  const getSelectable = (network: string) => {
    if (network === 'ETHEREUM') return ['THE_ROOT_NETWORK'];
    if (network === 'THE_ROOT_NETWORK') return ['ETHEREUM', 'XRPL'];
    if (network === 'XRPL') return ['THE_ROOT_NETWORK'];
    return [];
  };

  const selectNetwork = (type: 'from' | 'to', network: string) => {
    if (type === 'from') {
      const selectableTo = getSelectable(network);

      selectFrom(network);
      if (!selectableTo.includes(to)) selectTo(selectableTo[0]);
    }
    if (type === 'to') {
      const selectableFrom = getSelectable(network);

      selectTo(network);
      if (!selectableFrom.includes(from)) selectFrom(selectableFrom[0]);
    }
  };

  const switchNetwork = () => {
    const selectableFrom = getSelectable(to);
    const selectableTo = getSelectable(from);

    if (selectableFrom.includes(from) && selectableTo.includes(to)) {
      selectFrom(to);
      selectTo(from);
    }

    if (selectableFrom.includes(from) && !selectableTo.includes(to)) {
      selectFrom(to);
      selectTo(selectableTo[0]);
    }
    if (!selectableFrom.includes(from) && selectableTo.includes(to)) {
      selectFrom(selectableFrom[0]);
      selectTo(from);
    }
  };

  return { from, to, selectNetwork, switchNetwork };
};
