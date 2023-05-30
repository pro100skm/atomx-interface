import { Currency, CurrencyAmount, Ether, Token } from '@uniswap/sdk-core';
import ERC20ABI from '../../constants/abis/erc20.json';
import JSBI from 'jsbi';
import { useEffect, useMemo, useState } from 'react';
import { useAllTokens } from '../../hooks/Tokens';
import { isAddress } from '../../utils';
import useActiveWeb3React from '../../hooks/useActiveWeb3React';
import { useLibrary } from '../../hooks/useLibrary';
import { ChainId } from '../../interfaces/connection-config.interface';
import { multicall } from '../../utils/multicall';
import { BigNumber } from '@ethersproject/bignumber';
/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useETHBalances(currencies?: Currency[] | null): {
  [address: string]: CurrencyAmount<Currency> | undefined;
} {
  const [balances, setBalances] = useState({});
  const getLibraryByChainId = useLibrary();
  const { account } = useActiveWeb3React();

  useEffect(() => {
    if (
      !currencies ||
      !getLibraryByChainId ||
      !account ||
      currencies.every((cur) => cur.chainId in balances)
    ) {
      return;
    }
    currencies.reduce(async (memo: any, cur) => {
      const library = getLibraryByChainId[cur.chainId as ChainId];
      if (!library) return;
      if (cur.chainId in balances) return;
      const balance = await library.getBalance(account);
      if (balance) {
        memo[cur.chainId] = CurrencyAmount.fromRawAmount(
          Ether.onChain(cur.chainId),
          JSBI.BigInt(balance.toString()),
        );
      }
      setBalances({ ...balances, ...memo });
      return memo;
    }, {});
  }, [currencies, getLibraryByChainId, account]);
  return balances;
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  selectedChainId: ChainId,
  address?: string,
  tokens?: (Token | undefined)[],
): [{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }, boolean] {
  const [balances, setBalances] = useState<[] | [BigNumber][]>([]);
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens],
  );

  const selectedLibrary = useLibrary()[selectedChainId];
  const validatedTokenAddresses = useMemo(
    () => validatedTokens.map((vt) => vt.address),
    [validatedTokens],
  );

  useEffect(() => {
    if (!validatedTokenAddresses || !address || !selectedLibrary) return;

    multicall(
      ERC20ABI,
      validatedTokenAddresses.map((item) => {
        return {
          address: item,
          name: 'balanceOf',
          params: [address],
        };
      }),
      selectedLibrary,
      selectedChainId,
    )
      .then((v) => {
        setBalances(v);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [validatedTokenAddresses, address, selectedLibrary, selectedChainId]);

  return useMemo(
    () => [
      address && validatedTokens.length > 0
        ? validatedTokens.reduce<{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }>(
            (memo, token, i) => {
              const value = balances?.[i]?.[0];
              const amount = value ? JSBI.BigInt(value.toString()) : undefined;
              if (amount) {
                memo[token.address] = CurrencyAmount.fromRawAmount(token, amount);
              }
              return memo;
            },
            {},
          )
        : {},
      false,
    ],
    [address, validatedTokens, balances],
  );
}

export function useTokenBalances(
  selectedChainId: ChainId,
  address?: string,
  tokens?: (Token | undefined)[],
): { [tokenAddress: string]: CurrencyAmount<Token> | undefined } {
  return useTokenBalancesWithLoadingIndicator(selectedChainId, address, tokens)[0];
}

// get the balance for a single token/account combo
export function useTokenBalance(
  selectedChainId: ChainId,
  account?: string,
  token?: Token,
): CurrencyAmount<Token> | undefined {
  const tokenBalances = useTokenBalances(selectedChainId, account, [token]);
  if (!token) return undefined;
  return tokenBalances[token.address];
}

export function useCurrencyBalances(
  selectedChainId: ChainId,
  account?: string,
  currencies?: (Currency | undefined)[],
): (CurrencyAmount<Currency> | undefined)[] {
  const tokens = useMemo(() => {
    return currencies?.filter((currency): currency is Token => currency?.isToken ?? false) ?? [];
  }, [currencies]);
  const natives = useMemo(() => {
    return currencies?.filter((currency): currency is Token => currency?.isNative ?? false) ?? [];
  }, [currencies]);
  const tokenBalances = useTokenBalances(selectedChainId, account, tokens);

  const containsETH: boolean = useMemo(
    () => currencies?.some((currency) => currency?.isNative) ?? false,
    [currencies],
  );
  const ethBalances = useETHBalances(containsETH ? natives : null);

  return useMemo(() => {
    return currencies
      ? currencies.map((currency) => {
          if (!currency) return;
          if (currency.isToken) return tokenBalances[currency.address];
          if (currency.isNative) return ethBalances[currency.chainId];
          return undefined;
        })
      : [];
  }, [currencies, ethBalances, tokenBalances]);
}

export function useCurrencyBalance(
  selectedChainId: ChainId,
  account?: string,
  currency?: Currency,
): CurrencyAmount<Currency> | undefined {
  return useCurrencyBalances(
    selectedChainId,
    account,
    useMemo(() => [currency], [currency]),
  )[0];
}

// mimics useAllBalances
export function useAllTokenBalances(selectedChainId: ChainId): {
  [tokenAddress: string]: CurrencyAmount<Token> | undefined;
} {
  const { account } = useActiveWeb3React();
  const allTokens = useAllTokens(selectedChainId);

  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens]);
  const balances = useTokenBalances(selectedChainId, account ?? undefined, allTokensArray);
  return balances ?? {};
}
