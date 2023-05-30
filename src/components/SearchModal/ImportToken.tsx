import { Currency, Token } from '@uniswap/sdk-core';
import { TokenList } from '@uniswap/token-lists';
import { AlertCircle, ArrowLeft } from 'react-feather';
import styled from 'styled-components/macro';
import { useUnsupportedTokens } from '../../hooks/Tokens';
import useTheme from '../../hooks/useTheme';
import { useAddUserToken } from '../../store/user/hooks';
import { CloseIcon, ThemedText } from '../../theme';
import { RowBetween } from '../Row';
import BlockedToken from './BlockedToken';
import { PaddedColumn } from './styleds';
import TokenImportCard from './TokenImportCard';
import { SectionBreak } from './ImportList';
import { Span } from '../Common/Span';
import { AutoColumn } from '../Column';
import { ButtonPrimary } from '../Common/Button';
import { ChainId } from '../../interfaces/connection-config.interface';

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: auto;
`;

interface ImportProps {
  selectedChainId: ChainId;
  tokens: Token[];
  list?: TokenList;
  onBack?: () => void;
  onDismiss?: () => void;
  handleCurrencySelect?: (currency: Currency) => void;
}

export function ImportToken(props: ImportProps) {
  const { tokens, list, onBack, onDismiss, handleCurrencySelect, selectedChainId } = props;
  const theme = useTheme();

  const addToken = useAddUserToken();

  const unsupportedTokens = useUnsupportedTokens(selectedChainId);
  const unsupportedSet = new Set(Object.keys(unsupportedTokens));
  const intersection = new Set(tokens.filter((token) => unsupportedSet.has(token.address)));
  if (intersection.size > 0) {
    return (
      <BlockedToken
        onBack={onBack}
        onDismiss={onDismiss}
        blockedTokens={Array.from(intersection)}
      />
    );
  }
  return (
    <Wrapper>
      <PaddedColumn gap='14px' style={{ width: '100%', flex: '1 1' }}>
        <RowBetween>
          {onBack ? <ArrowLeft style={{ cursor: 'pointer' }} onClick={onBack} /> : <div />}
          <ThemedText.MediumHeader>
            <Span>Import token</Span>
          </ThemedText.MediumHeader>
          {onDismiss ? <CloseIcon onClick={onDismiss} /> : <div />}
        </RowBetween>
      </PaddedColumn>
      <SectionBreak />
      <AutoColumn gap='md' style={{ marginBottom: '32px', padding: '1rem' }}>
        <AutoColumn justify='center' style={{ textAlign: 'center', gap: '16px', padding: '1rem' }}>
          <AlertCircle size={48} stroke={theme.text2} strokeWidth={1} />
          <ThemedText.Body fontWeight={400} fontSize={16}>
            <Span>
              This token doesn&apos;t appear on the active token list(s). Make sure this is the
              token that you want to trade.
            </Span>
          </ThemedText.Body>
        </AutoColumn>
        {tokens.map((token) => (
          <TokenImportCard token={token} list={list} key={'import' + token.address} />
        ))}
        <ButtonPrimary
          altDisabledStyle={true}
          $borderRadius='20px'
          padding='10px 1rem'
          onClick={() => {
            tokens.map((token) => addToken(token));
            handleCurrencySelect && handleCurrencySelect(tokens[0]);
          }}
          className='.token-dismiss-button'
        >
          Import
        </ButtonPrimary>
      </AutoColumn>
    </Wrapper>
  );
}
