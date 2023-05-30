import { DEFAULT_SELL_CHAIN_ID } from '../constants/chains';
import { ChainId } from '../interfaces/connection-config.interface';

export const getChainedAddress = (address: { [chainId in ChainId]: string }, chainId?: ChainId) => {
  if (chainId) {
    return address[chainId];
  }
  return address[DEFAULT_SELL_CHAIN_ID];
};
