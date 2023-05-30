import { Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { useCallback, useMemo } from 'react';
import { AtomxER20, EnsPublicResolver, Erc20, Multicall } from '../constants/abis/types';
import { getContract } from '../utils/contract';
import useActiveWeb3React from './useActiveWeb3React';
import { useConnectionConfig } from './useConnectionConfig';
import useDebounce from './useDebounce';
import ERC20_ABI from '../constants/abis/erc20.json';
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json';
import ERC20_BYTES32_ABI from '../constants/abis/erc20_bytes32.json';

export function useContract<T = Contract>(
  getContractFunction: (library: Web3Provider, account?: string) => T,
): T | null {
  const { account, chainId, library } = useActiveWeb3React();

  return useDebounce(
    useMemo((): T | null => {
      if (!library || !chainId) {
        return null;
      }
      const contract: T | null = getContractFunction(library, account || undefined);
      if (!contract) {
        return null;
      }

      return contract;
    }, [getContractFunction, account, chainId, library]),
    100,
  );
}

export function useMulticallContract(): Multicall | null {
  const { multicall } = useConnectionConfig();
  const multi = useCallback(
    (library: Web3Provider, account?: string) => {
      return getContract(multicall.address, multicall.abi, library, account) as Multicall;
    },
    [multicall],
  );
  return useContract<Multicall>(multi);
}

export function useAtomxContract(): AtomxER20 | null {
  const { atomx } = useConnectionConfig();
  const atom = useCallback(
    (library: Web3Provider, account?: string) => {
      return getContract(atomx.address, atomx.abi, library, account) as AtomxER20;
    },
    [atomx],
  );
  return useContract<AtomxER20>(atom);
}

export function useTokenContract(tokenAddress?: string): Erc20 | null {
  const token = useCallback(
    (library: Web3Provider, account?: string) => {
      if (!tokenAddress) return null;
      return getContract(tokenAddress, ERC20_ABI, library, account) as Erc20;
    },
    [tokenAddress],
  );
  return useContract<Erc20 | null>(token);
}

export function useBytes32TokenContract(tokenAddress?: string): Contract | null {
  const bytes32 = useCallback(
    (library: Web3Provider, account?: string) => {
      if (!tokenAddress) return null;
      return getContract(tokenAddress, ERC20_BYTES32_ABI, library, account) as Contract;
    },
    [tokenAddress],
  );
  return useContract<Contract | null>(bytes32);
}

export function useENSResolverContract(address: string | undefined): EnsPublicResolver | null {
  const ensResolver = useCallback(
    (library: Web3Provider, account?: string) => {
      if (!address) return null;
      return getContract(address, ENS_PUBLIC_RESOLVER_ABI, library, account) as EnsPublicResolver;
    },
    [address],
  );
  return useContract<EnsPublicResolver | null>(ensResolver);
}
