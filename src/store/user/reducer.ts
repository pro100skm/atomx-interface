import { createReducer } from '@reduxjs/toolkit';
import { DEFAULT_DEADLINE_FROM_NOW } from '../../constants/misc';
import { ConnectorNames } from '../../utils/web3React';
import { updateVersion } from '../transactions/actions';
import {
  addSerializedToken,
  removeSerializedToken,
  SerializedToken,
  updateMatchesDarkMode,
  updateSelectedWallet,
} from './actions';

const currentTimestamp = () => new Date().getTime();

export interface UserState {
  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number;

  matchesDarkMode: boolean; // whether the dark mode media query matches

  userDarkMode: boolean | null; // the user's choice for dark mode or light mode

  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number | 'auto';
  userSlippageToleranceHasBeenMigratedToAuto: boolean; // temporary flag for migration status

  // deadline set by user in minutes, used in all txns
  userDeadline: number;

  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken;
    };
  };

  timestamp: number;
  selectedWallet?: ConnectorNames | null;
}

export const initialState: UserState = {
  matchesDarkMode: false,
  userDarkMode: null,
  userSlippageTolerance: 'auto',
  userSlippageToleranceHasBeenMigratedToAuto: true,
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  tokens: {},
  timestamp: currentTimestamp(),
  selectedWallet: null,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateVersion, (state) => {
      // slippage isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (
        typeof state.userSlippageTolerance !== 'number' ||
        !Number.isInteger(state.userSlippageTolerance) ||
        state.userSlippageTolerance < 0 ||
        state.userSlippageTolerance > 5000
      ) {
        state.userSlippageTolerance = 'auto';
      } else {
        if (
          !state.userSlippageToleranceHasBeenMigratedToAuto &&
          [10, 50, 100].indexOf(state.userSlippageTolerance) !== -1
        ) {
          state.userSlippageTolerance = 'auto';
          state.userSlippageToleranceHasBeenMigratedToAuto = true;
        }
      }

      // deadline isnt being tracked in local storage, reset to default
      // noinspection SuspiciousTypeOfGuard
      if (
        typeof state.userDeadline !== 'number' ||
        !Number.isInteger(state.userDeadline) ||
        state.userDeadline < 60 ||
        state.userDeadline > 180 * 60
      ) {
        state.userDeadline = DEFAULT_DEADLINE_FROM_NOW;
      }

      state.lastUpdateVersionTimestamp = currentTimestamp();
    })
    .addCase(updateMatchesDarkMode, (state, action) => {
      state.matchesDarkMode = action.payload.matchesDarkMode;
      state.timestamp = currentTimestamp();
    })
    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      if (!state.tokens) {
        state.tokens = {};
      }
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] || {};
      state.tokens[serializedToken.chainId][serializedToken.address] = serializedToken;
      state.timestamp = currentTimestamp();
    })
    .addCase(removeSerializedToken, (state, { payload: { address, chainId } }) => {
      if (!state.tokens) {
        state.tokens = {};
      }
      state.tokens[chainId] = state.tokens[chainId] || {};
      delete state.tokens[chainId][address];
      state.timestamp = currentTimestamp();
    })
    .addCase(updateSelectedWallet, (state, { payload: { wallet } }) => {
      state.selectedWallet = wallet;
    }),
);
