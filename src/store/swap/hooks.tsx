import { parseUnits } from '@ethersproject/units';
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core';
import { Trade as V2Trade } from '@uniswap/v2-sdk';
import JSBI from 'jsbi';
import { ParsedQs } from 'qs';
import { ReactNode, useCallback, useMemo } from 'react';
import { Span } from '../../components/Common/Span';
import { ALL_NATIVE_CURRENCIES } from '../../constants/chains';
import { useCurrency } from '../../hooks/Tokens';
import { useTradeExactIn, useTradeExactOut } from '../../hooks/Trades';
import useActiveWeb3React from '../../hooks/useActiveWeb3React';
import { useSwapChainInfo } from '../../hooks/useSwapChainInfo';
import useSwapSlippageTolerance from '../../hooks/useSwapSlippageTolerance';
import { NativeCurrencies } from '../../interfaces/connection-config.interface';
import { isAddress } from '../../utils';
import { AppState, useAppDispatch, useAppSelector } from '../index';
import { useCurrencyBalances } from '../wallet/hooks';
import { Field, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions';
import { SwapState } from './reducer';

export function useSwapState(): AppState['swap'] {
  return useAppSelector((state) => state.swap);
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currencyId: string) => void;
  onSwitchTokens: () => void;
  onUserInput: (field: Field, typedValue: string) => void;
  onChangeRecipient: (recipient: string | null) => void;
} {
  const dispatch = useAppDispatch();

  const onCurrencySelection = useCallback(
    (field: Field, currencyId: string) => {
      dispatch(
        selectCurrency({
          field,
          currencyId,
        }),
      );
    },
    [dispatch],
  );

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies());
  }, [dispatch]);

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }));
    },
    [dispatch],
  );

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }));
    },
    [dispatch],
  );

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  };
}

// try to parse a user entered amount for a given token
export function tryParseAmount<T extends Currency>(
  value?: string,
  currency?: T,
): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    if (typedValueParsed !== '0') {
      return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(typedValueParsed));
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return undefined;
}

const BAD_RECIPIENT_ADDRESSES: { [address: string]: true } = {
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f': true, // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a': true, // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': true, // v2 router 02
};

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
  currencies: { [field in Field]?: Currency | null };
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> };
  // parsedAmount: CurrencyAmount<Currency> | undefined;
  // inputError?: ReactNode;
  // v2Trade: V2Trade<Currency, Currency, TradeType> | undefined;
  // allowedSlippage: Percent;
} {
  const { account } = useActiveWeb3React();
  const { initiateChainId, replyChainId } = useSwapChainInfo();
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState();

  const inputCurrency = useCurrency(inputCurrencyId, initiateChainId);
  const outputCurrency = useCurrency(outputCurrencyId, replyChainId);
  // const to = account || null;

  const relevantTokenBalances = [
    ...useCurrencyBalances(
      initiateChainId,
      account ?? undefined,
      useMemo(() => [inputCurrency ?? undefined], [inputCurrency]),
    ),
    ...useCurrencyBalances(
      replyChainId,
      account ?? undefined,
      useMemo(() => [outputCurrency ?? undefined], [outputCurrency]),
    ),
  ];

  // const isExactIn: boolean = independentField === Field.INPUT;
  // const parsedAmount = useMemo(
  //   () => tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined),
  //   [inputCurrency, isExactIn, outputCurrency, typedValue],
  // );

  // const bestTradeExactIn = useTradeExactIn(
  //   isExactIn ? parsedAmount : undefined,
  //   outputCurrency ?? undefined,
  // );
  // const bestTradeExactOut = useTradeExactOut(
  //   inputCurrency ?? undefined,
  //   !isExactIn ? parsedAmount : undefined,
  // );
  // const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut;

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  };

  const currencies: { [field in Field]?: Currency | null } = {
    [Field.INPUT]: inputCurrency,
    [Field.OUTPUT]: outputCurrency,
  };

  // let inputError: ReactNode | undefined;
  // if (!account) {
  //   inputError = <Span>Connect Wallet</Span>;
  // }

  // if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
  //   inputError = inputError ?? <Span>Select a token</Span>;
  // }

  // if (!parsedAmount) {
  //   inputError = inputError ?? <Span>Enter an amount</Span>;
  // }

  // const formattedTo = isAddress(to);
  // if (!to || !formattedTo) {
  //   inputError = inputError ?? <Span>Enter a recipient</Span>;
  // } else {
  //   if (BAD_RECIPIENT_ADDRESSES[formattedTo]) {
  //     inputError = inputError ?? <Span>Invalid recipient</Span>;
  //   }
  // }

  // const allowedSlippage = useSwapSlippageTolerance();

  // compare input balance to max input based on version
  // const [balanceIn, amountIn] = [
  //   currencyBalances[Field.INPUT],
  //   v2Trade?.maximumAmountIn(allowedSlippage),
  // ];

  // if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
  //   inputError = <Span>Insufficient {amountIn.currency.symbol} balance</Span>;
  // }

  return {
    currencies,
    currencyBalances,
    // parsedAmount,
    // inputError,
    // v2Trade: v2Trade ?? undefined,
    // allowedSlippage,
  };
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam);
    if (valid) return valid;
    if (ALL_NATIVE_CURRENCIES.includes(urlParam.toUpperCase() as NativeCurrencies)) {
      return urlParam.toUpperCase();
    }
  }
  return '';
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : '';
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output'
    ? Field.OUTPUT
    : Field.INPUT;
}

const ENS_NAME_REGEX =
  /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/;
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null;
  const address = isAddress(recipient);
  if (address) return address;
  if (ENS_NAME_REGEX.test(recipient)) return recipient;
  if (ADDRESS_REGEX.test(recipient)) return recipient;
  return null;
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency);
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency);
  if (inputCurrency === '' && outputCurrency === '') {
    // default to ETH input
    //todo default currency
    inputCurrency = '';
  } else if (inputCurrency === outputCurrency) {
    // clear output if identical
    outputCurrency = '';
  }

  const recipient = validatedRecipient(parsedQs.recipient);

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency === '' ? null : inputCurrency ?? null,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency === '' ? null : outputCurrency ?? null,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
  };
}
