import { Currency, Token } from '@uniswap/sdk-core';
import { useState } from 'react';
import { DEFAULT_SELL_CHAIN_ID } from '../constants/chains';
import { ChainId } from '../interfaces/connection-config.interface';
import { getTokenLogoURL } from '../utils/getTokenLink';
import { registerToken } from '../utils/wallet';
import { useLibrary } from './useLibrary';

export default function useAddTokenToMetamask(currencyToAdd: Currency | undefined): {
  addToken: () => void;
  success: boolean | undefined;
} {
  const selectedLibrary =
    useLibrary()[(currencyToAdd?.chainId as ChainId) || DEFAULT_SELL_CHAIN_ID];

  const token: Token | undefined = currencyToAdd?.wrapped;

  const [success, setSuccess] = useState<boolean | undefined>();

  function addToken() {
    if (
      !selectedLibrary ||
      // !selectedLibrary.provider.isMetaMask ||
      !selectedLibrary.provider.request ||
      !token
    ) {
      setSuccess(false);
      return;
    }
    registerToken(token.address, token.symbol || '', token.decimals, getTokenLogoURL(token.address))
      .then(() => setSuccess(true))
      .catch((e) => {
        setSuccess(false);
        console.error(e);
      });
  }

  return { addToken, success };
}
