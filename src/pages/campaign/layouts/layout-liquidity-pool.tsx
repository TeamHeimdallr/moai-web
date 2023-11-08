import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkAbbr } from '~/utils';
import { useShowAllPoolsStore } from '~/states/pages';
import { IToken, NETWORK, POPUP_ID } from '~/types';

import { Pending } from '../components/pending';

interface Meta {
  network: NETWORK;
  id: string;
}
export const LiquidityPoolLayout = () => {
  const navigate = useNavigate();

  const { showAllPools, setShowAllPools } = useShowAllPoolsStore();

  const { open: popupOpen } = usePopup(POPUP_ID.NETWORK_ALERT);
  const { selectedNetwork, setTargetNetwork } = useNetwork();

  const isMounted = useRef(false);

  const handleRowClick = (meta?: Meta) => {
    if (!meta) return;
    if (selectedNetwork !== meta.network) {
      popupOpen();
      setTargetNetwork(meta.network as NETWORK);
      return;
    }
    navigate(`/pools/${getNetworkAbbr(meta.network)}/${meta.id}`);
  };

  // useEffect for not showing toast popup when first mounted
  useEffect(() => {
    if (!isMounted.current) {
      setShowAllPools(false);
      isMounted.current = true;
      return;
    }

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllPools]);

  return (
    <Wrapper>
      <MyInfoWrapper>
        <Title>My Voyage</Title>
        <CardWrapper>
          <MyInfoCard>
            <SubTitle>Balance</SubTitle>
            <Token></Token>
          </MyInfoCard>
          <MyInfoCard>
            <SubTitle>Rewards</SubTitle>
            <TokenWrapper>
              <Token></Token>
              <Token></Token>
            </TokenWrapper>
          </MyInfoCard>
        </CardWrapper>
      </MyInfoWrapper>
      <Pending />
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col pt-60 gap-24 text-neutral-100
`;

const MyInfoWrapper = tw.div`
  flex flex-col gap-24 justify-center w-full
`;
const CardWrapper = tw.div`flex gap-40`;
const MyInfoCard = tw.div`flex flex-col gap-24 p-24 pt-20 bg-neutral-10 rounded-12`;
const SubTitle = tw.div`font-b-20`;
const TokenWrapper = tw.div`flex gap-16`;
const Token = tw.div`min-w-362 p-24 bg-neutral-15 rounded-12`;

const Title = tw.div`
  font-b-24 text-neutral-100
`;
