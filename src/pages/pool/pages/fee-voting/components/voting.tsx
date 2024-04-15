import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { strip } from 'number-precision';
import tw from 'twin.macro';
import * as yup from 'yup';

import { useAmmInfoByAccount } from '~/api/api-contract/_xrpl/amm/amm-info';
import { useAmmVote } from '~/api/api-contract/_xrpl/amm/amm-vote';
import {
  useUserLpTokenBalance,
  useUsersLpTokenBalance,
} from '~/api/api-contract/_xrpl/balance/lp-token-balance';
import { useGetPoolQuery } from '~/api/api-server/pools/get-pool';

import { COLOR } from '~/assets/colors';

import { SCANNER_URL } from '~/constants';

import { AlertMessage } from '~/components/alerts';
import { ButtonPrimaryLarge } from '~/components/buttons';

import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useConnectedWallet } from '~/hooks/wallets';
import { parseComma, tokenToAmmAsset } from '~/utils';
import { NETWORK, POPUP_ID } from '~/types';

import { InputPercentage } from '../../add-pool/components/input-percentage';

import { VotingPopup } from './voting-popup';

const name = 'INPUTS_PERCENTAGE2';
export const Voting = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();
  const { isXrp } = useNetwork();
  const { xrp } = useConnectedWallet();
  const { address } = xrp;

  const [weightError, setWeightError] = useState(false);

  const { opened, open, close } = usePopup(POPUP_ID.XRPL_FEE_VOTING);

  const { data: poolData } = useGetPoolQuery(
    { params: { networkAbbr: 'xrpl', poolId: id || '' } },
    { enabled: isXrp && !!id, staleTime: Infinity }
  );
  const { pool } = poolData || {};
  const { compositions } = pool || {};

  const { data: ammData } = useAmmInfoByAccount({ account: id || '', enabled: isXrp && !!id });
  const { amm } = ammData || {};
  const { trading_fee: tradingFee, lp_token: lpToken, vote_slots: voteSlots } = amm || {};

  const { value: lpTokenValue } = lpToken || {};

  const { data: voterLp } = useUsersLpTokenBalance({
    lpToken: lpToken?.issuer || '',
    users: voteSlots?.map(slot => slot.account) || [],
  });
  const voterLpWeight = voterLp?.map(voter => {
    const voteSlot = voteSlots?.find(slot => slot.account === voter.account);

    return {
      ...voter,
      tradingFee: Number(voteSlot?.trading_fee || 0) / 1000,
      weight: voter.balance ? (voter.balance / Number(lpTokenValue || 0)) * 100 : 0,
    };
  });

  const sortedVoteSlots = voterLpWeight?.sort((a, b) => b.weight - a.weight);
  const lastVoteSlot = sortedVoteSlots?.[sortedVoteSlots.length - 1];

  const formattedTradingFee = strip((tradingFee || 0) / 1000);

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
  const proposed = Number(parseComma(value || '0'));
  const errorMessage = formState.errors?.[name]?.message;

  const handleAddLiquidity = () => {
    navigate(`/pools/xrpl/${id}/deposit`);
  };

  const calculateTradingFee = () => {
    if (weightError || !sortedVoteSlots) return formattedTradingFee;
    const proposed = Number(parseComma(value || '0'));

    const newList = [
      ...sortedVoteSlots.slice(0, sortedVoteSlots.length - 1),
      { account: address, balance: currentUserLp, weight: currentWeight, tradingFee: proposed },
    ];

    const weightSum = newList.reduce((acc, cur) => acc + (cur?.weight || 0), 0);
    const weightRatioSum = newList.reduce(
      (acc, cur) => acc + (cur?.weight || 0) * (cur?.tradingFee || 0),
      0
    );
    return weightSum ? Number(strip(weightRatioSum / weightSum).toFixed(3)) : 0;
  };

  const { writeAsync, txData, blockTimestamp, isIdle, isLoading, isSuccess, isError } = useAmmVote({
    asset: tokenToAmmAsset(compositions?.[0]),
    asset2: tokenToAmmAsset(compositions?.[1]),
    trandingFee: proposed * 1000,
  });

  useEffect(() => {
    if (
      !currentUserLp ||
      (currentUserLp < lastVoteSlot?.balance && (sortedVoteSlots?.length || 0) === 8)
    )
      setWeightError(true);
    else setWeightError(false);
  }, [currentUserLp, lastVoteSlot?.balance, sortedVoteSlots?.length]);

  useEffect(() => {
    if (!isIdle && txData && (isSuccess || isError)) {
      open();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIdle, isError, isSuccess, txData]);

  return (
    <>
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
              <Label>{t('Current trading fee')}:</Label>
              {tradingFee ? `${formattedTradingFee}%` : '-%'}
            </Text>

            <InputPercentage
              style={{ width: '100%' }}
              name={name}
              label={
                <LabelWrapper>
                  {t('Your proposed fee')}
                  <span style={{ fontSize: '14px', color: COLOR.NEUTRAL[60] }}>
                    {t('Up to 1%')}
                  </span>
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
                <span>{`${weightError ? formattedTradingFee : calculateTradingFee()}%`}</span>
              </Value>
            </Summary>
          </ContentWrapper>
          <ButtonPrimaryLarge
            text={t('Vote')}
            disabled={weightError}
            isLoading={isLoading}
            onClick={writeAsync}
          />
        </Wrapper>
      </FormProvider>

      {opened && (
        <VotingPopup
          status={isError ? 'error' : 'success'}
          currentTradingFee={formattedTradingFee}
          nextTradingFee={calculateTradingFee()}
          proposedFee={proposed}
          txDate={new Date(blockTimestamp)}
          handleSuccess={() => close()}
          handleTryAgain={() => close()}
          goToScanner={() => {
            window.open(`${SCANNER_URL[NETWORK.XRPL]}/transactions/${txData?.hash}`);
          }}
        />
      )}
    </>
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
