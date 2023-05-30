import { ChainId } from '../interfaces/connection-config.interface';
import { TOKEN_LIST_REPO } from './chains';

export const UNSUPPORTED_LIST_URLS: string[] = [];

const LIST_XDC_TESTNET = `${TOKEN_LIST_REPO[ChainId.XDC_TEST]}/testnet.tokenlist.json`;
const LIST_BSC_TESTNET = `${TOKEN_LIST_REPO[ChainId.BSC_TEST]}/testnet.tokenlist.json`;

const DEFAULT_LIST_OF_LISTS_TO_DISPLAY: string[] = [LIST_BSC_TESTNET, LIST_XDC_TESTNET];

export const DEFAULT_LIST_OF_LISTS: string[] = [
  ...DEFAULT_LIST_OF_LISTS_TO_DISPLAY,
  ...UNSUPPORTED_LIST_URLS, // need to load dynamic unsupported tokens as well
];
// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [LIST_BSC_TESTNET, LIST_XDC_TESTNET];
