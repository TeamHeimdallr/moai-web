import { useState } from 'react';
import tw from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { ButtonChipSmall } from '~/components/buttons/chip';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';
import { TOKEN_IMAGE_MAPPER, TOKEN_USD_MAPPER } from '~/constants';
import { usePopup } from '~/hooks/pages/use-popup';
import { useSlippageStore } from '~/states/components/slippage';
import { POPUP_ID } from '~/types/components';
import { formatNumber } from '~/utils/number';

import { useSwap } from '../hooks/use-swap';
import { SwapArrowDown } from './arrow-down';

export const PopupSwap = () => {
  const { fromToken, fromValue, toToken, toValue, swapRatio } = useSwap();
  const { close } = usePopup(POPUP_ID.SWAP);
  const { slippageId } = useSlippageStore();

  const [selectedDetailInfo, selectDetailInfo] = useState<'TOKEN' | 'USD'>('TOKEN');

  const effectivePrice = `1 ${fromToken} = ${formatNumber(swapRatio, 6)} ${toToken}`;
  const fromUSDValue = (fromValue ?? 0) * TOKEN_USD_MAPPER[fromToken];
  const toUSDValue = (fromValue ?? 0) * TOKEN_USD_MAPPER[fromToken];

  const currentValue = selectedDetailInfo === 'TOKEN' ? fromValue : fromUSDValue;
  const currentUnit = selectedDetailInfo === 'TOKEN' ? fromToken : 'USD';

  const totalAfterFee = (1 - 0.005) * (currentValue ?? 0);
  const slippage = slippageId === 0 ? 0.005 : slippageId === 1 ? 0.1 : 0.2;
  const slippageText = (slippage * 100).toFixed(1);
  const totalAfterSlippage = (1 - slippage / 100) * totalAfterFee;

  return (
    <Popup id={POPUP_ID.SWAP} title="Preview swap" style={{ backgroundColor: COLOR.NEUTRAL[10] }}>
      <Wrapper>
        <ListWrapper>
          <List title={`Effective price: ${effectivePrice}`}>
            <TokenList
              title={fromToken}
              image={TOKEN_IMAGE_MAPPER[fromToken]}
              type="large"
              balance={formatNumber(fromValue, 2)}
              value={formatNumber(fromUSDValue, 2)}
            />
            <IconWrapper>
              <SwapArrowDown />
            </IconWrapper>
            <TokenList
              title={toToken}
              image={TOKEN_IMAGE_MAPPER[toToken]}
              type="large"
              balance={formatNumber(toValue, 2)}
              value={`${formatNumber(toUSDValue, 2)} / Price impact : 0.012%`}
            />
          </List>
        </ListWrapper>

        <DetailWrapper>
          <DetailTitleWrapper>
            {`Swap from ${fromToken} details`}
            <DetailButtonWrapper>
              <ButtonChipSmall
                text="TOKEN"
                selected={selectedDetailInfo === 'TOKEN'}
                onClick={() => selectDetailInfo('TOKEN')}
              />
              <ButtonChipSmall
                text="USD"
                selected={selectedDetailInfo === 'USD'}
                onClick={() => selectDetailInfo('USD')}
              />
            </DetailButtonWrapper>
          </DetailTitleWrapper>
          <DetailInfoWrapper>
            <DetailInfoTextWrapper>
              <DetailInfoText>Total expected after fees</DetailInfoText>
              <DetailInfoText>{`${formatNumber(totalAfterFee, 2)} ${currentUnit}`}</DetailInfoText>
            </DetailInfoTextWrapper>
            <DetailInfoTextWrapper>
              <DetailInfoText>{`The least you'll get at ${slippageText}% slippage`}</DetailInfoText>
              <DetailInfoText>{`${formatNumber(
                totalAfterSlippage,
                2
              )} ${currentUnit}`}</DetailInfoText>
            </DetailInfoTextWrapper>
          </DetailInfoWrapper>
        </DetailWrapper>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  px-24 flex flex-col gap-24
`;

const ListWrapper = tw.div`
  relative
`;

const IconWrapper = tw.div`
  absolute right-12 bottom-56 z-1
`;

const DetailWrapper = tw.div`
  flex flex-col gap-16
`;

const DetailTitleWrapper = tw.div`
  px-12 flex items-center justify-between gap-12 font-m-16 text-neutral-100
`;

const DetailButtonWrapper = tw.div`
  flex gap-4
`;

const DetailInfoWrapper = tw.div`
  px-16 py-12 bg-neutral-15 rounded-8 flex flex-col gap-2
`;

const DetailInfoTextWrapper = tw.div`
  flex gap-10
`;

const DetailInfoText = tw.div`
  font-r-14 text-neutral-100 
`;

const DetailInfoSubtext = tw.div`
  font-r-12 text-neutral-60
`;
