import { Token } from '@uniswap/sdk-core';
import { shade } from 'polished';
import { useLayoutEffect, useState } from 'react';
import { WrappedTokenInfo } from '../store/lists/wrappedTokenInfo';
import { getTokenLogoURL } from '../utils/getTokenLink';
import uriToHttp from '../utils/uriToHttp';
import { hex } from 'wcag-contrast';
import Vibrant from 'node-vibrant/lib/bundle';

async function getColorFromToken(token: Token): Promise<string | null> {
  if (!(token instanceof WrappedTokenInfo)) {
    return null;
  }

  const wrappedToken = token as WrappedTokenInfo;
  const { address } = wrappedToken;
  let { logoURI } = wrappedToken;
  if (!logoURI) {
    // if (token.chainId !== SupportedChainId.MAINNET) {
    //   return null;
    // } else {
    logoURI = getTokenLogoURL(address);
    // }
  }

  try {
    return await getColorFromUriPath(logoURI);
  } catch (e) {
    if (logoURI === getTokenLogoURL(address)) {
      return null;
    }

    try {
      logoURI = getTokenLogoURL(address);
      return await getColorFromUriPath(logoURI);
    } catch (e) {
      console.error(e);
    }
  }

  return null;
}

async function getColorFromUriPath(uri: string): Promise<string | null> {
  const formattedPath = uriToHttp(uri)[0];

  const palette = await Vibrant.from(formattedPath).getPalette();
  if (!palette?.Vibrant) {
    return null;
  }

  let detectedHex = palette.Vibrant.hex;
  let AAscore = hex(detectedHex, '#FFF');
  while (AAscore < 3) {
    detectedHex = shade(0.005, detectedHex);
    AAscore = hex(detectedHex, '#FFF');
  }

  return detectedHex;
}

export function useColor(token?: Token) {
  const [color, setColor] = useState('#2172E5');

  useLayoutEffect(() => {
    let stale = false;

    if (token) {
      getColorFromToken(token).then((tokenColor) => {
        if (!stale && tokenColor !== null) {
          setColor(tokenColor);
        }
      });
    }

    return () => {
      stale = true;
      setColor('#2172E5');
    };
  }, [token]);

  return color;
}

export function useListColor(listImageUri?: string) {
  const [color, setColor] = useState('#2172E5');

  useLayoutEffect(() => {
    let stale = false;

    if (listImageUri) {
      getColorFromUriPath(listImageUri).then((color) => {
        if (!stale && color !== null) {
          setColor(color);
        }
      });
    }

    return () => {
      stale = true;
      setColor('#2172E5');
    };
  }, [listImageUri]);

  return color;
}
