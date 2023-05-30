// eslint-disable-next-line no-restricted-imports
import { Currency, Token } from '@uniswap/sdk-core';
import React, {
  KeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Edit } from 'react-feather';
import { FixedSizeList } from 'react-window';
import { Text } from 'rebass';
import styled from 'styled-components/macro';
import ReactGA from 'react-ga';
import {
  useAllTokens,
  useIsUserAddedToken,
  useSearchInactiveTokenLists,
  useToken,
} from '../../hooks/Tokens';
import useDebounce from '../../hooks/useDebounce';
import useTheme from '../../hooks/useTheme';
import { ButtonText, CloseIcon, IconWrapper, ThemedText } from '../../theme';
import { isAddress } from '../../utils';
import Column from '../Column';
import { Span } from '../Common/Span';
import Row, { RowBetween, RowFixed } from '../Row';
import CommonBases from './CommonBases';
import CurrencyList from './CurrencyList';
import { filterTokens, useSortedTokensByQuery } from './filtering';
import ImportRow from './ImportRow';
import { useTokenComparator } from './sorting';
import { PaddedColumn, SearchInput, Separator } from './styleds';
import useToggle from '../../hooks/useToggle';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { useLocation, useNavigate } from 'react-router-dom';
import { IURLSwapParams } from '../../pages/swap/components/types';
import { useSwapChainInfo } from '../../hooks/useSwapChainInfo';
import { useExtendedCurrency } from '../../hooks/UseExtendedCurrency';
import { ChainId } from '../../interfaces/connection-config.interface';

const ContentWrapper = styled(Column)`
  width: 100%;
  flex: 1 1;
  position: relative;
`;

const Footer = styled.div`
  width: 100%;
  border-radius: 20px;
  padding: 20px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: ${({ theme }) => theme.bg1};
  border-top: 1px solid ${({ theme }) => theme.bg2};
`;

