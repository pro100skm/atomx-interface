// a list of tokens by chain
import { Currency, Token } from '@uniswap/sdk-core';
import { ChainId } from '../interfaces/connection-config.interface';
import { ExtendedBSC, ExtendedXDC } from './extended-xdc';
import { TT, TUSD, WETH_EXTENDED, XTT } from './tokens';

type ChainTokenList = {
  readonly [chainId: number]: Token[];
};

type ChainCurrencyList = {
  readonly [chainId: number]: Currency[];
};

const WETH_ONLY: ChainTokenList = Object.fromEntries(
  Object.entries(WETH_EXTENDED).map(([key, value]) => [key, [value]]),
);

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  // [ChainId.XDC_PROD]: [...WETH_ONLY[ChainId.XDC_PROD]],
};
// export const ADDITIONAL_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {
//   [ChainId.BSC_TEST]: {},
// };
/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {
  [ChainId.BSC_TEST]: {},
};

/**
 * Shows up in the currency select for swap and add liquidity
 */
export const COMMON_BASES: ChainCurrencyList = {
  [ChainId.BSC_TEST]: [
    ExtendedBSC.onChain(ChainId.BSC_TEST),
    TUSD[ChainId.BSC_TEST],
    WETH_EXTENDED[ChainId.BSC_TEST],
  ],
  [ChainId.XDC_TEST]: [
    ExtendedXDC.onChain(ChainId.XDC_TEST),
    TT,
    XTT[ChainId.XDC_TEST],
    WETH_EXTENDED[ChainId.XDC_TEST],
  ],
};

// used to construct the list of all pairs we consider by default in the frontend
// export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
//   ...WETH_ONLY,
//   [ChainId.BSC_TEST]: [...WETH_ONLY[ChainId.BSC_TEST]],
// };
// export const PINNED_PAIRS: { readonly [chainId: number]: [Token, Token][] } = {
//   [ChainId.BSC_TEST]: [],
// };
