import { IURLSwapParams } from '../components/types';
import { IDataFromParams } from '../interface/parsed-data.interface';
import { parseChainIdAndToken } from './parseChainIdAndToken';

export const parseParams = (
  params: URLSearchParams,
  callbackOnWrong?: () => void,
): IDataFromParams => {
  const { chainId: sellChainId, token: sellToken } = parseChainIdAndToken(
    params.get(IURLSwapParams.sellChainId),
    params.get(IURLSwapParams.sellToken),
    callbackOnWrong,
  );

  const { chainId: buyChainId, token: buyToken } = parseChainIdAndToken(
    params.get(IURLSwapParams.buyChainId),
    params.get(IURLSwapParams.buyToken),
    callbackOnWrong,
  );

  return {
    sellChainId,
    buyChainId,
    sellToken,
    buyToken,
    sellAmount: params.get(IURLSwapParams.sellAmount) || '',
    buyAmount: params.get(IURLSwapParams.buyAmount) || '',
    sellerAddress: params.get(IURLSwapParams.sellerAddress) || '',
  };
};
