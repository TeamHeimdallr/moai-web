import { useEffect, useState } from 'react';

import { useApprove } from '~/api/api-contract/token/approve';

import { ITokenComposition } from '~/types';

interface Props {
  tokensIn?: (ITokenComposition & { balance: number; amount: number })[];
  vault?: string;
  deposit?: () => Promise<void>;
}

export const useAddLiquidityStep = ({ tokensIn, vault, deposit }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tokenLength = tokensIn?.filter(t => t.amount > 0)?.length || 0;

  const token1Amount = tokensIn?.[0]?.amount || 0;
  const token2Amount = tokensIn?.[1]?.amount || 0;

  const { allow: allowToken1, allowance: allowance1 } = useApprove({
    amount: token1Amount,
    address: tokensIn?.[0]?.address || '',
    issuer: tokensIn?.[0]?.address || '',
    spender: vault || '',
    currency: tokensIn?.[0]?.currency || '',
    enabled: token1Amount > 0,
  });

  const { allow: allowToken2, allowance: allowance2 } = useApprove({
    amount: token2Amount,
    address: tokensIn?.[1]?.address || '',
    issuer: tokensIn?.[1]?.address || '',
    spender: vault || '',
    currency: tokensIn?.[1]?.currency || '',
    enabled: token2Amount > 0,
  });

  const totalStep = tokenLength;

  const buttonAction = async () => {
    // 2 token deposit
    if (totalStep === 2) {
      if (!allowance1) return await allowToken1();
      if (!allowance2) return await allowToken2();

      return await deposit?.();
    }

    // single token deposit
    if (totalStep === 1) {
      if (token1Amount > 0 && token2Amount <= 0) {
        if (allowance1) return await deposit?.();
        else await allowToken1();
      }
      if (token2Amount > 0 && token1Amount <= 0) {
        if (allowance2) return await deposit?.();
        else await allowToken2();
      }
    }
  };

  const getButtonText = () => {
    // 2 token deposit
    if (totalStep === 2) {
      if (!allowance1) return `Approve ${tokensIn?.[0]?.symbol} for adding liquidity`;
      if (!allowance2) return `Approve ${tokensIn?.[1]?.symbol} for adding liquidity`;

      return 'Add liquidity';
    }

    // single token deposit
    if (totalStep === 1) {
      if (token1Amount > 0 && token2Amount <= 0) {
        if (!allowance1) return `Approve ${tokensIn?.[0]?.symbol} for adding liquidity`;
        return 'Add liquidity';
      }
      if (token2Amount > 0 && token1Amount <= 0) {
        if (!allowance2) return `Approve ${tokensIn?.[1]?.symbol} for adding liquidity`;
        return 'Add liquidity';
      }
    }

    return '';
  };

  useEffect(() => {
    // 2 token deposit
    if (totalStep === 2) {
      if (allowance1) return setCurrentStep(1);
      if (allowance2) return setCurrentStep(2);
    }

    // single token deposit
    if (totalStep === 1) {
      if (token1Amount > 0 && token2Amount <= 0) {
        if (allowance1) return setCurrentStep(1);
      }
      if (token2Amount > 0 && token1Amount <= 0) {
        if (allowance2) return setCurrentStep(1);
      }
    }
  }, [allowance1, allowance2, token1Amount, token2Amount, totalStep]);

  return {
    totalStep,
    currentStep,

    buttonText: getButtonText(),
    buttonAction,
  };
};
