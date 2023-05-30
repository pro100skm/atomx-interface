import { Token } from '@uniswap/sdk-core';
import { RefObject, useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components/macro';
import { useToken } from '../../hooks/Tokens';
import useTheme from '../../hooks/useTheme';
import { ChainId } from '../../interfaces/connection-config.interface';
import { useRemoveUserAddedToken, useUserAddedTokens } from '../../store/user/hooks';
import { ExternalLink, ExternalLinkIcon, ThemedText, TrashIcon } from '../../theme';
import { isAddress } from '../../utils';
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink';
import Card from '../Card';
import Column from '../Column';
import { ButtonText } from '../Common/Button';
import CurrencyLogo from '../Common/CurrencyLogo';
import { Span } from '../Common/Span';
import Row, { RowBetween, RowFixed } from '../Row';
import { CurrencyModalView } from './CurrencySearchModal';
import ImportRow from './ImportRow';
import { PaddedColumn, SearchInput, Separator } from './styleds';

const Wrapper = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  position: relative;
  padding-bottom: 80px;
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  border-radius: 20px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  border-top: 1px solid ${({ theme }) => theme.bg3};
  padding: 20px;
  text-align: center;
`;

export default function ManageTokens({
  setModalView,
  setImportToken,
  selectedChainId,
}: {
  setModalView: (view: CurrencyModalView) => void;
  setImportToken: (token: Token) => void;
  selectedChainId: ChainId;
}) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const theme = useTheme();

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();
  const handleInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const checksummedInput = isAddress(input);
    setSearchQuery(checksummedInput || input);
  }, []);

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery);
  const searchToken = useToken(selectedChainId, searchQuery);

  // all tokens for local lisr
  const userAddedTokens: Token[] = useUserAddedTokens(selectedChainId);
  const removeToken = useRemoveUserAddedToken();

  const handleRemoveAll = useCallback(() => {
    if (selectedChainId && userAddedTokens) {
      userAddedTokens.map((token) => {
        return removeToken(selectedChainId, token.address);
      });
    }
  }, [removeToken, userAddedTokens, selectedChainId]);

  const tokenList = useMemo(() => {
    return (
      selectedChainId &&
      userAddedTokens.map((token) => (
        <RowBetween key={token.address} width='100%'>
          <RowFixed>
            <CurrencyLogo currency={token} size={'20px'} />
            <ExternalLink
              href={getExplorerLink(selectedChainId, token.address, ExplorerDataType.ADDRESS)}
            >
              <ThemedText.Main ml={'10px'} fontWeight={600}>
                {token.symbol}
              </ThemedText.Main>
            </ExternalLink>
          </RowFixed>
          <RowFixed>
            <TrashIcon onClick={() => removeToken(selectedChainId, token.address)} />
            <ExternalLinkIcon
              href={getExplorerLink(selectedChainId, token.address, ExplorerDataType.ADDRESS)}
            />
          </RowFixed>
        </RowBetween>
      ))
    );
  }, [userAddedTokens, selectedChainId, removeToken]);

  return (
    <Wrapper>
      <Column style={{ width: '100%', height: '100%', flex: '1 1' }}>
        <PaddedColumn gap='14px'>
          <Row>
            <SearchInput
              type='text'
              id='token-search-input'
              placeholder={'0x0000'}
              value={searchQuery}
              autoComplete='off'
              ref={inputRef as RefObject<HTMLInputElement>}
              onChange={handleInput}
            />
          </Row>
          {searchQuery !== '' && !isAddressSearch && (
            <ThemedText.Error error={true}>
              <Span>Enter valid token address</Span>
            </ThemedText.Error>
          )}
          {searchToken && (
            <Card backgroundColor={theme.bg2} padding='10px 0'>
              <ImportRow
                selectedChainId={selectedChainId}
                token={searchToken}
                showImportView={() => setModalView(CurrencyModalView.importToken)}
                setImportToken={setImportToken}
                style={{ height: 'fit-content' }}
              />
            </Card>
          )}
        </PaddedColumn>
        <Separator />
        <PaddedColumn gap='lg' style={{ overflow: 'auto', marginBottom: '10px' }}>
          <RowBetween>
            <ThemedText.Main fontWeight={600}>
              <Span>{userAddedTokens?.length} Custom Tokens</Span>
            </ThemedText.Main>
            {userAddedTokens.length > 0 && (
              <ButtonText onClick={handleRemoveAll}>
                <ThemedText.Blue>
                  <Span>Clear all</Span>
                </ThemedText.Blue>
              </ButtonText>
            )}
          </RowBetween>
          {tokenList}
        </PaddedColumn>
      </Column>
      <Footer>
        <ThemedText.DarkGray>
          <Span>Tip: Custom tokens are stored locally in your browser</Span>
        </ThemedText.DarkGray>
      </Footer>
    </Wrapper>
  );
}
