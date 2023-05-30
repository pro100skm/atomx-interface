import { Web3Provider } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import { BigNumber, ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Flex } from '../../../components/Common/Flex';
import TextInputWithStatus, { IType } from '../../../components/Common/Inputs/TextInputWithStatus';
import Loader from '../../../components/Loader';
import { Wrappers } from '../../../components/Wrappers';
import { MAX_UINT256 } from '../../../constants';
import { AtomxER20 } from '../../../constants/abis/types';
import { ATOMX_ADDRESS } from '../../../constants/addresses';
import {
  ALL_SUPPORTED_CHAIN_IDS,
  CHAIN_INFO,
  DEFAULT_BUY_CHAIN_ID,
  DEFAULT_SELL_CHAIN_ID,
  NATIVE_CURRENCIES,
} from '../../../constants/chains';
import useActiveWeb3React from '../../../hooks/useActiveWeb3React';
import { ChainId } from '../../../interfaces/connection-config.interface';
import { Status } from '../../../interfaces/statuses';
import { TransactionType } from '../../../store/transactions/actions';
import { useTransactionAdderWithCallback } from '../../../store/transactions/hooks';
import { BIG_MAX, BIG_ZERO } from '../../../utils/bigNumber';
import { getAtomxContract, getERC20Contract } from '../../../utils/contract';
import { multicallToken } from '../../../utils/multicallToken';
import { trySwitchingNetwork } from '../../../utils/wallet';
import { GenerateHash } from './GenerateHash';
import { ShowInfo } from './ShowInfo';
import {
  CreateSwapData,
  CreateDataStatus,
  IURLSwapParams,
  IInputStatus,
  initialTokenInfo,
  TokenInfo,
} from './types';
import { LastSwapInfo } from './LastSwapInfo';
import styled from 'styled-components';
import { BaseButton, ButtonOutlined, ButtonPrimary } from '../../../components/Common/Button';
import { useWeb3React } from '@web3-react/core';
import { useSelectedNetwork } from '../../../store/swaps/hooks';
import Div from '../../../components/Common/Div';
import { SwapType } from '../../../store/swaps/interfaces/data.interface';
import { SelectNetwork } from './SelectNetwork';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from '../../../components/Common/Inputs/Select';
import { useAppDispatch } from '../../../store';
import { updateSelectedNetworks } from '../../../store/swaps/actions';
import { toast } from 'react-toastify';
import { Span } from '../../../components/Common/Span';
import CurrencyInputPanel from '../../../components/Common/CurrencyInputPanel';
import { useDerivedSwapInfo, useSwapActionHandlers } from '../../../store/swap/hooks';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { maxAmountSpend } from '../../../utils/maxAmountSpend';
import { parseChainIdAndToken } from '../utils/parseChainIdAndToken';
import { IDataFromParams } from '../interface/parsed-data.interface';
import { parseParams } from '../utils/parseParams';

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

const Limiter = styled(Flex)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 100%;
  `};
`;

const initialCreateData: CreateSwapData = {
  sellAmount: '',
  publicHash: '',
  sellerAddress: '',
  timestamp: 0,
  sellToken: '',
  buyAmount: '',
  buyChainId: null,
  buyToken: '',
};

const initialCreateDataStatus: CreateDataStatus = {
  sellAmount: IInputStatus.EMPTY,
  publicHash: IInputStatus.EMPTY,
  sellerAddress: IInputStatus.EMPTY,
  timestamp: IInputStatus.EMPTY,
  sellToken: IInputStatus.EMPTY,
  buyAmount: IInputStatus.EMPTY,
  buyChainId: IInputStatus.EMPTY,
  buyToken: IInputStatus.EMPTY,
};

const Overlapping = styled(Flex)`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  position: absolute;
  background-color: ${({ theme }) => `${theme.bg1}ee`};
  border-radius: 10px;
  z-index: 20;
`;

interface IProps {
  swapType: SwapType;
  label: string;
  timeToLock: number;
}

