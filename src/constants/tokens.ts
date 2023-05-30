import { Token } from '@uniswap/sdk-core';
import { ChainId } from '../interfaces/connection-config.interface';

import {
  TUSD_ADDRESS,
  WBNB_ADDRESS,
  WXDC_ADDRESS,
  XSP_ADDRESS,
  XTT_ADDRESS,
  XUSDT_ADDRESS,
} from './addresses';

const { XDC_TEST, BSC_TEST } = ChainId;
export const TT = new Token(
  XDC_TEST,
  '0xFdCf8bD44EC46a71a13f00F4328F6b65adc8BCf9',
  18,
  'TT',
  'Test Token',
);

export const XT = new Token(
  XDC_TEST,
  '0xc33BfDD2211dD9A61355B08dc19A68d0e3816f65',
  18,
  'XT',
  'XTest',
);

export const XSP: { [chainId: number]: Token } = {
  [XDC_TEST]: new Token(XDC_TEST, XSP_ADDRESS[XDC_TEST], 18, 'TXSP', 'XSwapProtocol'),
};

export const XTT: { [chainId: number]: Token } = {
  [XDC_TEST]: new Token(XDC_TEST, XTT_ADDRESS[XDC_TEST], 18, 'XTT', 'XSwap Treasury Token'),
};

export const XUSDT: { [chainId: number]: Token } = {
  [XDC_TEST]: new Token(XDC_TEST, XUSDT_ADDRESS[XDC_TEST], 6, 'xUSDT', 'Bridged USDT'),
};

export const TUSD: { [chainId: number]: Token } = {
  [BSC_TEST]: new Token(BSC_TEST, TUSD_ADDRESS[BSC_TEST], 6, 'tUSDT', 'Uniwhale USD'),
};

export const WXDC_CONFIG: {
  [chainId: number]: {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    name: string;
  };
} = {
  [XDC_TEST]: {
    chainId: XDC_TEST,
    address: WXDC_ADDRESS[XDC_TEST],
    decimals: 18,
    symbol: 'WXDC',
    name: 'Wrapped XDC',
  },
};

export const WBNB_CONFIG: {
  [chainId: number]: {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    name: string;
  };
} = {
  [BSC_TEST]: {
    chainId: BSC_TEST,
    address: WBNB_ADDRESS[BSC_TEST],
    decimals: 18,
    symbol: 'WBNB',
    name: 'Wrapped BNB',
  },
};

export const WETH_EXTENDED: { [chainId: number]: Token } = {
  [XDC_TEST]: new Token(
    WXDC_CONFIG[XDC_TEST].chainId,
    WXDC_CONFIG[XDC_TEST].address,
    WXDC_CONFIG[XDC_TEST].decimals,
    WXDC_CONFIG[XDC_TEST].symbol,
    WXDC_CONFIG[XDC_TEST].name,
  ),
  [BSC_TEST]: new Token(
    WBNB_CONFIG[BSC_TEST].chainId,
    WBNB_CONFIG[BSC_TEST].address,
    WBNB_CONFIG[BSC_TEST].decimals,
    WBNB_CONFIG[BSC_TEST].symbol,
    WBNB_CONFIG[BSC_TEST].name,
  ),
};
