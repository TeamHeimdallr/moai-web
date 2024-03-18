import { Suspense, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import tw, { css, styled } from 'twin.macro';
import { formatUnits, parseUnits } from 'viem';
import * as yup from 'yup';

import { useBridgeToXrpl as useBridgeToXrplEvmSubstrate } from '~/api/api-contract/_evm/campaign/bridge/bridge-root-to-xrpl';
import { useBridgeToXrpl as useBridgeToXrplFpassSubstrate } from '~/api/api-contract/_evm/campaign/bridge/bridge-root-to-xrpl-substrate';
import { useUserAllTokenBalances } from '~/api/api-contract/balance/user-all-token-balances';

import { COLOR } from '~/assets/colors';
import {
  IconArrowDown,
  IconCancel,
  IconCheck,
  IconLink,
  IconTime,
  IconTokenXrp,
} from '~/assets/icons';
import TokenXrp from '~/assets/icons/icon-token-xrp.svg';

import { MILLION, NETWORK_IMAGE_MAPPER, SCANNER_URL } from '~/constants';

import { ButtonPrimaryLarge } from '~/components/buttons';
import { InputNumber } from '~/components/inputs';
import { List } from '~/components/lists';
import { Popup } from '~/components/popup';
import { ButtonSkeleton } from '~/components/skeleton/button-skeleton';
import { ListSkeleton } from '~/components/skeleton/list-skeleton';
import { Token } from '~/components/token';
import { TokenList } from '~/components/token-list';

import { TooltipAddress } from '~/pages/campaign/components/tooltip-address';

import { useGAAction } from '~/hooks/analaystics/ga-action';
import { useGAInView } from '~/hooks/analaystics/ga-in-view';
import { usePopup } from '~/hooks/components';
import { useNetwork } from '~/hooks/contexts/use-network';
import { useMediaQuery } from '~/hooks/utils';
import { useConnectedWallet } from '~/hooks/wallets';
import { DATE_FORMATTER, formatNumber, getNetworkFull, truncateAddress } from '~/utils';
import {
  useBridgeNetworkFeeErrorStore,
  useBridgeToXrplNetworkFeeErrorStore,
} from '~/states/contexts/network-fee-error/network-fee-error';
import { useTheRootNetworkSwitchWalletStore } from '~/states/contexts/wallets/switch-wallet';
import { NETWORK, POPUP_ID, TOOLTIP_ID } from '~/types';

import { useBalance } from '../hooks/use-balance';
import { useSelectNetwork } from '../hooks/use-select-network';
import { useSelectToken } from '../hooks/use-select-token';
import { getNetworkName } from '../utils/network-name';

import { ListItem } from './list';

interface Props {
  amount: number;
  value: number;
}
export const BridgePopup = ({ amount, value }: Props) => {
  const { ref } = useGAInView({ name: 'bridge-popup' });

  const { gaAction } = useGAAction();

  const navigate = useNavigate();
  const { close } = usePopup(POPUP_ID.BRIDGE);

  const { t } = useTranslation();
  const { network: networkParam } = useParams();
  const { isEvm, isFpass, selectedNetwork } = useNetwork();
  const { isMD } = useMediaQuery();

  const { from, to, selectNetwork, switchNetwork } = useSelectNetwork();
  const { selectableToken, token } = useSelectToken();
  const { balances } = useBalance();

  const { xrp, fpass, evm } = useConnectedWallet();

  const evmAddress = isFpass ? fpass?.address : isEvm ? evm?.address : '';
  const xrpAddress = xrp?.address || '';
  const address = to === 'XRPL' ? xrpAddress : evmAddress;

  const [estimatedBridgeFee, setEstimatedBridgeFee] = useState<number | undefined>();
  const { error: bridgeGasError, setError: setBridgeGasError } = useBridgeNetworkFeeErrorStore();

  const gasToken = from === 'ETHEREUM' ? 'ETH' : 'XRP';
  const gasBalance =
    balances?.find(b => {
      if (from === 'ETHEREUM') return b.symbol === 'ETH';
      return b.symbol === 'XRP';
    })?.balance || 0;

  // const bridgeEvmSubstrate = useBridgeToXrplEvmSubstrate({
  //   amount: parseUnits(inputValue?.toString() ?? '0', 6) || 0n,
  //   destination: xrpWallet.address,
  //   enabled: bridgeEnabled,
  // });

  // const bridgeFpassSubstrate = useBridgeToXrplFpassSubstrate({
  //   amount: parseUnits(inputValue?.toString() ?? '0', 6) || 0n,
  //   destination: xrpWallet.address,
  //   enabled: bridgeEnabled,
  // });

  // const bridgeToXrpl = isFpass ? bridgeFpassSubstrate : bridgeEvmSubstrate;

  const {
    isSuccess: bridgeSuccess,
    isLoading,
    isError,
    txData,
    blockTimestamp,
    writeAsync: bridge,
    estimateFee,
  } = {} as any; // TODO

  const isSuccess = bridgeSuccess && !!txData;
  const txDate = new Date(blockTimestamp || 0);
  const isIdle = !txData;
  const estimatedFee = estimatedBridgeFee || 0.5;
  const gasError = gasBalance <= estimatedFee || bridgeGasError;

  const invalid = isError || gasError || !estimatedFee;

  const handleButtonClick = async () => {
    if (invalid || isLoading) return;
    if (!isIdle) {
      if (isSuccess) {
        close();
        navigate(`/bridge`);
        return;
      }
      close();
      return;
    }

    gaAction({
      action: 'bridge',
      data: {
        component: 'bridge-popup',
        estimatedFee,
      },
    });
    await bridge?.();
  };

  const buttonText = useMemo(() => {
    if (!isIdle) {
      if (isSuccess) return t('Return to voyage page');
      return t('Try again');
    }

    return t('Bridge');
  }, [isSuccess, isIdle, t]);

  const handleLink = () => {
    // const txHash = txData?.extrinsicId;
    // const url = `${SCANNER_URL[currentNetwork || NETWORK.THE_ROOT_NETWORK]}/extrinsics/${txHash}`;
    // gaAction({
    //   action: 'go-to-transaction',
    //   data: { component: 'campaign-bridge-to-xrpl-popup', txHash: txHash, link: url },
    // });
    // window.open(url);
  };

  useEffect(() => {
    return () => {
      setBridgeGasError(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!estimateFee) return;

    const estimateBridgeFeeAsync = async () => {
      const fee = await estimateFee?.();
      setEstimatedBridgeFee(fee ?? 0.5);
    };
    estimateBridgeFeeAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Popup
      id={POPUP_ID.BRIDGE}
      title={isIdle ? t('Bridge preview') : ''}
      button={
        <ButtonPrimaryLarge
          text={buttonText}
          isLoading={isLoading}
          buttonType={isIdle ? 'filled' : 'outlined'}
          disabled={(isIdle && invalid) || !estimatedFee}
          onClick={() => handleButtonClick()}
        />
      }
    >
      <Wrapper style={{ gap: isIdle ? (isMD ? 24 : 20) : 40 }} ref={ref}>
        {!isIdle && isSuccess && (
          <ResultWrapper>
            <SuccessIconWrapper>
              <IconCheck width={40} height={40} />
            </SuccessIconWrapper>
            <ResultTitle>{t('Bridge reqeust success!')}</ResultTitle>
            <ResultSubtitle>{t('bridge-request-success-message')}</ResultSubtitle>
          </ResultWrapper>
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
                    to === 'XRPL' ? truncateAddress(xrpAddress) : truncateAddress(evmAddress)
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
                  image={<ListImage src={NETWORK_IMAGE_MAPPER[from]} />}
                  title={`${getNetworkName(from)} Bridge`}
                  titleCaption={'15 minutes'}
                  value={`${formatNumber(amount, 2)} ${token?.symbol}`}
                  valueType="large"
                  valueCaption={`$${formatNumber(value, 2, 'floor', MILLION, 2)}`}
                />
                <Divider />
                <ListItem
                  title={t('Gas fee')}
                  value={`~${formatNumber(estimatedFee, 2)} ${gasToken}`}
                  valueType="medium"
                  titleCaption={
                    gasError
                      ? t(`Not enough balance to pay for Gas Fee.`)
                      : t(`May change when network is busy`)
                  }
                />
              </ListInnerWrapper>
            </List>
          </>
        )}
      </Wrapper>
      <TooltipAddress address={address} />
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
  text-neutral-80 font-r-14
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