export const Form = ({ swapType, label, timeToLock }: IProps) => {
  const { account, library, chainId } = useActiveWeb3React();
  const { connector, activate } = useWeb3React();
  const [status, setStatus] = useState<Status>(Status.INITIAL);
  const [swapNumber, setSwapNumber] = useState(0); // swap number
  const [lastSwapNumber, setLastSwapNumber] = useState(0); // swap number
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>(initialTokenInfo);
  const [balance, setBalance] = useState<BigNumber>(BIG_ZERO);
  const addTransaction = useTransactionAdderWithCallback();
  const [atomxContract, setAtomxContract] = useState<AtomxER20 | null>(null);
  const [secretKey, setSecretKey] = useState('');
  const selectedChainId = useSelectedNetwork(swapType);
  const [data, setData] = useState(initialCreateData);
  const [dataStatus, setDataStatus] = useState<CreateDataStatus>(initialCreateDataStatus);
  const { search } = useLocation();
  const navigate = useNavigate();
  const urlSearchParams = new URLSearchParams(search);
  const dispatch = useAppDispatch();
  const { currencies, currencyBalances } = useDerivedSwapInfo();
  const { onCurrencySelection, onUserInput } = useSwapActionHandlers();
  const selectedLibrary = useMemo<Web3Provider>(() => {
    return new ethers.providers.JsonRpcProvider(
      CHAIN_INFO[selectedChainId].rpcUrls[0],
    ) as Web3Provider;
  }, [selectedChainId]);

  const handleSetParams = (key: string, value: string | ChainId) => {
    if (swapType === SwapType.replier) {
      (key === IURLSwapParams.sellChainId || key === IURLSwapParams.sellToken) &&
        urlSearchParams.set(key, String(value));
    } else {
      urlSearchParams.set(key, String(value));
    }
    navigate(`${window.location.pathname}?${urlSearchParams.toString()}`, { replace: true });
  };

  useEffect(() => {
    const dataFromParams = parseParams(urlSearchParams);
    const params = Object.entries(dataFromParams)
      .map((item) => `${item[0]}=${item[1]}`)
      .join('&');
    navigate(`${window.location.pathname}?${params}`, { replace: true });
  }, []);

  useEffect(() => {
    const dataFromParams = parseParams(urlSearchParams, () => {
      toast(<div>Provided unsupported Chain ID</div>);
    });

    if (swapType === SwapType.initiator) {
      Object.keys(dataFromParams).forEach((key) => {
        const value = dataFromParams[key as keyof IDataFromParams];
        if (Object.hasOwnProperty.call(data, key)) {
          setData((s) => ({ ...s, [key]: value }));
        }
      });

      dispatch(updateSelectedNetworks({ [swapType]: dataFromParams.sellChainId }));
      return;
    }

    setData((s) => ({ ...s, sellToken: dataFromParams.sellToken }));
    dispatch(updateSelectedNetworks({ [swapType]: dataFromParams.sellChainId }));
  }, [swapType, dispatch, search]);

  const downloadTxtFile = () => {
    if (!secretKey) return;
    const element = document.createElement('a');
    const file = new Blob([secretKey], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'SecretKey.txt';
    document.body.appendChild(element);
    element.click();
  };

  useEffect(() => {
    const timestamp = Math.floor(Date.now() / 1000) + timeToLock * 60;
    setData((prev) => ({ ...prev, timestamp }));
  }, [swapType]);

  useEffect(() => {
    const contract = getAtomxContract(selectedLibrary, selectedChainId);
    setAtomxContract(contract);
    if (account) {
      setStatus(Status.PENDING);
      Promise.all([
        contract.activeSwap(account),
        contract.lastSwap(account),
        selectedLibrary.getBalance(account),
      ])
        .then((v) => {
          setStatus(Status.SUCCESS);
          setSwapNumber(Number(v[0].toString()));
          setLastSwapNumber(Number(v[1].toString()));
          setBalance(v[2]);
        })
        .catch(() => {
          setStatus(Status.ERROR);
        });
    }
  }, [selectedLibrary, account]);

  useEffect(() => {
    if (data.sellToken && account && selectedLibrary) {
      multicallToken(
        selectedLibrary,
        selectedChainId,
        data.sellToken,
        false,
        account,
        ATOMX_ADDRESS[selectedChainId],
      ).then(({ name, balance, allowance, symbol, decimals }) => {
        setTokenInfo({
          name,
          balance,
          allowance,
          symbol,
          decimals,
        });
      });
    }
  }, [data.sellToken, account, selectedLibrary, selectedChainId]);

  const needToApprove = useMemo<boolean>(() => {
    if (tokenInfo.decimals && Number(data.sellAmount) > 0) {
      return parseUnits(data.sellAmount, tokenInfo.decimals).gt(tokenInfo.allowance);
    }
    return false;
  }, [tokenInfo, data.sellAmount]);

  const needToSwitch = useMemo<ChainId | null>(() => {
    if (chainId !== selectedChainId) {
      return selectedChainId;
    }
    return null;
  }, [chainId, selectedChainId]);

  const handleUpdateAllowance = () => {
    setTokenInfo((prev) => ({ ...prev, allowance: BIG_MAX }));
  };

  const updateSwapNumber = () => {
    if (!atomxContract || !account) return;
    atomxContract.activeSwap(account).then((res) => {
      setSwapNumber(Number(res.toString()));
    });
  };

  const handleApprove = async () => {
    if (!library || !account || !chainId) {
      return;
    }
    const tokenContract = getERC20Contract(library, data.sellToken, account);
    const res = await tokenContract.approve(ATOMX_ADDRESS[chainId as ChainId], MAX_UINT256);
    addTransaction(
      res,
      {
        type: TransactionType.APPROVAL,
        tokenAddress: data.sellToken,
        tokenSymbol: tokenInfo.symbol,
        spender: ATOMX_ADDRESS[chainId as ChainId],
      },
      () => {
        handleUpdateAllowance.call(this);
      },
    );
  };

  const handleCreatePresale = async () => {
    if (!library || !chainId || !account) {
      return;
    }
    const contract = getAtomxContract(library, chainId, account);

    const res = await contract.initiateSwap(
      data.sellToken,
      data.sellerAddress,
      data.publicHash,
      data.timestamp,
      parseUnits(data.sellAmount, tokenInfo.decimals).toString(),
      swapType === SwapType.initiator,
      { value: '0' },
    );

    addTransaction(
      res,
      {
        type: TransactionType.CREATE_SWAP,
        tokenSymbol: tokenInfo.symbol,
        amount: data.sellAmount,
      },
      () => {
        downloadTxtFile();
        updateSwapNumber();
        handleUpdateAllowance.call(this);
      },
    );
  };

  const handleRefund = async () => {
    if (atomxContract && library && account) {
      const res = await atomxContract.refund(swapNumber);
      addTransaction(
        res,
        {
          type: TransactionType.REFUND,
          amount: `${data.sellAmount}`,
        },
        () => {
          updateSwapNumber();
        },
      );
    }
  };

  const overlappingContent = useMemo(() => {
    if (status === Status.PENDING) {
      return (
        <Overlapping>
          <Loader size='30px' />
        </Overlapping>
      );
    }
    if (data.timestamp < Date.now() && lastSwapNumber !== 0) {
      return (
        <Overlapping>
          <Flex flexDirection='column' gap='1rem'>
            <Div color='red'>Lock time is ended</Div>
            <BaseButton bg='black' color='white' onClick={handleRefund}>
              REFUND
            </BaseButton>
          </Flex>
        </Overlapping>
      );
    }
    return;
  }, [status]);

  const maxInputAmount: { [key in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    return {
      [Field.INPUT]: maxAmountSpend(currencyBalances[Field.INPUT]),
      [Field.OUTPUT]: maxAmountSpend(currencyBalances[Field.OUTPUT]),
    };
  }, [currencyBalances]);

  const showMaxButton = {
    [Field.INPUT]: Boolean(maxInputAmount[Field.INPUT]?.greaterThan(0)),
    [Field.OUTPUT]: Boolean(maxInputAmount[Field.OUTPUT]?.greaterThan(0)),
  };

  const handleMaxInput = (field: Field) => {
    handleSetParams(
      field === Field.INPUT ? IURLSwapParams.sellAmount : IURLSwapParams.buyAmount,
      //@ts-ignore
      maxInputAmount[field].toExact(),
    );
  };

  useEffect(() => {
    onUserInput(Field.INPUT, data.sellAmount);
  }, [onUserInput, data.sellAmount]);

  useEffect(() => {
    onUserInput(Field.OUTPUT, data.buyAmount);
  }, [onUserInput, data.buyAmount]);

  useEffect(() => {
    if (!data.sellToken) return;
    onCurrencySelection(Field.INPUT, data.sellToken);
  }, [onCurrencySelection, data.sellToken]);

  useEffect(() => {
    if (!data.buyToken) return;
    onCurrencySelection(Field.OUTPUT, data.buyToken);
  }, [onCurrencySelection, data.buyToken]);

  return (
    <Flex justify='center'>
      <Wrappers width='30rem'>
        <Limiter>
          {overlappingContent}
          <Flex flexDirection='column' gap='2rem' position='relative'>
            <Span fontSizePreset='large' fontWeightPreset='bold'>
              {label}
            </Span>
            {lastSwapNumber !== 0 && (
              <LastSwapInfo swapNumber={lastSwapNumber} atomxContract={atomxContract} />
            )}
            {swapNumber !== 0 ? (
              <ShowInfo
                updateSwapNumber={updateSwapNumber}
                swapNumber={swapNumber}
                atomxContract={atomxContract}
                needToSwitch={needToSwitch}
              />
            ) : (
              <Flex flexDirection='column' gap='1rem'>
                <Flex flexDirection='column' gap='0.3rem'>
                  <Flex justify='space-between'>
                    <Div fontSizePreset='medium' fontWeightPreset='bold'>
                      You sell
                    </Div>
                  </Flex>

                  <CurrencyInputPanel
                    value={data.sellAmount}
                    showMaxButton={showMaxButton[Field.INPUT]}
                    currency={currencies[Field.INPUT]}
                    onUserInput={(v) => handleSetParams(IURLSwapParams.sellAmount, v)}
                    onCurrencySelect={(inputCurrency) =>
                      handleSetParams(
                        IURLSwapParams.sellToken,
                        inputCurrency.isToken
                          ? inputCurrency.address
                          : inputCurrency.isNative
                          ? String(NATIVE_CURRENCIES[selectedChainId])
                          : '',
                      )
                    }
                    onMax={() => handleMaxInput(Field.INPUT)}
                    otherCurrency={currencies[Field.OUTPUT]}
                    showCommonBases={true}
                    id='swap-currency-input'
                    tokenType={IURLSwapParams.sellToken}
                    networkSelect={<SelectNetwork />}
                  />
                </Flex>

                {swapType === SwapType.initiator && (
                  <Flex flexDirection='column' gap='0.3rem'>
                    <Flex justify='space-between'>
                      <Div fontSizePreset='medium' fontWeightPreset='bold'>
                        You buy
                      </Div>
                    </Flex>
                    <CurrencyInputPanel
                      value={data.buyAmount}
                      showMaxButton={showMaxButton[Field.OUTPUT]}
                      currency={currencies[Field.OUTPUT]}
                      onUserInput={(v) => handleSetParams(IURLSwapParams.buyAmount, v)}
                      onCurrencySelect={(inputCurrency) =>
                        handleSetParams(
                          IURLSwapParams.buyToken,
                          inputCurrency.isToken
                            ? inputCurrency.address
                            : inputCurrency.isNative
                            ? String(NATIVE_CURRENCIES[data.buyChainId as ChainId])
                            : '',
                        )
                      }
                      onMax={() => handleMaxInput(Field.OUTPUT)}
                      otherCurrency={currencies[Field.INPUT]}
                      showCommonBases={true}
                      id='swap-currency-input'
                      tokenType={IURLSwapParams.buyToken}
                      networkSelect={
                        <Select
                          width='100%'
                          // label='Reply network'
                          value={data.buyChainId || DEFAULT_SELL_CHAIN_ID}
                          change={(v) => handleSetParams(IURLSwapParams.buyChainId, v)}
                          options={ALL_SUPPORTED_CHAIN_IDS.map((id) => ({
                            label: CHAIN_INFO[id].label,
                            value: id,
                          }))}
                        />
                      }
                    />
                  </Flex>
                )}

                <Flex justify='space-between' gap='2rem'>
                  <TextInputWithStatus
                    type={IType.ADDRESS}
                    value={data.sellerAddress}
                    change={(v) => handleSetParams(IURLSwapParams.sellerAddress, v)}
                    label='Receiver address'
                    getStatus={(status) => console.log(status)}
                    placeholder='enter address'
                  />
                  <TextInputWithStatus
                    type={IType.TEXT}
                    change={(v) => console.log(v)}
                    value={`${timeToLock} minutes`}
                    label='Time to lock'
                    getStatus={(status) => console.log(status)}
                    placeholder='0'
                    readOnly={true}
                    tooltip='The P2P order will automatically become inactive after the specified time has elapsed'
                  />
                </Flex>

                {swapType === SwapType.initiator ? (
                  <GenerateHash
                    getSecretKey={(v) => setSecretKey(v)}
                    change={(publicHash) => setData((prev) => ({ ...prev, publicHash }))}
                  />
                ) : (
                  <TextInputWithStatus
                    type={IType.TEXT}
                    value={data.publicHash}
                    change={(v) => setData((prev) => ({ ...prev, publicHash: v }))}
                    label='Public HASH (copy from counterparty contract)'
                    getStatus={(status) => console.log(status)}
                    placeholder='enter hash'
                  />
                )}

                <Flex justify='start' gap='0.3rem' flexWrap='wrap'>
                  {needToSwitch && connector ? (
                    <ButtonPrimary
                      onClick={() => trySwitchingNetwork(connector, activate, needToSwitch)}
                      width='fit-content'
                      margin='0 auto'
                    >
                      {`Switch to ${CHAIN_INFO[needToSwitch].label}`}
                    </ButtonPrimary>
                  ) : (
                    <>
                      {needToApprove && (
                        <ButtonOutlined onClick={handleApprove}>APPROVE</ButtonOutlined>
                      )}
                      <BaseButton
                        bg='black'
                        color='white'
                        disabled={needToApprove}
                        onClick={handleCreatePresale}
                      >
                        CREATE SWAP
                      </BaseButton>
                    </>
                  )}
                </Flex>
              </Flex>
            )}
          </Flex>
        </Limiter>
      </Wrappers>
    </Flex>
  );
};
