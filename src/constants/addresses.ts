import { ChainId } from '../interfaces/connection-config.interface';

const { XDC_PROD, XDC_TEST, BSC_TEST, BSC_PROD, POLYGON_TEST } = ChainId;

type AddressMap = { [chainId: number]: string };

export const MULTICALL_ADDRESS: AddressMap = {
  [XDC_PROD]: '0x2aE7DcaF1e1AEf5Be1Ef63FCb0E70a519A4b8d7E',
  [XDC_TEST]: '0xdA0541ae853Ec682Edb79E6AB86DB963E3047e7a',
  [BSC_TEST]: '0x7B7b002b3B68935c234d99Abfeca40C6c8B312D1',
  [BSC_PROD]: '0x5dd3ae4bacfdff0022bbf6d04de44ef38287087c',
  [POLYGON_TEST]: '0x54eaaeec692655885de6d33cb1fb07bb8bba0723',
};

export const ATOMX_ADDRESS: AddressMap = {
  [XDC_PROD]: '',
  [XDC_TEST]: '0xf8054a357fb24347643b4341D663c57d77A4d300',
  [BSC_TEST]: '0xDE682b4AAa85171a15dB3fe39817db5f102Af677',
  [BSC_PROD]: '',
  [POLYGON_TEST]: '0xBF6265b4394237b03d1FCbb2e298942c183bfDdB',
};

export const WXDC_ADDRESS: AddressMap = {
  [XDC_PROD]: '',
  [XDC_TEST]: '0x2a5c77b016Df1b3b0AE4E79a68F8adF64Ee741ba',
  [BSC_PROD]: '',
  [BSC_TEST]: '',
  [POLYGON_TEST]: '',
};

export const XSP_ADDRESS: AddressMap = {
  [XDC_PROD]: '',
  [XDC_TEST]: '0xbC4979e749c28F81F22f95B603B350D9Ab0F172A',
  [BSC_PROD]: '',
  [BSC_TEST]: '',
  [POLYGON_TEST]: '',
};

export const XTT_ADDRESS: AddressMap = {
  [XDC_PROD]: '',
  [XDC_TEST]: '0x02E42652b0b85B141B99585C8c2bB17aB305A4c0',
  [BSC_PROD]: '',
  [BSC_TEST]: '',
  [POLYGON_TEST]: '',
};

export const XUSDT_ADDRESS: AddressMap = {
  [XDC_PROD]: '',
  [XDC_TEST]: '0xD4B5f10D61916Bd6E0860144a91Ac658dE8a1437',
  [BSC_PROD]: '',
  [POLYGON_TEST]: '',
};

export const WBNB_ADDRESS: AddressMap = {
  [XDC_PROD]: '',
  [XDC_TEST]: '',
  [BSC_PROD]: '',
  [BSC_TEST]: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
  [POLYGON_TEST]: '',
};

export const TUSD_ADDRESS: AddressMap = {
  [XDC_PROD]: '',
  [XDC_TEST]: '',
  [BSC_PROD]: '',
  [BSC_TEST]: '0x4adc54d7b50bc18b12c940f9e3a63bc44a357989',
  [POLYGON_TEST]: '',
};

export const V2_FACTORY_ADDRESSES: AddressMap = {
  [XDC_PROD]: '',
  [XDC_TEST]: '0xCae66ac135d6489BDF5619Ae8F8f1e724765eb8f',
  [BSC_TEST]: '',
  [BSC_PROD]: '',
  [POLYGON_TEST]: '',
};
