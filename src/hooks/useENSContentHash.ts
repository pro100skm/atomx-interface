import { useMemo } from 'react';
import { useSingleCallResult } from '../store/multicall/hooks';
import isZero from '../utils/isZero';
import { safeNamehash } from '../utils/safeNamehash';
import { useENSResolverContract } from './useContract';

/**
 * Does a lookup for an ENS name to find its contenthash.
 */
export default function useENSContentHash(ensName?: string | null): {
  loading: boolean;
  contenthash: string | null;
} {
  const ensNodeArgument = useMemo(
    () => [ensName === null ? undefined : safeNamehash(ensName)],
    [ensName],
  );
  const registrarContract = null;
  const resolverAddressResult = useSingleCallResult(registrarContract, 'resolver', ensNodeArgument);
  const resolverAddress = resolverAddressResult.result?.[0];
  const resolverContract = useENSResolverContract(
    resolverAddress && isZero(resolverAddress) ? undefined : resolverAddress,
  );
  const contenthash = useSingleCallResult(resolverContract, 'contenthash', ensNodeArgument);

  return useMemo(
    () => ({
      contenthash: contenthash.result?.[0] ?? null,
      loading: resolverAddressResult.loading || contenthash.loading,
    }),
    [contenthash.loading, contenthash.result, resolverAddressResult.loading],
  );
}
