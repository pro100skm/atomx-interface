import { arrayify } from '@ethersproject/bytes';
import { parseBytes32String } from '@ethersproject/strings';
import { Currency, Token } from '@uniswap/sdk-core';
import { useEffect, useMemo, useState } from 'react';
import { createTokenFilterFunction } from '../components/SearchModal/filtering';
import { ALL_NATIVE_CURRENCIES, DEFAULT_SELL_CHAIN_ID } from '../constants/chains';
import { WETH_EXTENDED } from '../constants/tokens';
import { ChainId, NativeCurrencies } from '../interfaces/connection-config.interface';
import {
  TokenAddressMap,
  useAllLists,
  useCombinedActiveList,
  useInactiveListUrls,
  useUnsupportedTokenList,
} from '../store/lists/hooks';
import { WrappedTokenInfo } from '../store/lists/wrappedTokenInfo';
import { useUserAddedTokens } from '../store/user/hooks';
import { isAddress } from '../utils';
import { multicall } from '../utils/multicall';
import { useExtendedCurrency } from './UseExtendedCurrency';
import { useLibrary } from './useLibrary';
import ERC20_BYTES32_ABI from '../constants/abis/erc20_bytes32.json';

import { multicallToken } from '../utils/multicallToken';

// reduce token map into standard address <-> Token mapping, optionally include user added tokens
function useTokensFromMap(
  tokenMap: TokenAddressMap,
  includeUserAdded: boolean,
  selectedChainId: ChainId,
): { [address: string]: Token } {
  const userAddedTokens = useUserAddedTokens(selectedChainId as ChainId);

  return useMemo(() => {
    // reduce to just tokens
    const mapWithoutUrls = Object.keys(tokenMap[selectedChainId] ?? {}).reduce<{
      [address: string]: Token;
    }>((newMap, address) => {
      newMap[address] = tokenMap[selectedChainId][address].token;
      return newMap;
    }, {});

    if (includeUserAdded) {
      return (
        userAddedTokens
          // reduce into all ALL_TOKENS filtered by the current chain
          .reduce<{ [address: string]: Token }>(
            (tokenMap, token) => {
              tokenMap[token.address] = token;
              return tokenMap;
            },
            // must make a copy because reduce modifies the map, and we do not
            // want to make a copy in every iteration
            { ...mapWithoutUrls },
          )
      );
    }

    return mapWithoutUrls;
  }, [selectedChainId, userAddedTokens, tokenMap, includeUserAdded]);
}

export function useAllTokens(chainId: ChainId): { [address: string]: Token } {
  const allTokens = useCombinedActiveList();

  return useTokensFromMap(allTokens, true, chainId);
}

export function useUnsupportedTokens(selectedChainId: ChainId): { [address: string]: Token } {
  const unsupportedTokensMap = useUnsupportedTokenList();
  const unsupportedTokens = useTokensFromMap(unsupportedTokensMap, false, selectedChainId);
  return { ...unsupportedTokens };
}

export function useSearchInactiveTokenLists(
  search: string | undefined,
  selectedChainId: ChainId,
  minResults = 10,
): WrappedTokenInfo[] {
  const lists = useAllLists();
  const inactiveUrls = useInactiveListUrls();
  const activeTokens = useAllTokens(selectedChainId);
  return useMemo(() => {
    if (!search || search.trim().length === 0) return [];

    const tokenFilter = createTokenFilterFunction(search);
    const result: WrappedTokenInfo[] = [];
    const addressSet: { [address: string]: true } = {};
    for (const url of inactiveUrls) {
      const list = lists[url].current;
      if (!list) continue;
      for (const tokenInfo of list.tokens) {
        if (tokenInfo.chainId === selectedChainId && tokenFilter(tokenInfo)) {
          const wrapped: WrappedTokenInfo = new WrappedTokenInfo(tokenInfo, list);
          if (!(wrapped.address in activeTokens) && !addressSet[wrapped.address]) {
            addressSet[wrapped.address] = true;
            result.push(wrapped);
            if (result.length >= minResults) return result;
          }
        }
      }
    }
    return result;
  }, [activeTokens, selectedChainId, inactiveUrls, lists, minResults, search]);
}

export function useIsTokenActive(
  token: Token | undefined | null,
  selectedChainId: ChainId,
): boolean {
  const activeTokens = useAllTokens(selectedChainId);

  if (!activeTokens || !token) {
    return false;
  }

  return !!activeTokens[token.address];
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(
  currency: Currency | undefined | null,
  selectedChainId: ChainId,
): boolean {
  const userAddedTokens = useUserAddedTokens(selectedChainId);

  if (!currency) {
    return false;
  }

  return !!userAddedTokens.find((token) => currency.equals(token));
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;

function parseStringOrBytes32(
  str: string | undefined,
  bytes32: string | undefined,
  defaultValue: string,
): string {
  return str && str.length > 0
    ? str
    : // need to check for proper bytes string and valid terminator
    bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
    ? parseBytes32String(bytes32)
    : defaultValue;
}

// undefined if invalid or does not exist
// null if loading or null was passed
// otherwise returns the token
export function useToken(
  selectedChainId: ChainId,
  tokenAddress?: string | null,
): Token | undefined | null {
  const tokens = useAllTokens(selectedChainId);
  const address = isAddress(tokenAddress);
  const token: Token | undefined = address ? tokens[address] : undefined;
  const selectedLibrary = useLibrary()[selectedChainId];
  const [tokenData, setTokenData] = useState<undefined | null | Token>(undefined);

  useEffect(() => {
    if (!selectedLibrary || !address) return;
    if (token) return setTokenData(token);
    if (tokenData?.address === address) return;
    Promise.all([
      multicallToken(selectedLibrary, selectedChainId, address),
      multicall(
        ERC20_BYTES32_ABI,
        [
          {
            address: address,
            name: 'name',
            params: [],
          },
          {
            address: address,
            name: 'symbol',
            params: [],
          },
        ],
        selectedLibrary,
        selectedChainId,
      ),
    ]).then(([{ name, symbol, decimals }, [[nameBytes32], [symbolBytes32]]]) => {
      setTokenData(
        new Token(
          selectedChainId,
          address,
          decimals,
          parseStringOrBytes32(symbol, symbolBytes32, 'UNKNOWN'),
          parseStringOrBytes32(name, nameBytes32, 'Unknown Token'),
        ),
      );
    });
  }, [selectedLibrary, address, selectedChainId]);

  return tokenData;
}

export function useCurrency(
  currencyId: string | null | undefined,
  selectedChainId: ChainId,
): Currency | null | undefined {
  const ExtendedCurrency = useExtendedCurrency(selectedChainId);

  const isNativeCurrency = currencyId
    ? ALL_NATIVE_CURRENCIES.includes(currencyId.toUpperCase() as NativeCurrencies)
    : false;

  const token = useToken(selectedChainId, isNativeCurrency ? undefined : currencyId);
  const extendedEther = useMemo(() => {
    if (!ExtendedCurrency) return null;
    return selectedChainId
      ? ExtendedCurrency.onChain(selectedChainId)
      : ExtendedCurrency.onChain(DEFAULT_SELL_CHAIN_ID);
  }, [selectedChainId, ExtendedCurrency, currencyId]);

  const weth = selectedChainId ? WETH_EXTENDED[selectedChainId] : undefined;
  if (currencyId === null || currencyId === undefined) {
    return currencyId;
  }
  if (weth?.address?.toUpperCase() === currencyId?.toUpperCase()) {
    return weth;
  }
  return isNativeCurrency ? extendedEther : token;
}
