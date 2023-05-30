import { Currency } from '@uniswap/sdk-core';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Pair } from '../../../classes/Pair';
import { ButtonGray } from '../../../components/Common/Button';
import {
  Aligner,
  StyledDropDown,
  StyledTokenName,
} from '../../../components/Common/CurrencyInputPanel';
import CurrencyLogo from '../../../components/Common/CurrencyLogo';
import DoubleCurrencyLogo from '../../../components/Common/DoubleLogo';
import { Flex } from '../../../components/Common/Flex';
import Select from '../../../components/Common/Inputs/Select';
import { Span } from '../../../components/Common/Span';
import { RowFixed } from '../../../components/Row';
import CurrencySearchModal from '../../../components/SearchModal/CurrencySearchModal';
import { ALL_SUPPORTED_CHAIN_IDS, CHAIN_INFO } from '../../../constants/chains';
import { ChainId } from '../../../interfaces/connection-config.interface';
import { IURLSwapParams } from '../components/types';

const CurrencySelect = styled(ButtonGray)<{
  visible: boolean;
  selected: boolean;
  hideInput?: boolean;
}>`
  align-items: center;
  background-color: ${({ theme }) => theme.bg2};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  cursor: pointer;
  border-radius: 13px;
  outline: none;
  user-select: none;
  /* border: none; */
  font-size: 20px;
  font-weight: 500;
  height: 2rem;
  width: 100%;
  padding: 0 8px;
  justify-content: space-between;
  margin-left: 0;
  :focus,
  :hover {
    background-color: ${({ theme }) => theme.bg3};
    visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  }
`;

interface IFilterSwapsProps {
  onCurrencySelect?: (currency: Currency) => void;
  currency?: Currency | null;
  pair?: Pair | null;
  otherCurrency?: Currency | null;
  tokenType: any;
  selectedChainId: ChainId;
}

const FilterSwaps = ({
  onCurrencySelect,
  currency,
  otherCurrency,
  pair = null,
  tokenType,
  selectedChainId,
}: IFilterSwapsProps) => {
  const navigate = useNavigate();
  const urlSearchParams = new URLSearchParams(window.location.search);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  const handleSetParams = (key: string, value: string | ChainId) => {
    urlSearchParams.set(key, String(value));
    navigate(`${window.location.pathname}?${urlSearchParams.toString()}`, { replace: true });
  };

  const chainIdType =
    Number(urlSearchParams.get(IURLSwapParams.buyChainId)) === selectedChainId
      ? IURLSwapParams.sellChainId
      : IURLSwapParams.buyChainId;

  return (
    <>
      <Flex flexDirection='column' align='flex-start' gap='0.5rem' width='auto'>
        <Select
          width='100%'
          value={selectedChainId}
          change={(v) => {
            console.log(chainIdType);

            handleSetParams(chainIdType, v);
          }}
          options={ALL_SUPPORTED_CHAIN_IDS.map((id) => ({
            label: CHAIN_INFO[id].label,
            value: id,
          }))}
        />
        <CurrencySelect
          visible={currency !== undefined}
          selected={!!currency}
          className='open-currency-select-button'
          onClick={() => {
            if (onCurrencySelect) {
              setModalOpen(true);
            }
          }}
        >
          <Aligner>
            <RowFixed>
              {pair ? (
                <span style={{ marginRight: '0.5rem' }}>
                  <DoubleCurrencyLogo
                    currency0={pair.token0}
                    currency1={pair.token1}
                    size={24}
                    margin={true}
                  />
                </span>
              ) : currency ? (
                <CurrencyLogo style={{ marginRight: '0.5rem' }} currency={currency} size={'24px'} />
              ) : null}
              {pair ? (
                <StyledTokenName className='pair-name-container'>
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </StyledTokenName>
              ) : (
                <StyledTokenName
                  className='token-symbol-container'
                  active={Boolean(currency && currency.symbol)}
                >
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? currency.symbol.slice(0, 4) +
                      '...' +
                      currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                    : currency?.symbol) || <Span whiteSpace='nowrap'>Select a token</Span>}
                </StyledTokenName>
              )}
            </RowFixed>
            {onCurrencySelect && <StyledDropDown selected={!!currency} />}
          </Aligner>
        </CurrencySelect>
      </Flex>
      {onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={true}
          tokenType={tokenType}
          selectedChainId={selectedChainId}
        />
      )}
    </>
  );
};

export default FilterSwaps;
