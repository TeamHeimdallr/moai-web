import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import tw from 'twin.macro';
import { Address, parseUnits } from 'viem';
import { mainnet, sepolia } from 'wagmi';

import { useBridge } from '~/api/api-contract/bridge/bridge';
import { useApprove } from '~/api/api-contract/token/approve';

import { COLOR } from '~/assets/colors';
import { IconArrowDown, IconCancel, IconCheck, IconLink, IconTime } from '~/assets/icons';

import { IS_MAINNET, MILLION, NETWORK_IMAGE_MAPPER, SCANNER_URL, THOUSAND } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { List } from '~/components/lists';
import { LoadingStep } from '~/components/loadings';
import { Popup } from '~/components/popup';
import { TokenList } from '~/components/token-list';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { DATE_FORMATTER, formatNumber, truncateAddress } from '~/utils';
import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';
import { POPUP_ID } from '~/types';

import { useBalance } from '../hooks/use-balance';
import { useSelectNetwork } from '../hooks/use-select-network';
import { useSelectToken } from '../hooks/use-select-token';
import { getNetworkName } from '../utils/network-name';
import { getEthBridgeContractAddressFromTokneSymbol } from '../utils/token';

import { ListItem } from './list';

interface Props {
  amount: number;
  value: number;
}
export const BridgePopup = ({ amount, value }: Props) => {
  const { ref } = useGAInView({ name: 'bridge-popup' });

  const { gaAction } = useGAAction();

  const { selectedWallet: selectedWalletTRN } = useTheRootNetworkSwitchWalletStore();

  const navigate = useNavigate();
  const { close } = usePopup(POPUP_ID.BRIDGE);

  const { t } = useTranslation();
  const { isEvm, isFpass } = useNetwork();
  const { isMD } = useMediaQuery();

  const { from, to } = useSelectNetwork();
  const { token } = useSelectToken();
  const { gasBalance } = useBalance();

  const { xrp, fpass, evm } = useConnectedWallet();

  const evmAddress = isFpass
    ? fpass?.address
    : isEvm
    ? evm?.address
    : selectedWalletTRN === 'fpass'
    ? fpass?.address
    : evm?.address;
  const evmDestination = isFpass
    ? to === 'ETHEREUM'
      ? evm?.address
      : fpass?.address
    : isEvm
    ? evm?.address
    : selectedWalletTRN === 'fpass'
    ? fpass?.address
    : evm?.address;
  const xrpAddress = xrp?.address || '';
  const destination = to === 'XRPL' ? xrpAddress : evmDestination;

  const [estimatedBridgeFee, setEstimatedBridgeFee] = useState<number | undefined>();
  const [estimatedApproveFee, setEstimatedApproveFee] = useState<number | undefined>();

  const gasToken = from === 'ETHEREUM' ? 'ETH' : 'XRP';

  // eth to root, need to approve
  const ethBridgeContractAddress = getEthBridgeContractAddressFromTokneSymbol(token.symbol || '');
  const isEthToRoot = from === 'ETHEREUM' && to === 'THE_ROOT_NETWORK';
  const {
    allow,
    allowance,
    isLoading: allowLoading,
    isSuccess: allowSuccess,
    refetch: refetchAllowance,
    estimateFee: estimateApproveFee,
  } = useApprove({
    amount: parseUnits((amount || 0).toString(), token?.decimal || 18),
    symbol: token.symbol || '',
    issuer: '',
    spender: ethBridgeContractAddress,
    address: (token.address || '') as Address,
    chainId: IS_MAINNET ? mainnet.id : sepolia.id,
    enabled: isEthToRoot && !!evmAddress && token.symbol !== 'ETH',
  });

  const {
    writeAsync: bridge,
    isLoading: bridgeLoading,
    isSuccess: bridgeSuccess,
    isError: bridgeError,
    txData,
    blockTimestamp,
    estimateFee: estimateBridgeFee,
  } = useBridge({
    amount: amount || 0,
    destination,
    enabled: true,
  });

  const isSuccess = bridgeSuccess && !!txData;
  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData;
  const estimatedFee =
    isEthToRoot && token.symbol !== 'ETH' && !allowance
      ? estimatedApproveFee || 0.5
      : estimatedBridgeFee || 0.5;
  const gasError = gasBalance <= estimatedFee;

  const invalid = bridgeError || gasError || !estimatedFee;
  const handleButtonClick = async () => {
    if (invalid || allowLoading || bridgeLoading) return;

    if (!isIdle) {
      if (isSuccess) {
        close();
        navigate(`/bridge`);
        return;
      }
      close();
      return;
    }

    if (isEthToRoot) {
      if (token.symbol !== 'ETH' && !allowance) {
        gaAction({
          action: 'bridge-approve',
          data: {
            component: 'bridge-popup',
            from,
            to,
            token,
            gasToken,
            gasBalance,
            estimatedFee,
          },
        });

        await allow?.();
        return;
      }
    }
    gaAction({
      action: 'bridge',
      data: {
        component: 'bridge-popup',
        from,
        to,
        token,
        gasToken,
        gasBalance,
        estimatedFee,
      },
    });
    await bridge?.();
  };

  const maxStep = isEthToRoot && token.symbol !== 'ETH' ? 2 : 1;
  const step = useMemo(() => {
    if (isSuccess) return 2;
    if (isEthToRoot && token.symbol !== 'ETH') return allowance ? 2 : 1;
    return 1;
  }, [allowance, isEthToRoot, isSuccess, token.symbol]);

  const stepLoading = useMemo(() => {
    if (isEthToRoot && token.symbol !== 'ETH') return allowance ? bridgeLoading : allowLoading;
    return bridgeLoading;
  }, [allowLoading, allowance, bridgeLoading, isEthToRoot, token.symbol]);

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Return to bridge page');
      return t('Try again');
    }

    if (isEthToRoot && token.symbol !== 'ETH') {
      if (!allowance) return t('approve-bridge-token-message', { token: token?.symbol });
    }

    if (bridgeLoading) return t('Confirm bridging in wallet');
    return t('Bridge');
  }, [allowance, bridgeLoading, isEthToRoot, isIdle, isSuccess, t, token?.symbol]);

  const handleLink = () => {
    const txHash = txData?.extrinsicId || txData?.transactionHash;

    const getUrl = () => {
      if (from === 'ETHEREUM') return `${SCANNER_URL[from]}/tx/${txHash}`;
      if (from === 'XRPL')
        return `${
          IS_MAINNET ? 'https://livenet.xrpl.org' : 'https://testnet.xrpl.org'
        }/transactions/${txData.hash}`;
      return `${SCANNER_URL[from]}/extrinsics/${txHash}`;
    };
    const url = getUrl();

    gaAction({
      action: 'go-to-transaction',
      data: { component: 'bridge-popup', txHash: txHash, link: url },
    });
    window.open(url);
  };

  useEffect(() => {
    if (allowSuccess) refetchAllowance();
  }, [allowSuccess, refetchAllowance]);

  useEffect(() => {
    const estimateBridgeFeeAsync = async () => {
      if (isEthToRoot && token.symbol !== 'ETH' && !allowance) {
        const fee = await estimateApproveFee?.();
        setEstimatedApproveFee(fee ?? 0.5);
        return;
      }
      const fee = await estimateBridgeFee?.();
      setEstimatedBridgeFee(fee ?? 0.5);
    };

    estimateBridgeFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowance]);

  return (
    <Popup
      id={POPUP_ID.BRIDGE}
      title={isIdle ? t('Bridge preview') : ''}
      button={
        <ButtonPrimaryLarge
          text={buttonText}
          isLoading={allowLoading || bridgeLoading}
          buttonType={isIdle ? 'filled' : 'outlined'}
          disabled={(isIdle && invalid) || !estimatedFee}
          onClick={() => handleButtonClick()}
        />
      }
    >
      <Wrapper style={{ gap: isIdle ? (isMD ? 24 : 20) : 40 }} ref={ref}>
        {!isIdle && isSuccess && (
          <>
            <ResultWrapper>
              <SuccessIconWrapper>
                <IconCheck width={40} height={40} />
              </SuccessIconWrapper>
              <ResultTitle>{t('Bridge Request Success!')}</ResultTitle>
              <ResultSubtitle>{t('bridge-request-success-message')}</ResultSubtitle>
            </ResultWrapper>
            <List title={t(`You're expected to receive bridge`)}>
              <TokenList
                type="large"
                title={`${formatNumber(amount || 0, 4, 'floor', MILLION, 4)}`}
                subTitle={`${token?.symbol || ''}`}
                description={`$${formatNumber(value, 2, 'floor', MILLION, 2)}`}
                image={token.image || ''}
                leftAlign={true}
              />
            </List>
            <Scanner onClick={() => handleLink()}>
              <IconTime width={20} height={20} fill={COLOR.NEUTRAL[40]} />
              <ScannerText> {format(new Date(txDate), DATE_FORMATTER.FULL)}</ScannerText>
              <IconLink width={20} height={20} fill={COLOR.NEUTRAL[40]} />
            </Scanner>
          </>
        )}
        {!isIdle && !isSuccess && (
          <ResultWrapper style={{ paddingBottom: '24px' }}>
            <FailedIconWrapper>
              <IconCancel width={40} height={40} />
            </FailedIconWrapper>
            <ResultTitle>{t('Bridge failed')}</ResultTitle>
            <ResultSubtitle>{t('bridge-request-fail-message')}</ResultSubtitle>
          </ResultWrapper>
        )}
        {isIdle && (
          <>
            <List title={t('Network')}>
              <ListInnerWrapper>
                <ListItem
                  image={<ListImage src={NETWORK_IMAGE_MAPPER[from]} />}
                  title={getNetworkName(from)}
                  titleCaption={
                    from === 'XRPL' ? truncateAddress(xrpAddress) : truncateAddress(evmAddress)
                  }
                />
                <Divider />
                <ListItem
                  image={<ListImage src={NETWORK_IMAGE_MAPPER[to]} />}
                  title={getNetworkName(to)}
                  titleCaption={
                    to === 'XRPL' ? truncateAddress(xrpAddress) : truncateAddress(evmDestination)
                  }
                />

                <IconWrapper>
                  <ArrowDownWrapper>
                    <IconArrowDown width={20} height={20} fill={COLOR.PRIMARY[50]} />
                  </ArrowDownWrapper>
                </IconWrapper>
              </ListInnerWrapper>
            </List>
            <List title={t('Summary')}>
              <ListInnerWrapper>
                <ListItem
                  type="medium"
                  image={<ListImage src={NETWORK_IMAGE_MAPPER.THE_ROOT_NETWORK} />}
                  title={`${getNetworkName('THE_ROOT_NETWORK')} Bridge`}
                  value={`${formatNumber(amount, 2)} ${token?.symbol}`}
                  valueType="large"
                  valueCaption={`$${formatNumber(value, 2, 'floor', MILLION, 2)}`}
                />
                <Divider />
                <ListItem
                  type="medium"
                  title={t('Gas fee')}
                  value={`~${formatNumber(estimatedFee, 8, 'floor', THOUSAND, 0)} ${gasToken}`}
                  valueType="medium"
                  titleCaption={
                    gasError
                      ? t(`Not enough balance to pay for Gas Fee.`)
                      : t(`May change when network is busy`)
                  }
                />
              </ListInnerWrapper>
            </List>

            {maxStep > 1 && (
              <LoadingStep
                totalSteps={maxStep}
                step={step}
                isLoading={stepLoading}
                isDone={isSuccess}
              />
            )}
          </>
        )}
      </Wrapper>
    </Popup>
  );
};

const Wrapper = tw.div`
  flex flex-col gap-24 px-24 py-0 pb-24
`;

const FailedIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-red-50
`;
const SuccessIconWrapper = tw.div`
  flex-center w-48 h-48 rounded-full bg-green-50
`;

const ResultWrapper = tw.div`
  flex-center flex-col gap-12
`;

const ResultTitle = tw.div`
  text-neutral-100 font-b-20
  md:font-b-24
`;

const ResultSubtitle = tw.div`
  text-neutral-80 font-r-14 text-center
  md:font-r-16
`;

const ListInnerWrapper = tw.div`
  px-16 py-12 flex flex-col gap-12 relative
`;

const Divider = tw.div`
  w-full h-1 flex-shrink-0 bg-neutral-20
`;

const ListImage = tw.img`
  w-36 h-36 object-cover
`;

const IconWrapper = tw.div`
  absolute absolute-center-y right-28 z-2
`;

const ArrowDownWrapper = tw.div`
  p-6 flex-center rounded-full bg-neutral-20
`;

const Scanner = tw.div`
  flex items-start gap-4 clickable
`;

const ScannerText = tw.div`
  font-r-12 text-neutral-60
`;
