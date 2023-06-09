import { Currency } from '@uniswap/sdk-core';
import React, { useMemo } from 'react';
import styled from 'styled-components/macro';
import { CHAIN_INFO, DEFAULT_SELL_CHAIN_ID } from '../../../constants/chains';
import useHttpLocations from '../../../hooks/useHttpLocations';
import { WrappedTokenInfo } from '../../../store/lists/wrappedTokenInfo';
import { getTokenLogoURL } from '../../../utils/getTokenLink';
import Logo from '../Logo';

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background: radial-gradient(white 50%, #ffffff00 calc(75% + 1px), #ffffff00 100%);

  border-radius: 50%;
  -mox-box-shadow: 0 0 1px white;
  -webkit-box-shadow: 0 0 1px white;
  box-shadow: 0 0 1px white;
  border: 0 solid rgba(255, 255, 255, 0);
`;

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background: radial-gradient(white 50%, #ffffff00 calc(75% + 1px), #ffffff00 100%);
  border-radius: 50%;
  -mox-box-shadow: 0 0 1px black;
  -webkit-box-shadow: 0 0 1px black;
  box-shadow: 0 0 1px black;
  border: 0 solid rgba(255, 255, 255, 0);
`;

export default function CurrencyLogo({
  currency,
  size = '24px',
  style,
  ...rest
}: {
  currency?: Currency | null;
  size?: string;
  style?: React.CSSProperties;
}) {
  const uriLocations = useHttpLocations(
    currency instanceof WrappedTokenInfo ? currency.logoURI : undefined,
  );

  const srcs: string[] = useMemo(() => {
    if (!currency || currency.isNative) return [];

    if (currency.isToken) {
      const defaultUrls = [];
      const url = getTokenLogoURL(currency.address);
      if (url) {
        defaultUrls.push(url);
      }
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, ...defaultUrls];
      }
      return defaultUrls;
    }
    return [];
  }, [currency, uriLocations]);

  const { logoUrl } = CHAIN_INFO[currency?.chainId ?? DEFAULT_SELL_CHAIN_ID];
  if (currency?.isNative) {
    return <StyledEthereumLogo src={logoUrl} alt='xdc logo' size={size} style={style} {...rest} />;
  }

  return (
    <StyledLogo
      size={size}
      srcs={srcs}
      alt={`${currency?.symbol ?? 'token'} logo`}
      style={style}
      {...rest}
    />
  );
}
