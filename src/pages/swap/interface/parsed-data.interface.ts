import { ChainId } from '../../../interfaces/connection-config.interface';

export interface IDataFromParams {
  sellChainId: ChainId;
  buyChainId: ChainId;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  sellerAddress: string;
}
