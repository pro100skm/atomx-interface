import { Currency } from '@uniswap/sdk-core';
import styled from 'styled-components/macro';
import MetamaskIcon from '../../../../assets/metamask.png';
import { IconButtonWrapper } from '..';
import { MouseoverTooltip } from '../../Tooltip';
import useAddTokenToMetamask from '../../../../hooks/useAddTokenToMetamask';

const AddToMetamaskButtonWrapper = styled(IconButtonWrapper)`
  :focus {
    opacity: 0.8;
  }
  :hover {
    opacity: 0.7;
  }
  :active {
    opacity: 0.5;
  }
  :disabled {
    opacity: 0.3;
  }
`;

type ImgIconProps = { size?: string; darken?: boolean };
const ImgIcon = styled.img<ImgIconProps>`
  ${({ size }) =>
    size &&
    `
  width: ${size};
  height: ${size};
`}
`;

type CopyButtonProps = {
  currency: Currency;
  stopPropogation?: boolean;
  size?: string;
};

export function AddToMetamaskButton({ currency, stopPropogation, size = '16px' }: CopyButtonProps) {
  const { addToken, success: isSuccess } = useAddTokenToMetamask(currency);
  return (
    <AddToMetamaskButtonWrapper
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        if (stopPropogation) event.stopPropagation();

        event.preventDefault();
        addToken();
      }}
      // disabled={Boolean(isSuccess)}
    >
      <MouseoverTooltip text={'Add to Metamask'} placement={'bottom'}>
        <ImgIcon src={MetamaskIcon} alt={'Add to Metamask'} size={size} darken={!!isSuccess} />
      </MouseoverTooltip>
    </AddToMetamaskButtonWrapper>
  );
}
