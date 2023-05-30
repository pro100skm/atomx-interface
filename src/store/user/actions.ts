import { createAction } from '@reduxjs/toolkit';
import { ConnectorNames } from '../../utils/web3React';

export interface SerializedToken {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
}

export interface SerializedPair {
  token0: SerializedToken;
  token1: SerializedToken;
}

export const updateSelectedWallet = createAction<{ wallet: ConnectorNames | null }>(
  'user/updateSelectedWallet',
);

export const updateMatchesDarkMode = createAction<{ matchesDarkMode: boolean }>(
  'user/updateMatchesDarkMode',
);

export const addSerializedToken = createAction<{ serializedToken: SerializedToken }>(
  'user/addSerializedToken',
);
export const removeSerializedToken = createAction<{ chainId: number; address: string }>(
  'user/removeSerializedToken',
);
