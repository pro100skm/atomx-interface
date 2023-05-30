import { Currency } from '@uniswap/sdk-core';
import { Text } from 'rebass';
import styled from 'styled-components/macro';
import { COMMON_BASES } from '../../constants/routing';
import { useTokenInfoFromActiveList } from '../../hooks/useTokenInfoFromActiveList';
import { currencyId } from '../../utils/currencyId';
import { AutoColumn } from '../Column';
import CurrencyLogo from '../Common/CurrencyLogo';
import { Span } from '../Common/Span';
import { AutoRow } from '../Row';

const MobileWrapper = styled(AutoColumn)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`;

const BaseWrapper = styled.div<{ disable?: boolean }>`
  border: 1px solid ${({ theme, disable }) => (disable ? 'transparent' : theme.bg3)};
  border-radius: 10px;
  display: flex;
  padding: 6px;

  align-items: center;
  :hover {
    cursor: ${({ disable }) => !disable && 'pointer'};
    background-color: ${({ theme, disable }) => !disable && theme.bg2};
  }

  color: ${({ theme, disable }) => disable && theme.text3};
  background-color: ${({ theme, disable }) => disable && theme.bg3};
  filter: ${({ disable }) => disable && 'grayscale(1)'};
`;

export default function CommonBases({
  selectedChainId,
  onSelect,
  selectedCurrency,
}: {
  selectedChainId?: number;
  selectedCurrency?: Currency | null;
  onSelect: (currency: Currency) => void;
}) {
  const bases = typeof selectedChainId !== 'undefined' ? COMMON_BASES[selectedChainId] ?? [] : [];

  return bases.length > 0 ? (
    <
      //todo MobileWrapper
    >
      <AutoRow>
        <Text fontWeight={500} fontSize={14}>
          <Span>Popular</Span>
        </Text>
        {/*<QuestionHelper text={<Trans>These tokens are commonly paired with other tokens.</Trans>} />*/}
      </AutoRow>
      <AutoRow gap='4px'>
        {bases.map((currency: Currency) => {
          const isSelected = selectedCurrency?.equals(currency);
          return (
            <BaseWrapper
              onClick={() => !isSelected && onSelect(currency)}
              disable={isSelected}
              key={currencyId(currency, selectedChainId)}
            >
              <CurrencyLogoFromList currency={currency} />
              <Text fontWeight={500} fontSize={16}>
                {currency.symbol}
              </Text>
            </BaseWrapper>
          );
        })}
      </AutoRow>
    </>
  ) : null;
}

/** helper component to retrieve a base currency from the active token lists */
function CurrencyLogoFromList({ currency }: { currency: Currency }) {
  const token = useTokenInfoFromActiveList(currency);

  return <CurrencyLogo currency={token} style={{ marginRight: 8 }} />;
}
