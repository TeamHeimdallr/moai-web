import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';

import { useAmmInfo } from '~/api/api-contract/_xrpl/amm/amm-info';
import { useCreatePoolXrplMutate } from '~/api/api-server/pools/create-pool';
import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';
import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { IconDown } from '~/assets/icons';

import { ASSET_URL } from '~/constants';

import { AlertMessage } from '~/components/alerts';
import { ButtonIconSmall, ButtonPrimaryLarge } from '~/components/buttons';

import { usePopup } from '~/hooks/components';
import { tokenListToAmmAsset } from '~/utils';
import { POPUP_ID } from '~/types';

import { TokenPopup1Xrpl, TokenPopup2Xrpl } from '../components/token-popup-xrpl';
import { useStep } from '../hooks/use-step';
import { useXrplPoolAddTokenPairStore } from '../states/token-pair';

export const SelectPair = () => {
  const navigate = useNavigate();

  const { setStepStatus, goNext } = useStep();

  const { t } = useTranslation();
  const { open: openToken1, opened: openedToken1 } = usePopup(POPUP_ID.XRPL_ADD_POOL_SELECT_TOKEN1);
  const { open: openToken2, opened: openedToken2 } = usePopup(POPUP_ID.XRPL_ADD_POOL_SELECT_TOKEN2);

  const { token1, token2, token1Detail, token2Detail, setToken1Detail, setToken2Detail, reset } =
    useXrplPoolAddTokenPairStore();

  const { data: ammData, isFetching: isFetchingAmmData } = useAmmInfo({
    asset: tokenListToAmmAsset(token1),
    asset2: tokenListToAmmAsset(token2),
    enabled: !!token1 && !!token2,
  });
  const { amm } = ammData || {};
  const { data: ammDataDB, isFetching: isFetchingAmmDataDB } = useGetPoolQuery(
    { params: { networkAbbr: 'xrpl', poolId: amm?.account || '' } },
    { enabled: !!amm }
  );

  const poolExist = !!token1 && !!token2 && !!ammData;
  const poolExistInDB = poolExist && !!ammDataDB?.pool?.poolId;

  const { data: token1DetailData } = useGetTokenQuery(
    { queries: { networkAbbr: 'xrpl', address: token1?.address, currency: token1?.currency } },
    { enabled: !!token1, refetchOnWindowFocus: false }
  );
  const { data: token2DetailData } = useGetTokenQuery(
    { queries: { networkAbbr: 'xrpl', address: token2?.address, currency: token2?.currency } },
    { enabled: !!token2, refetchOnWindowFocus: false }
  );
  const { token: _token1Detail } = token1DetailData || {};
  const { token: _token2Detail } = token2DetailData || {};

  const { mutateAsync } = useCreatePoolXrplMutate();

  useEffect(() => {
    setToken1Detail(_token1Detail);
    setToken2Detail(_token2Detail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_token1Detail, _token2Detail]);

  useEffect(() => {
    if (isFetchingAmmData || isFetchingAmmDataDB) return;

    if (!poolExist && !poolExistInDB && token1Detail && token2Detail) {
      setStepStatus({ id: 1, status: 'done' }, 0);
    } else {
      setStepStatus({ id: 1, status: 'idle' }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    poolExist,
    poolExistInDB,
    token1Detail,
    token2Detail,
    isFetchingAmmData,
    isFetchingAmmDataDB,
  ]);

  const handleCreatePoolAndRedirect = async () => {
    if (poolExistInDB) {
      reset();
      navigate(`/pools/xrpl/${ammDataDB?.pool?.poolId || ''}`);
      return;
    }

    if (!token1Detail || !token2Detail) return;
    const data = await mutateAsync({
      token1: token1Detail,
      token2: token2Detail,
    });

    if (data && data.account) {
      // redirect to pool page
      navigate(`/pools/xrpl/${data.account}`);
      reset();
    }
  };

  return (
    <Wrapper>
      <TokenWrapper>
        <SelectToken onClick={() => openToken1()}>
          {token1 ? (
            <SelectedToken>
              <Icon src={token1.image || `${ASSET_URL}/tokens/token-unknown.png`} />
              {token1.symbol}
            </SelectedToken>
          ) : (
            'Select Token'
          )}
          <ButtonIconSmall icon={<IconDown />} />
        </SelectToken>
        <SelectToken onClick={() => openToken2()}>
          {token2 ? (
            <SelectedToken>
              <Icon src={token2.image || `${ASSET_URL}/tokens/token-unknown.png`} />
              {token2.symbol}
            </SelectedToken>
          ) : (
            'Select Token'
          )}
          <ButtonIconSmall icon={<IconDown />} />
        </SelectToken>
      </TokenWrapper>
      {poolExist && (
        <AlertMessage
          title={t('Same pool exist')}
          description={
            <DescriptionLink onClick={handleCreatePoolAndRedirect}>
              {t('Go to the pool')}
            </DescriptionLink>
          }
        />
      )}
      <ButtonPrimaryLarge
        text={t('Next')}
        disabled={isFetchingAmmData || isFetchingAmmDataDB || poolExist}
        onClick={goNext}
      />

      {openedToken1 && <TokenPopup1Xrpl />}
      {openedToken2 && <TokenPopup2Xrpl />}
    </Wrapper>
  );
};

const Wrapper = tw.div`
  w-full p-24 rounded-12 bg-neutral-10
  flex flex-col gap-24
`;

const TokenWrapper = tw.div`
  flex gap-8
`;
const SelectToken = tw.div`
  flex-1 py-16 pl-10 pr-8 flex-center gap-4 bg-neutral-20 rounded-10 font-r-16 text-neutral-100 clickable
`;

const SelectedToken = tw.div`
  flex-center gap-8
`;
const Icon = tw.img`
  w-24 h-24 rounded-full object-cover
`;

const DescriptionLink = tw.div`
  clickable text-orange-50 font-r-14 leading-22 underline underline-offset-1
`;
