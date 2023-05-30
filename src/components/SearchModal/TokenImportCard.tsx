import { Token } from '@uniswap/sdk-core';
import { TokenList } from '@uniswap/token-lists';
import { transparentize } from 'polished';
import { AlertCircle } from 'react-feather';
import styled, { useTheme } from 'styled-components/macro';
import { ExternalLink, ThemedText } from '../../theme';
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink';
import Card from '../Card';
import { AutoColumn } from '../Column';
import CurrencyLogo from '../Common/CurrencyLogo';
import ListLogo from '../Common/ListLogo';
import { Span } from '../Common/Span';
import { RowFixed } from '../Row';

const WarningWrapper = styled(Card)<{ highWarning: boolean }>`
  background-color: ${({ theme, highWarning }) =>
    highWarning ? transparentize(0.8, theme.red1) : transparentize(0.8, theme.yellow2)};
  width: fit-content;
`;

const AddressText = styled(ThemedText.Blue)`
  font-size: 12px;
  word-break: break-all;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
  `}
`;
interface TokenImportCardProps {
  list?: TokenList;
  token: Token;
}
const TokenImportCard = ({ list, token }: TokenImportCardProps) => {
  const theme = useTheme();
  return (
    <Card backgroundColor={theme.bg2} padding='2rem'>
      <AutoColumn gap='10px' justify='center'>
        <CurrencyLogo currency={token} size={'32px'} />
        <AutoColumn gap='4px' justify='center'>
          <ThemedText.Body ml='8px' mr='8px' fontWeight={500} fontSize={20}>
            {token.symbol}
          </ThemedText.Body>
          <ThemedText.DarkGray fontWeight={400} fontSize={14}>
            {token.name}
          </ThemedText.DarkGray>
        </AutoColumn>
        {token.chainId && (
          <ExternalLink
            href={getExplorerLink(token.chainId, token.address, ExplorerDataType.ADDRESS)}
          >
            <AddressText fontSize={12}>{token.address}</AddressText>
          </ExternalLink>
        )}
        {list !== undefined ? (
          <RowFixed>
            {list.logoURI && <ListLogo logoURI={list.logoURI} size='16px' />}
            <ThemedText.Small ml='6px' fontSize={14} color={theme.text3}>
              <Span>via {list.name} token list</Span>
            </ThemedText.Small>
          </RowFixed>
        ) : (
          <WarningWrapper $borderRadius='4px' padding='4px' highWarning={true}>
            <RowFixed>
              <AlertCircle stroke={theme.red1} size='10px' />
              <ThemedText.Body color={theme.red1} ml='4px' fontSize='10px' fontWeight={500}>
                <Span>Unknown Source</Span>
              </ThemedText.Body>
            </RowFixed>
          </WarningWrapper>
        )}
      </AutoColumn>
    </Card>
  );
};

export default TokenImportCard;
