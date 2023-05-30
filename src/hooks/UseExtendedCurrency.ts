import { ExtendedBSC, ExtendedXDC } from '../constants/extended-xdc';
import { ChainId } from '../interfaces/connection-config.interface';

export const useExtendedCurrency = (chainId?: ChainId) => {
  if (!chainId) return null;
  if (chainId === ChainId.XDC_TEST) return ExtendedXDC;
  if (chainId === ChainId.BSC_TEST) return ExtendedBSC;
  return null;
};
