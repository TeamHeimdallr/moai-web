import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css, styled } from 'twin.macro';

import { COLOR } from '~/assets/colors';
import { IconDown } from '~/assets/icons';

interface Data {
  rows: ReactNode[];
  dataRows: {
    label: ReactNode;
    value: ReactNode;
  }[];
}

interface Props {
  data: Data[];
  columns: ReactNode;

  hasMore?: boolean;
  isLoading?: boolean;
  type?: 'darker' | 'lighter';

  handleMoreClick?: () => void;
  handleClick?: () => void;
}

export const TableMobile = ({
  data,
  columns,

  hasMore,
  type,

  handleMoreClick,
  handleClick,
}: Props) => {
  const { t } = useTranslation();

  const isEmpty = !data || data.length === 0;

  return (
    <Wrapper type={type}>
      <Header>{columns}</Header>
      <Divider type={type} />
      {isEmpty && <EmptyWrapper>No liquidity pools</EmptyWrapper>}
      {!isEmpty &&
        data.map(({ rows, dataRows }, i) => (
          <ContentWrapper key={i} onClick={handleClick}>
            {rows.map((row, i) => (
              <Row key={i}>{row}</Row>
            ))}
            <DataRowWrapper>
              {dataRows.map(({ label, value }, i) => (
                <DataRow key={i}>
                  <DataLabel>{label}</DataLabel>
                  {value}
                </DataRow>
              ))}
            </DataRowWrapper>
            {hasMore && (
              <More onClick={handleMoreClick}>
                {t('Load more')}
                <IconDown width={20} height={20} />
              </More>
            )}
          </ContentWrapper>
        ))}
    </Wrapper>
  );
};

interface WrapperProps {
  type?: 'darker' | 'lighter';
}
const Wrapper = styled.div<WrapperProps>(({ type }) => [
  tw`
    w-full flex flex-col bg-neutral-10 rounded-12 overflow-hidden
  `,
  type === 'lighter' && tw`bg-neutral-15`,
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

const ContentWrapper = tw.div`
  flex flex-col gap-16 px-20 py-20
`;

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
