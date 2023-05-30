import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { CHAIN_INFO } from '../constants/chains';
import { ChainId } from '../interfaces/connection-config.interface';
import { IURLSwapParams } from '../pages/swap/components/types';

interface ISwapChainInfo {
  initiateChainId: ChainId;
  replyChainId: ChainId;
  initiateLibrary: Web3Provider | null;
  replyLibrary: Web3Provider | null;
}

export const useSwapChainInfo = (): ISwapChainInfo => {
  const { search } = useLocation();
  const urlSearchParams = new URLSearchParams(search);
  const initiateChainId = Number(urlSearchParams.get(IURLSwapParams.sellChainId)) as ChainId;
  const replyChainId = Number(urlSearchParams.get(IURLSwapParams.buyChainId)) as ChainId;

  const replyLibrary = useMemo<Web3Provider | null>(() => {
    if (!replyChainId) return null;
    return new ethers.providers.JsonRpcProvider(
      CHAIN_INFO[replyChainId].rpcUrls[0],
    ) as Web3Provider;
  }, [replyChainId]);

  const initiateLibrary = useMemo<Web3Provider | null>(() => {
    if (!initiateChainId) return null;
    return new ethers.providers.JsonRpcProvider(
      CHAIN_INFO[initiateChainId].rpcUrls[0],
    ) as Web3Provider;
  }, [initiateChainId]);

  return {
    replyChainId,
    initiateChainId,
    initiateLibrary,
    replyLibrary,
  };
};
