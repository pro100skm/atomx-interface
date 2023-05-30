import { Currency } from '@uniswap/sdk-core';
import { DEFAULT_SELL_CHAIN_ID, NATIVE_CURRENCIES } from '../constants/chains';
import { ChainId } from '../interfaces/connection-config.interface';

export function currencyId(currency: Currency, chainId?: ChainId): string {
  if (currency.isNative) {
    return chainId ? NATIVE_CURRENCIES[chainId] : NATIVE_CURRENCIES[DEFAULT_SELL_CHAIN_ID];
  }
  if (currency.isToken) return currency.address;
  throw new Error('invalid currency');
}
