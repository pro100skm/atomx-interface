import { Percent, Token } from '@uniswap/sdk-core';
import { useCallback, useMemo } from 'react';
import { AppState, useAppDispatch, useAppSelector } from '../index';
import { addSerializedToken, removeSerializedToken, SerializedToken } from './actions';
import { useSelector } from 'react-redux';
import { ConnectorNames } from '../../utils/web3React';
import { ChainId } from '../../interfaces/connection-config.interface';

function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  };
}

function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  );
}

/**
 * Return the user's slippage tolerance, from the redux store, and a function to update the slippage tolerance
 */
export function useUserSlippageTolerance(): Percent | 'auto' {
  const userSlippageTolerance = useAppSelector((state) => {
    return state.user.userSlippageTolerance;
  });
  return useMemo(() => {
    return userSlippageTolerance === 'auto' ? 'auto' : new Percent(userSlippageTolerance, 10_000);
  }, [userSlippageTolerance]);
}

/**
 * Same as above but replaces the auto with a default value
 * @param defaultSlippageTolerance the default value to replace auto with
 */
export function useUserSlippageToleranceWithDefault(defaultSlippageTolerance: Percent): Percent {
  const allowedSlippage = useUserSlippageTolerance();
  return useMemo(
    () => (allowedSlippage === 'auto' ? defaultSlippageTolerance : allowedSlippage),
    [allowedSlippage, defaultSlippageTolerance],
  );
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }));
    },
    [dispatch],
  );
}

export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }));
    },
    [dispatch],
  );
}

export function useUserAddedTokens(selectedChainId: ChainId): Token[] {
  const serializedTokensMap = useAppSelector(({ user: { tokens } }) => tokens);

  return useMemo(() => {
    if (!selectedChainId) return [];
    return Object.values(serializedTokensMap?.[selectedChainId] ?? {}).map(deserializeToken);
  }, [serializedTokensMap, selectedChainId]);
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */

export const useSelectedWallet = (): ConnectorNames | null | undefined => {
  return useSelector((state: AppState) => state.user.selectedWallet);
};
