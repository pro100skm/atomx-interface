import { Web3Provider } from '@ethersproject/providers';
import { useMemo } from 'react';
import { network } from '../constants/connectors';
import { ChainId } from '../interfaces/connection-config.interface';
import { ExternalProvider } from '@ethersproject/providers/src.ts/web3-provider';
import { XDCWeb3Provider } from './useActiveWeb3React';

export function useLibrary(): { [key in ChainId]: Web3Provider | null } {
  const xdcTestLibrary = useMemo<Web3Provider | null>(() => {
    if (!window.ethereum) return null;
    return new XDCWeb3Provider(network.providers[ChainId.XDC_TEST] as unknown as ExternalProvider);
  }, []);

  const bscTestLibrary = useMemo<Web3Provider | null>(() => {
    if (!window.ethereum) return null;
    return new XDCWeb3Provider(network.providers[ChainId.BSC_TEST] as unknown as ExternalProvider);
  }, []);

  //@ts-ignore
  return {
    [ChainId.XDC_TEST]: xdcTestLibrary,
    [ChainId.BSC_TEST]: bscTestLibrary,
  };
}
