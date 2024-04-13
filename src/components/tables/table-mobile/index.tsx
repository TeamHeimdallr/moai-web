import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconDown } from '~/assets/icons';

import { useConnectedWallet } from '~/hooks/wallets';

interface Data {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: any;
  rows: ReactNode[];
  dataRows: {
    label: ReactNode;
    value: ReactNode;
  }[];
  bottomRows?: ReactNode[];
}

interface Props {
  data: Data[];
  columns: ReactNode;

  hasMore?: boolean;
  isLoading?: boolean;
  type?: 'darker' | 'lighter';

  skeletonHeight?: number;
  emptyText?: string;
  overflow?: string;

  enableSelected?: boolean;

  handleMoreClick?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleClick?: (meta: any) => void;
}

export const TableMobile = ({
  data,
  columns,

  hasMore,
  type,
  emptyText,

  skeletonHeight,
  overflow,
  enableSelected,

  handleMoreClick,
  handleClick,
}: Props) => {
  const { currentAddress } = useConnectedWallet();
  const { t } = useTranslation();

  const isEmpty = !data || data.length === 0;

  return (
    <Wrapper type={type} overflow={overflow}>
      <Header>{columns}</Header>
      <Divider type={type} />
      {skeletonHeight ? (
        <Skeleton
          height={skeletonHeight}
          highlightColor="#2B2E44"
          baseColor="#23263A"
          duration={0.9}
          style={{ borderRadius: '0 0 12px 12px' }}
        />
      ) : isEmpty ? (
        <EmptyWrapper>{emptyText || 'No result'}</EmptyWrapper>
      ) : (
        data.map(({ meta, rows, dataRows, bottomRows }, i) => {
          const account = meta?.account;
          // TODO: refactor, this is only for xrpl
          const selected =
            enableSelected && !!currentAddress && !!account && account === currentAddress;

          return (
            <ContentWrapper
              key={i}
              onClick={() => handleClick?.(meta)}
              className={meta?.className}
              selected={selected}
            >
              {rows.map((row, i) => (
                <Row key={i}>{row}</Row>
              ))}
              <DataRowWrapper>
                {dataRows.map(({ label, value }, i) => (
                  <DataRow key={i}>
                    <DataLabel>{typeof label === 'string' ? t(label) : label}</DataLabel>
                    <DataValue>{value}</DataValue>
                  </DataRow>
                ))}
              </DataRowWrapper>
              {bottomRows && bottomRows.map((row, i) => <Row key={i}>{row}</Row>)}
            </ContentWrapper>
          );
        })
      )}
      {!isEmpty && hasMore && (
        <More onClick={handleMoreClick}>
          {t('Load more')}
          <IconDown width={20} height={20} />
        </More>
      )}
    </Wrapper>
  );
};

interface WrapperProps {
  type?: 'darker' | 'lighter';
  overflow?: string;
}
const Wrapper = styled.div<WrapperProps>(({ type, overflow }) => [
  tw`
    w-full flex flex-col bg-neutral-10 rounded-12 overflow-hidden
  `,
  type === 'lighter' && tw`bg-neutral-15`,
  overflow &&
    css`
      overflow: ${overflow};
    `,
]);
const Header = tw.div`
  py-16 px-20 flex justify-end items-center
`;

interface DividerProps {
  type?: 'darker' | 'lighter';
}
const Divider = styled.div<DividerProps>(({ type }) => [
  tw`w-full h-1 flex-shrink-0 bg-neutral-15`,
  type === 'lighter' && tw`bg-neutral-20`,
]);

const EmptyWrapper = tw.div`
  w-full h-218 p-20 flex-center font-r-16 text-neutral-60
`;

interface ContentWrapperProps {
  height?: number;
  selected?: boolean;
}

const ContentWrapper = styled.div<ContentWrapperProps>(({ height, selected }) => [
  tw`
    flex flex-col gap-16 px-20 py-20
  `,
  height &&
    css`
      height: ${height}px;
    `,
  selected && tw`py-19 px-19 border-1 border-solid border-primary-50 rounded-12`,
  // TODO: remove hardcode
  selected &&
    css`
      & .voter {
        color: ${COLOR.PRIMARY[50]};
      }
    `,
]);

const Row = tw.div`
  flex items-center justify-between
`;

const DataRowWrapper = tw.div`
  flex flex-col gap-8
`;

const DataRow = tw.div`
  flex items-center justify-between gap-4 font-m-14 text-neutral-100
`;

const DataLabel = tw.div`
  text-neutral-80 flex-shrink-0
`;

const DataValue = tw.div`
  flex justify-end flex-1
`;

const More = styled.div(() => [
  tw`
    w-full h-60 flex-center gap-6 font-m-14 text-neutral-60 clickable
    px-20 py-16
    hover:(bg-neutral-15 text-primary-80)
  `,
  css`
    & svg {
      fill: ${COLOR.NEUTRAL[60]};
      width: 20px;
      height: 20px;
    }

    &:hover {
      svg {
        fill: ${COLOR.PRIMARY[80]};
      }
    }
  `,
]);
