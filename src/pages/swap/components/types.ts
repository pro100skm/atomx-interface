import { BigNumber } from 'ethers';
import { ChainId } from '../../../interfaces/connection-config.interface';
import { BIG_ZERO } from '../../../utils/bigNumber';

export enum IInputStatus {
  EMPTY = 'EMPTY',
  INVALID = 'INVALID',
  WARNING = 'WARNING',
  VALID = 'VALID',
}

export interface CreateSwapData {
  sellToken: string;
  sellAmount: string; //number
  timestamp: number;
  sellerAddress: string;
  publicHash: string;
  buyToken: string;
  buyAmount: string;
  buyChainId: ChainId | null;
}

export enum IURLSwapParams {
  sellChainId = 'sellChainId',
  sellToken = 'sellToken',
  sellAmount = 'sellAmount',
  sellerAddress = 'sellerAddress',
  buyToken = 'buyToken',
  buyAmount = 'buyAmount',
  buyChainId = 'buyChainId',
}

export interface CreatedSwapData extends CreateSwapData {
  sender: string;
  secret: string;
}

export interface CreateDataStatus {
  sellToken: IInputStatus;
  sellAmount: IInputStatus; //number
  timestamp: IInputStatus;
  sellerAddress: IInputStatus;
  publicHash: IInputStatus;
  buyToken: IInputStatus;
  buyAmount: IInputStatus;
  buyChainId: IInputStatus;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  balance: BigNumber;
  allowance: BigNumber;
}

export const initialTokenInfo: TokenInfo = {
  name: '',
  symbol: '',
  decimals: 18,
  balance: BIG_ZERO,
  allowance: BIG_ZERO,
};
