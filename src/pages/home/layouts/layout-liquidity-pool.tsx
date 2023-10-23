import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { ButtonChipFilter } from '~/components/buttons/chip/filter';
import { Table } from '~/components/tables';
import { Toggle } from '~/components/toggle';

import { useNetwork } from '~/hooks/contexts/use-network';
import { getNetworkAbbr } from '~/utils';
import { useTablePoolCompositionSelectTokenStore } from '~/states/components/table';
import { useShowAllPoolsStore } from '~/states/pages';
import { IToken, NETWORK } from '~/types';

import { useTableLiquidityPool } from '../hooks/components/table/use-table-liquidity-pool';

interface Meta {
  network: NETWORK;
  id: string;
}
export const LiquidityPoolLayout = () => {
  const navigate = useNavigate();
  const { name } = useNetwork();

  const { data, columns } = useTableLiquidityPool();

  const { showAllPools, setShowAllPools } = useShowAllPoolsStore();
  const { selectedTokens, setSelectedTokens } = useTablePoolCompositionSelectTokenStore();

  const [showToastPopup, setShowToastPopup] = useState<boolean>(false);

  const isMounted = useRef(false);

  const handleRowClick = (meta?: Meta) => {
    if (!meta) return;
    navigate(`/pools/${getNetworkAbbr(meta.network)}/${meta.id}`);
  };

  // TODO: pool 구성에 있는 토큰 리스트
  const tokens = [{ symbol: 'MOAI' }, { symbol: 'XRP' }, { symbol: 'ROOT' }, { symbol: 'WETH' }];

  const handleTokenClick = (token: string) => {
    if (selectedTokens.includes(token)) {
      setSelectedTokens(selectedTokens.filter(t => t !== token));
    } else {
      setSelectedTokens([...selectedTokens, token]);
    }
  };

  const sortTokensBySelection = (tokens: IToken[], selectedTokens: string[]) => {
    return tokens.sort((a, b) => {
      const isASelected = selectedTokens.includes(a.symbol);
      const isBSelected = selectedTokens.includes(b.symbol);

      if (isASelected && !isBSelected) return -1;
      if (!isASelected && isBSelected) return 1;
      return 0;
    });
  };

  const sortedTokens = sortTokensBySelection(tokens, selectedTokens);

  // useEffect for not showing toast popup when first mounted
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (!showAllPools) {
      setShowToastPopup(true);
      setTimeout(() => {
        setShowToastPopup(false);
      }, 3000);
    }
  }, [showAllPools]);

  return (
    <Wrapper>
      <TitleWrapper>
        {showToastPopup && (
          <ToastPopup>
            <ToastPopupText>Switched to {name}’s Liquidity pools</ToastPopupText>
          </ToastPopup>
        )}
        <Title>Liquidity pools</Title>
        <AllChainToggle>
          All supported chains
          <Toggle selected={showAllPools} onClick={() => setShowAllPools(!showAllPools)} />
        </AllChainToggle>
      </TitleWrapper>
      <TableWrapper>
        <BadgeWrapper>
          {sortedTokens.map(token => (
            <ButtonChipFilter
              key={token.symbol}
              token={token}
              selected={selectedTokens.includes(token.symbol)}
              onClick={() => handleTokenClick(token.symbol)}
            />
          ))}
        </BadgeWrapper>
        <Table data={data} columns={columns} handleRowClick={handleRowClick} />
      </TableWrapper>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24 relative
`;

const TitleWrapper = tw.div`
  h-40 flex gap-10 items-center w-full
`;

const Title = tw.div`
  font-b-24 text-neutral-100 flex-1
`;
const AllChainToggle = tw.div`flex gap-10 font-m-16 text-neutral-100`;
const TableWrapper = tw.div`flex flex-col gap-24`;
const BadgeWrapper = tw.div`flex gap-16`;
const ToastPopup = tw.div`absolute absolute-center-x top-24 bg-neutral-30 rounded-20 px-20 py-8 `;
const ToastPopupText = tw.div`font-m-16 text-neutral-100`;
