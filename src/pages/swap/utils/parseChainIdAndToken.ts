import { ChainId } from '../../../interfaces/connection-config.interface';
import { ALL_SUPPORTED_CHAIN_IDS, DEFAULT_SELL_CHAIN_ID } from '../../../constants/chains';

export const parseChainIdAndToken = (
  chainId: string | null,
  token: string | null,
  callbackOnWrong?: () => void,
  defaultChainId?: ChainId,
): { chainId: number; token: string } => {
  let parsedChainId = Number(chainId);
  let parsedToken = token || '';
  if (!parsedChainId || !ALL_SUPPORTED_CHAIN_IDS.includes(parsedChainId)) {
    if (parsedChainId && callbackOnWrong) {
      callbackOnWrong();
    }
    parsedChainId = defaultChainId || DEFAULT_SELL_CHAIN_ID;
    parsedToken = '';
  }

  return {
    chainId: parsedChainId,
    token: parsedToken,
  };
};
