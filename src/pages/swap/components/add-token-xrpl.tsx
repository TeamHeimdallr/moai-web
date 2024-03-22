import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import tw from 'twin.macro';

import { useCreateTokenXrplMutate } from '~/api/api-server/token/create-token-xrpl';
import { useGetTokenQuery } from '~/api/api-server/token/get-token';

import { COLOR } from '~/assets/colors';
import { IconBack } from '~/assets/icons';

import { AlertMessage } from '~/components/alerts';
import { ButtonIconLarge, ButtonPrimaryLarge } from '~/components/buttons';
import { InputTextField } from '~/components/inputs';
import { Popup } from '~/components/popup';

import { POPUP_ID } from '~/types';

interface Props {
  type: 'from' | 'to';
  showTokens?: () => void;
}

export const AddTokenXrpl = ({ type, showTokens }: Props) => {
  const queryClient = useQueryClient();

  const [issuer, setIssuer] = useState<string>('');
  const [currency, setCurrency] = useState<string>('');

  const [enableToFetch, setEnableToFetch] = useState(false);

  const { t } = useTranslation();

  const popupId = useMemo(
    () => (type === 'from' ? POPUP_ID.SWAP_SELECT_TOKEN_FROM : POPUP_ID.SWAP_SELECT_TOKEN_TO),
    [type]
  );
  const {
    data: tokenData,
    isFetching,
    isError: getTokenError,
  } = useGetTokenQuery(
    { queries: { networkAbbr: 'xrpl', address: issuer, currency } },
    { enabled: enableToFetch, refetchOnWindowFocus: false }
  );
  const { token } = tokenData || {};

  const tokenExist = !!token?.address;
  const { mutateAsync, error: createTokenError, isError, reset } = useCreateTokenXrplMutate();

  const error = isError || tokenExist || getTokenError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createTokenErrorMessage = (createTokenError?.response?.data as any)?.message;

  const errorMessage = tokenExist
    ? t('add-token-already-exist')
    : createTokenErrorMessage === 'invalid currency or issuer address'
    ? t('add-token-invalid-token')
    : t('Something went wrong');

  const errorDescription = tokenExist
    ? t('add-token-already-exist-description')
    : createTokenErrorMessage === 'invalid currency or issuer address'
    ? t('add-token-invalid-token-description')
    : t('add-token-unknown-error');

  const createToken = async () => {
    if (tokenExist || !enableToFetch) return;
    await mutateAsync({ issuer, currency });

    setIssuer('');
    setCurrency('');

    showTokens?.();
    queryClient.invalidateQueries(['GET', 'TOKENS', 'INFINITY']);
  };

  useEffect(() => {
    reset();
    const validIssuer = !!issuer && (issuer.length === 33 || issuer.length === 34);
    const validCurrency = !!currency && (currency.length === 3 || currency.length === 40);

    setEnableToFetch(validIssuer && validCurrency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, issuer]);

  return (
    <Popup
      id={popupId}
      title={t('Add token')}
      style={{ backgroundColor: COLOR.NEUTRAL[10] }}
      icon={<ButtonIconLarge icon={<IconBack />} onClick={() => showTokens?.()} />}
    >
      <Wrapper>
        <InputTextField
          id="input-currency"
          label={t('Currency code (case-sensitive)')}
          placeholder={t('enter-code-xrpl')}
          onChange={e => setCurrency(e.target.value)}
        />
        <InputTextField
          id="input-issuer"
          label={t('Issuer')}
          placeholder={t('enter-issuer-xrpl')}
          onChange={e => setIssuer(e.target.value)}
        />
        {error && <AlertMessage title={errorMessage} description={errorDescription} />}
        <ButtonPrimaryLarge
          text={isFetching ? t('Validating') : t('Add token')}
          isLoading={isFetching}
          disabled={!enableToFetch || error}
          onClick={createToken}
        />
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  pt-4 px-24 flex flex-col gap-24
`;
