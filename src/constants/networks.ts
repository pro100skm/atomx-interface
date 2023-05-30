import { ChainId } from '../interfaces/connection-config.interface';
import { CHAIN_INFO, DEFAULT_SELL_CHAIN_ID } from './chains';

export const getChainSymbol = (chainId: number | undefined) =>
  chainId
    ? CHAIN_INFO[chainId as ChainId].nativeCurrency.symbol
    : CHAIN_INFO[DEFAULT_SELL_CHAIN_ID].nativeCurrency.symbol;
