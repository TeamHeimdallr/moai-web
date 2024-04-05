import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { strip } from 'number-precision';
import tw from 'twin.macro';
import * as yup from 'yup';

import { useAmmInfoByAccount } from '~/api/api-contract/_xrpl/amm/amm-info';
import { useUserLpTokenBalance } from '~/api/api-contract/_xrpl/balance/lp-token-balance';

import { COLOR } from '~/assets/colors';

import { AlertMessage } from '~/components/alerts';
import { ButtonPrimaryLarge } from '~/components/buttons';

import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { parseComma } from '~/utils';

import { InputPercentage } from '../../add-pool/components/input-percentage';

const name = 'INPUTS_PERCENTAGE2';
export const Voting = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();
  const { isXrp } = useNetwork();
  const { xrp } = useConnectedWallet();
  const { address } = xrp;

  const [weightError, setWeightError] = useState(false);

  const { data: ammData } = useAmmInfoByAccount({ account: id || '', enabled: isXrp && !!id });
  const { amm } = ammData || {};
  const { trading_fee: tradingFee, lp_token: lpToken, vote_slots: voteSlots } = amm || {};

  const { value: lpTokenValue } = lpToken || {};
  const sortedVoteSlots = voteSlots?.sort((a, b) => b.vote_weight - a.vote_weight);
  const lastVoteSlot = sortedVoteSlots?.[sortedVoteSlots.length - 1];

  const formattedTradingFee = strip((tradingFee || 0) / 1000);

  const { data: lastVoterLp } = useUserLpTokenBalance({
    lpToken: lpToken?.issuer || '',
    user: lastVoteSlot?.account || '',
  });
  const { data: currentUserLp } = useUserLpTokenBalance({
    lpToken: lpToken?.issuer || '',
    user: address || '',
  });
  const currentWeight =
    (lpTokenValue || 0) === 0 ? 0 : (currentUserLp / Number(lpTokenValue || 0)) * 100;
  const formattedCurrentWeight = currentWeight === 0 ? '0.0' : currentWeight.toFixed(3);

  const schema = yup.object().shape({
    [name]: yup.string().maximum('1', 'Exceeds 1%'),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });
  const { watch, formState } = methods;

  const value = watch(name);
  const errorMessage = formState.errors?.[name]?.message;

  const handleAddLiquidity = () => {
    navigate(`/pools/xrpl/${id}/deposit`);
  };

  const calculateWeight = () => {
    if (weightError || !sortedVoteSlots) return formattedTradingFee;
    const proposed = Number(parseComma(value || '0'));

    const newList = [
      ...sortedVoteSlots.slice(0, sortedVoteSlots.length - 1),
      { vote_weight: currentWeight * 1000, trading_fee: proposed * 1000 },
    ];

    const weightSum = newList.reduce((acc, cur) => acc + cur.vote_weight / 1000, 0);
    const weightRatioSum = newList.reduce(
      (acc, cur) => acc + (cur.vote_weight / 1000) * (cur.trading_fee / 1000),
      0
    );
    return strip(weightRatioSum / weightSum).toFixed(3);
  };

  useEffect(() => {
    if (currentUserLp < lastVoterLp) setWeightError(true);
    else setWeightError(false);
  }, [currentUserLp, lastVoterLp]);

  return (
    <FormProvider {...methods}>
      <Wrapper>
        <Title>{t('Trading fee voting')}</Title>
        {address && weightError && (
          <AlertMessage
            title={t('Insufficient weight')}
            description={
              <Warning>
                Your current vote weight is lower than lowest vote slot. Please{' '}
                <Link onClick={handleAddLiquidity}>add liquidity</Link> to get more weight.
              </Warning>
            }
          />
        )}
        <ContentWrapper>
          <Text>
            <Label>{t('Current trading fee:')}</Label>
            {tradingFee ? `${formattedTradingFee}%` : '-%'}
          </Text>

          <InputPercentage
            style={{ width: '100%' }}
            name={name}
            label={
              <LabelWrapper>
                {t('Your proposed fee')}
                <span style={{ fontSize: '14px', color: COLOR.NEUTRAL[60] }}>{t('Up to 1%')}</span>
              </LabelWrapper>
            }
            placeholder="0"
            error={!!errorMessage}
            errorMessage={errorMessage}
          />

          <Summary>
            <Value>
              {t('Your weight')}
              <span>{`${formattedCurrentWeight}%`}</span>
            </Value>
            <Value>
              {t('Expected fee after vote')}
              <span>{`${weightError ? formattedTradingFee : calculateWeight()}%`}</span>
            </Value>
          </Summary>
        </ContentWrapper>
        <ButtonPrimaryLarge text={t('Vote')} disabled={weightError} />
      </Wrapper>
    </FormProvider>
  );
};

const Wrapper = tw.div`
  w-full flex flex-col gap-24 pt-20 pb-24 px-24 rounded-12 bg-neutral-10
`;

const Title = tw.div`
  font-b-16 text-neutral-100
`;

const ContentWrapper = tw.div`
  flex flex-col gap-16
`;

const Text = tw.div`
  font-r-14 text-neutral-100 flex gap-8 items-center
`;

const Label = tw.div`
  font-r-14 text-neutral-60
`;

const LabelWrapper = tw.div`
  flex flex-col gap-2 font-r-16 text-neutral-100
`;

const Summary = tw.div`
  flex flex-col gap-12 px-20 py-16 rounded-8 bg-neutral-15
  text-neutral-100 font-r-14
`;

const Value = tw.div`
  flex items-center gap-8 justify-between
`;

const Warning = tw.div`
  font-r-14 leading-22
`;
const Link = tw.span`
  underline underline-offset-2 clickable
`;