interface CurrencySearchProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherSelectedCurrency?: Currency | null;
  showCommonBases?: boolean;
  showCurrencyAmount?: boolean;
  disableNonToken?: boolean;
  showManageView: () => void;
  showImportView: () => void;
  setImportToken: (token: Token) => void;
  tokenType: IURLSwapParams.sellToken | IURLSwapParams.buyToken;
  selectedChainId: ChainId;
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  onDismiss,
  isOpen,
  showManageView,
  showImportView,
  setImportToken,
  tokenType,
  selectedChainId,
}: CurrencySearchProps) {
  const theme = useTheme();

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedQuery = useDebounce(searchQuery, 200);

  const [invertSearchOrder] = useState<boolean>(false);

  const allTokens = useAllTokens(selectedChainId);
  // if they input an address, use it
  const isAddressSearch = isAddress(debouncedQuery);

  const searchToken = useToken(selectedChainId, debouncedQuery);

  const searchTokenIsAdded = useIsUserAddedToken(searchToken, selectedChainId);
  const { search } = useLocation();
  const navigate = useNavigate();
  const urlSearchParams = new URLSearchParams(search);

  const ExtendedCurrency = useExtendedCurrency(selectedChainId);

  useEffect(() => {
    if (isAddressSearch) {
      ReactGA.event({
        category: 'Currency Select',
        action: 'Search by address',
        label: isAddressSearch,
      });
    }
  }, [isAddressSearch]);

  const tokenComparator = useTokenComparator(invertSearchOrder, selectedChainId);

  const filteredTokens: Token[] = useMemo(() => {
    return filterTokens(Object.values(allTokens), debouncedQuery);
  }, [allTokens, debouncedQuery]);

  const sortedTokens: Token[] = useMemo(() => {
    return filteredTokens.sort(tokenComparator);
  }, [filteredTokens, tokenComparator]);

  const filteredSortedTokens = useSortedTokensByQuery(sortedTokens, debouncedQuery);

  const ether = useMemo(
    () => selectedChainId && ExtendedCurrency && ExtendedCurrency.onChain(selectedChainId),
    [selectedChainId, ExtendedCurrency],
  );

  const filteredSortedTokensWithETH: Currency[] = useMemo(() => {
    const s = debouncedQuery.toLowerCase().trim();
    if (s === '' || s === 'x' || s === 'xd' || s === 'xdc') {
      return ether ? [ether, ...filteredSortedTokens] : filteredSortedTokens;
    }
    return filteredSortedTokens;
  }, [debouncedQuery, ether, filteredSortedTokens]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
      onDismiss();
    },
    [onDismiss, onCurrencySelect],
  );

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('');
  }, [isOpen]);

  useEffect(() => {
    const input = String(urlSearchParams.get(tokenType));
    const checksummedInput = isAddress(input);
    setSearchQuery(checksummedInput || input);
    fixedList.current?.scrollTo(0);
  }, [search]);

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();
  const handleInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    urlSearchParams.set(tokenType, input);
    navigate(`${window.location.pathname}?${urlSearchParams.toString()}`, { replace: true });
  }, []);

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = debouncedQuery.toLowerCase().trim();
        if (s === 'xdc' && ether) {
          handleCurrencySelect(ether);
        } else if (filteredSortedTokensWithETH.length > 0) {
          if (
            filteredSortedTokensWithETH[0].symbol?.toLowerCase() ===
              debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokensWithETH.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokensWithETH[0]);
          }
        }
      }
    },
    [debouncedQuery, ether, filteredSortedTokensWithETH, handleCurrencySelect],
  );

  // menu ui
  const [open, toggle] = useToggle(false);
  const node = useRef<HTMLDivElement>();
  useOnClickOutside(node, open ? toggle : undefined);

  // if no results on main list, show option to expand into inactive
  const filteredInactiveTokens = useSearchInactiveTokenLists(
    filteredTokens.length === 0 || (debouncedQuery.length > 2 && !isAddressSearch)
      ? debouncedQuery
      : undefined,
    selectedChainId,
  );
  return (
    <ContentWrapper>
      <PaddedColumn gap='16px'>
        <RowBetween>
          <Text fontWeight={500} fontSize={16}>
            <Span>Select a token</Span>
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <Row>
          <SearchInput
            type='text'
            id='token-search-input'
            placeholder={`Search name or paste address`}
            autoComplete='off'
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
            onKeyDown={handleEnter}
          />
        </Row>
        {showCommonBases && (
          <CommonBases
            selectedChainId={selectedChainId}
            onSelect={handleCurrencySelect}
            selectedCurrency={selectedCurrency}
          />
        )}
      </PaddedColumn>
      <Separator />
      {searchToken && !searchTokenIsAdded ? (
        <Column style={{ padding: '20px 0', height: '100%' }}>
          <ImportRow
            token={searchToken}
            showImportView={showImportView}
            setImportToken={setImportToken}
            selectedChainId={selectedChainId}
          />
        </Column>
      ) : filteredSortedTokens?.length > 0 || filteredInactiveTokens?.length > 0 ? (
        <div style={{ flex: '1' }}>
          .
          {/* <AutoSizer>
            {({ height }: { height: number }) => ( */}
          <>
            <CurrencyList
              selectedChainId={selectedChainId}
              height={150}
              currencies={disableNonToken ? filteredSortedTokens : filteredSortedTokensWithETH}
              otherListTokens={filteredInactiveTokens}
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={otherSelectedCurrency}
              selectedCurrency={selectedCurrency}
              fixedListRef={fixedList}
              showImportView={showImportView}
              setImportToken={setImportToken}
              showCurrencyAmount={showCurrencyAmount}
            />
          </>
          {/* )}
          </AutoSizer> */}
        </div>
      ) : (
        <Column style={{ padding: '20px', height: '100%' }}>
          <ThemedText.Main color={theme.text3} textAlign='center' mb='20px'>
            <Span>No results found.</Span>
          </ThemedText.Main>
        </Column>
      )}
      <Footer>
        <Row justify='center'>
          <ButtonText
            onClick={showManageView}
            color={theme.primary1}
            className='list-token-manage-button'
          >
            <RowFixed>
              <IconWrapper size='16px' marginRight='6px' stroke={theme.primaryText1}>
                <Edit />
              </IconWrapper>
              <ThemedText.Main color={theme.primaryText1}>
                <Span>Manage Token Lists</Span>
              </ThemedText.Main>
            </RowFixed>
          </ButtonText>
        </Row>
      </Footer>
    </ContentWrapper>
  );
}
