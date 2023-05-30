import { Currency } from '@uniswap/sdk-core';
import styled from 'styled-components/macro';
import { DEFAULT_SELL_CHAIN_ID, WRAPPED_CURRENCIES } from '../../constants/chains';
import useActiveWeb3React from '../../hooks/useActiveWeb3React';
import { ChainId } from '../../interfaces/connection-config.interface';
import { AddToMetamaskButton } from '../Common/IconButtons/AddToMetamaskButton';
import { CopyToClipboardButton } from '../Common/IconButtons/CopyToClipboardButton';

const AddCurrencyButtonsListWrapper = styled.div`
  display: inline-flex;

  margin-left: 1rem;
  gap: 0.5rem;

  align-items: center;

  opacity: 0;
  transition: opacity 0.3s;
`;

type AddCurrencyButtonsListProps = {
  currency: Currency;
  className: string;
  size: string;
};

export function AddCurrencyButtonsList({
  currency,
  size = '1rem',
  className,
}: AddCurrencyButtonsListProps) {
  const { account } = useActiveWeb3React();
  const isMetamask = !!window.ethereum?.isMetaMask;
  return (
    <AddCurrencyButtonsListWrapper className={className}>
      {isMetamask && account && (
        <AddToMetamaskButton currency={currency} stopPropogation size={size} />
      )}
      <CopyToClipboardButton
        copyText={
          currency.isToken
            ? currency.address
            : WRAPPED_CURRENCIES[(currency.chainId as ChainId) ?? DEFAULT_SELL_CHAIN_ID]
        }
        stopPropogation
        size={size}
      />
    </AddCurrencyButtonsListWrapper>
  );
}
