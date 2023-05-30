import { Token } from '@uniswap/sdk-core';
import { TokenList } from '@uniswap/token-lists';
import { useState } from 'react';
import { ArrowLeft } from 'react-feather';
import { Text } from 'rebass';
import styled from 'styled-components/macro';
import { ChainId } from '../../interfaces/connection-config.interface';
import { CloseIcon } from '../../theme';
import { Span } from '../Common/Span';
import { RowBetween } from '../Row';

import { CurrencyModalView } from './CurrencySearchModal';
import { ManageLists } from './ManageLists';
import ManageTokens from './ManageTokens';
import { PaddedColumn, Separator } from './styleds';

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  padding-bottom: 80px;
`;

const ToggleWrapper = styled(RowBetween)`
  background-color: ${({ theme }) => theme.bg3};
  border-radius: 12px;
  padding: 6px;
`;

const ToggleOption = styled.div<{ active?: boolean }>`
  width: 48%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 600;
  background-color: ${({ theme, active }) => (active ? theme.bg1 : theme.bg3)};
  color: ${({ theme, active }) => (active ? theme.text1 : theme.text2)};
  user-select: none;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`;

export default function Manage({
  onDismiss,
  setModalView,
  setImportList,
  setImportToken,
  setListUrl,
  selectedChainId,
}: {
  onDismiss: () => void;
  setModalView: (view: CurrencyModalView) => void;
  setImportToken: (token: Token) => void;
  setImportList: (list: TokenList) => void;
  setListUrl: (url: string) => void;
  selectedChainId: ChainId;
}) {
  // toggle between tokens and lists
  const [showLists, setShowLists] = useState(true);

  return (
    <Wrapper>
      <PaddedColumn>
        <RowBetween>
          <ArrowLeft
            style={{ cursor: 'pointer' }}
            onClick={() => setModalView(CurrencyModalView.search)}
          />
          <Text fontWeight={500} fontSize={20}>
            <Span>Manage</Span>
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
      </PaddedColumn>
      <Separator />
      <PaddedColumn style={{ paddingBottom: 0 }}>
        <ToggleWrapper>
          <ToggleOption onClick={() => setShowLists(!showLists)} active={showLists}>
            <Span>Lists</Span>
          </ToggleOption>
          <ToggleOption onClick={() => setShowLists(!showLists)} active={!showLists}>
            <Span>Tokens</Span>
          </ToggleOption>
        </ToggleWrapper>
      </PaddedColumn>
      {showLists ? (
        <ManageLists
          setModalView={setModalView}
          setImportList={setImportList}
          setListUrl={setListUrl}
          selectedChainId={selectedChainId}
        />
      ) : (
        <ManageTokens
          setModalView={setModalView}
          setImportToken={setImportToken}
          selectedChainId={selectedChainId}
        />
      )}
    </Wrapper>
  );
}
