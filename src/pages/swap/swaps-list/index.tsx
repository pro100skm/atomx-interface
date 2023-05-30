import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { ButtonPrimary } from '../../../components/Common/Button';
import Div from '../../../components/Common/Div';
import { Flex } from '../../../components/Common/Flex';
import { Wrappers } from '../../../components/Wrappers';
import {
  ALL_SUPPORTED_CHAIN_IDS,
  DEFAULT_SELL_CHAIN_ID,
  NATIVE_CURRENCIES,
} from '../../../constants/chains';
import { ChainId } from '../../../interfaces/connection-config.interface';
import { useDerivedSwapInfo, useSwapActionHandlers } from '../../../store/swap/hooks';
import { shortenAddress } from '../../../utils';
import { Field } from '../components/Form';
import { IURLSwapParams } from '../components/types';
import FilterSwaps from './FilterSwaps';
import SwapCard from './SwapCard';

const Table = styled.table`
  width: 100%;
`;

const TBody = styled.tbody`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Tr = styled.tr`
  display: flex;
  gap: 1rem;
`;

const Td = styled.td`
  width: 8rem;
  display: flex;
  gap: 1rem;
`;

interface IFilterData {
  buyChainId: ChainId;
  buyToken: string;
  sellChainId: ChainId;
  sellToken: string;
}

const initialFilterData: IFilterData = {
  buyChainId: DEFAULT_SELL_CHAIN_ID,
  buyToken: '',
  sellChainId: DEFAULT_SELL_CHAIN_ID,
  sellToken: '',
};

const SwapsList = () => {
  const navigate = useNavigate();
  const urlSearchParams = new URLSearchParams(window.location.search);
  const [filterData, setFilterData] = useState(initialFilterData);
  const { currencies } = useDerivedSwapInfo();
  const { onCurrencySelection } = useSwapActionHandlers();

  const handleSetParams = (key: string, value: string | ChainId) => {
    urlSearchParams.set(key, String(value));
    navigate(`${window.location.pathname}?${urlSearchParams.toString()}`, { replace: true });
  };

  useEffect(() => {
    const dataFromParams: IFilterData = {
      buyChainId: Number(urlSearchParams.get(IURLSwapParams.buyChainId)),
      buyToken: urlSearchParams.get(IURLSwapParams.buyToken) || '',
      sellChainId: Number(urlSearchParams.get(IURLSwapParams.sellChainId)),
      sellToken: urlSearchParams.get(IURLSwapParams.sellToken) || '',
    };

    if (
      !dataFromParams.buyChainId ||
      !ALL_SUPPORTED_CHAIN_IDS.includes(dataFromParams.buyChainId)
    ) {
      handleSetParams(IURLSwapParams.buyChainId, DEFAULT_SELL_CHAIN_ID);
      handleSetParams(IURLSwapParams.buyToken, '');
      toast(<div>Provided unsupported sell Chain ID</div>);
    }

    if (
      !dataFromParams.sellChainId ||
      !ALL_SUPPORTED_CHAIN_IDS.includes(dataFromParams.sellChainId)
    ) {
      handleSetParams(IURLSwapParams.sellChainId, DEFAULT_SELL_CHAIN_ID);
      handleSetParams(IURLSwapParams.sellToken, '');
      toast(<div>Provided unsupported buy Chain ID</div>);
    }

    setFilterData(dataFromParams);
  }, [window.location.search]);

  useEffect(() => {
    if (!filterData.sellToken) return;
    onCurrencySelection(Field.INPUT, filterData.sellToken);
  }, [onCurrencySelection, filterData.sellToken]);

  useEffect(() => {
    if (!filterData.buyToken) return;
    onCurrencySelection(Field.OUTPUT, filterData.buyToken);
  }, [onCurrencySelection, filterData.buyToken]);

  return (
    <Flex flexDirection='column' align='center' gap='1rem'>
      <Wrappers width='50rem'>
        <Flex justify='space-between'>
          <FilterSwaps
            currency={currencies[Field.INPUT]}
            onCurrencySelect={(inputCurrency) =>
              handleSetParams(
                IURLSwapParams.sellToken,
                inputCurrency.isToken
                  ? inputCurrency.address
                  : String(NATIVE_CURRENCIES[filterData.sellChainId as ChainId]),
              )
            }
            otherCurrency={currencies[Field.OUTPUT]}
            tokenType={IURLSwapParams.sellToken}
            selectedChainId={filterData.sellChainId}
          />
          <FilterSwaps
            currency={currencies[Field.OUTPUT]}
            selectedChainId={filterData.buyChainId}
            tokenType={IURLSwapParams.buyToken}
            onCurrencySelect={(inputCurrency) =>
              handleSetParams(
                IURLSwapParams.buyToken,
                inputCurrency.isToken
                  ? inputCurrency.address
                  : String(NATIVE_CURRENCIES[filterData.buyChainId as ChainId]),
              )
            }
            otherCurrency={currencies[Field.INPUT]}
          />
        </Flex>
      </Wrappers>
      <Wrappers width='100%'>
        <Table>
          <TBody>
            <Tr>
              <Td>Advertisers (Completion rate)</Td>
              <Td>Sell</Td>
              <Td>Buy</Td>
            </Tr>
            {[1, 2, 3, 4, 6, 7, 8, 9].map((_, index) => (
              <Tr key={index}>
                <Td>{shortenAddress('0x14e226e85Fd87D9Fbd9aB56C2ad7d8eC39b79C30')}</Td>
                <Td>XDC</Td>
                <Td>BNB</Td>
                <Td>Streetdog</Td>
                <Td>
                  <ButtonPrimary>BUY XDC</ButtonPrimary>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Wrappers>
    </Flex>
  );
};

export default SwapsList;
