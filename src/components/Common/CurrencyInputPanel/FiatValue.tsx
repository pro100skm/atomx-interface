// eslint-disable-next-line no-restricted-imports
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import useTheme from '../../../hooks/useTheme';
import { ThemedText } from '../../../theme';
import { warningSeverity } from '../../../utils/prices';
import HoverInlineText from '../HoverInlineText';
import { Span } from '../Span';
import { MouseoverTooltip } from '../Tooltip';

export function FiatValue({
  fiatValue,
  priceImpact,
}: {
  fiatValue: CurrencyAmount<Currency> | null | undefined;
  priceImpact?: Percent;
}) {
  const theme = useTheme();
  const priceImpactColor = useMemo(() => {
    if (!priceImpact) return undefined;
    if (priceImpact.lessThan('0')) return theme.green1;
    const severity = warningSeverity(priceImpact);
    if (severity < 1) return theme.text3;
    if (severity < 3) return theme.yellow1;
    return theme.red1;
  }, [priceImpact, theme.green1, theme.red1, theme.text3, theme.yellow1]);

  return (
    <ThemedText.Body fontSize={14} color={fiatValue ? theme.text3 : theme.text4}>
      {fiatValue ? (
        <Span>
          $
          <HoverInlineText
            text={fiatValue?.toSignificant(6, { groupSeparator: ',' })}
            textColor={fiatValue ? theme.text3 : theme.text4}
          />
        </Span>
      ) : (
        ''
      )}
      {priceImpact ? (
        <span style={{ color: priceImpactColor }}>
          <MouseoverTooltip
            text={`The estimated difference between the USD values of input and output amounts.`}
          >
            (<Span>{priceImpact.multiply(-1).toSignificant(3)}%</Span>)
          </MouseoverTooltip>
        </span>
      ) : null}
    </ThemedText.Body>
  );
}
