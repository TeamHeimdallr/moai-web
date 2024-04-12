import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';

import { MILLION } from '~/constants';

import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { usePopup } from '~/hooks/components';
import { useOnClickOutside } from '~/hooks/utils';
import { formatNumber } from '~/utils';
import { IToken, POPUP_ID } from '~/types';

import { useSelectToken } from '../hooks/use-select-token';

type OmittedToken = Partial<Omit<IToken, 'id' | 'network' | 'isLpToken' | 'isCexListed'>>;
interface Props {
  tokens: (OmittedToken & { balance?: number })[];
  currentToken?: OmittedToken & { balance?: number };
}
export const SelectFromTokenPopup = ({ tokens, currentToken }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const { selectToken } = useSelectToken();
  const { close } = usePopup(POPUP_ID.BRIDGE_SELECT_TOKEN);

  const { t } = useTranslation();

  const handleSelect = async (token: OmittedToken & { balance?: number }) => {
    selectToken(token as IToken);
    close();
  };

  useOnClickOutside(ref, () => close());

  return (
    <Popup id={POPUP_ID.BRIDGE_SELECT_TOKEN} title={t('Select token')}>
      <Wrapper ref={ref}>
        <ContentContainer>
          <TokenLists>
            {tokens?.map((token, i) => (
              <TokenList
                key={token?.symbol || i}
                title={token?.symbol || ''}
                image={token?.image || ''}
                type={'selectable'}
                balance={formatNumber(token?.balance || 0, 4, 'floor', MILLION, 0)}
                value={`$${formatNumber((token?.balance || 0) * (token.price || 0))}`}
                selected={currentToken?.symbol === token.symbol}
                onClick={() => handleSelect(token)}
                backgroundColor={COLOR.NEUTRAL[15]}
              />
            ))}
          </TokenLists>
        </ContentContainer>
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`px-8`;
const ContentContainer = styled.div(() => [
  tw`
    px-8 flex flex-col gap-24 overflow-auto max-h-376
    `,
  css`
    scroll-behavior: smooth;
    &::-webkit-scrollbar {
      width: 4px;
      height: auto;
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      visibility: hidden;
      background: #515a68;
      -webkit-border-radius: 2px;
    }
    &:hover::-webkit-scrollbar-thumb {
      visibility: visible;
    }
  `,
]);
const TokenLists = tw.div`flex flex-col gap-8`;
