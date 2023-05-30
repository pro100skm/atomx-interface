import { CheckCircle, Copy } from 'react-feather';
import styled from 'styled-components/macro';

import { IconButtonWrapper } from '..';
import useCopyClipboard from '../../../../hooks/useCopyClipboard';
import { Span } from '../../Span';
import { MouseoverTooltip } from '../../Tooltip';

const IsCopiedIcon = styled(CheckCircle)`
  stroke: ${({ theme }) => theme.success};
`;

type CopyButtonProps = {
  copyText: string;
  copyTimeout?: number;
  stopPropogation?: boolean;
  size?: string;
};

export function CopyToClipboardButton({
  copyText,
  copyTimeout = 1000,
  stopPropogation,
  size = '16px',
}: CopyButtonProps) {
  const [isCopied, copyToClipboard] = useCopyClipboard(copyTimeout);

  return (
    <IconButtonWrapper
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        if (stopPropogation) event.stopPropagation();

        event.preventDefault();
        copyToClipboard(copyText);
      }}
    >
      <MouseoverTooltip
        text={isCopied ? <Span>Copied</Span> : <Span>Copy Address</Span>}
        placement={'bottom'}
      >
        {isCopied ? <IsCopiedIcon size={size} /> : <Copy size={size} />}
      </MouseoverTooltip>
    </IconButtonWrapper>
  );
}
